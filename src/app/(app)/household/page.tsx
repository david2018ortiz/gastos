import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageTitleBar } from "@/components/page-title-bar";
import { CreateHouseholdForm } from "./create-household-form";
import { InviteForm } from "./invite-form";
import { HouseholdSettings } from "./household-settings";
import { acceptInvitation, declineInvitation, leaveHousehold, removeMember } from "./actions";

export default async function HouseholdPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: memberships }, { data: incomingInvitations }] =
    await Promise.all([
      supabase
        .from("household_members")
        .select("household_id, role, households(id, name, created_by)")
        .eq("user_id", user.id),
      supabase
        .from("household_invitations")
        .select("id, invited_email, invited_by, created_at, households(name)")
        .eq("status", "pending"),
    ]);

  // Invitaciones dirigidas a mi correo (RLS ya filtra esto, pero además
  // descartamos las que yo mismo envié para no mezclarlas).
  const myIncoming = (incomingInvitations ?? []).filter(
    (inv) => inv.invited_by !== user.id,
  );

  const households = (memberships ?? [])
    .map((m) => m.households)
    .filter((h): h is NonNullable<typeof h> => Boolean(h));

  // Para cada household del que soy dueño, traigo sus miembros e
  // invitaciones enviadas pendientes. household_members y profiles no
  // tienen una FK declarada entre sí (ambas apuntan a auth.users por
  // separado), así que PostgREST no puede unirlas automáticamente —
  // se hace en dos pasos.
  const householdDetails = await Promise.all(
    households.map(async (h) => {
      const isOwner = h.created_by === user.id;
      const [{ data: members }, { data: sentInvitations }] = await Promise.all(
        [
          supabase
            .from("household_members")
            .select("user_id, role")
            .eq("household_id", h.id),
          isOwner
            ? supabase
                .from("household_invitations")
                .select("id, invited_email, status")
                .eq("household_id", h.id)
                .eq("status", "pending")
            : Promise.resolve({ data: [] as { id: string; invited_email: string; status: string }[] }),
        ],
      );

      const memberIds = (members ?? []).map((m) => m.user_id);
      const { data: memberProfiles } =
        memberIds.length > 0
          ? await supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", memberIds)
          : { data: [] as { id: string; full_name: string | null }[] };

      const nameById = new Map(
        (memberProfiles ?? []).map((p) => [p.id, p.full_name]),
      );

      return {
        household: h,
        isOwner,
        members: (members ?? []).map((m) => ({
          ...m,
          fullName: nameById.get(m.user_id) ?? null,
        })),
        sentInvitations: sentInvitations ?? [],
      };
    }),
  );

  return (
    <main className="flex-1 p-5">
      <div className="mx-auto max-w-sm space-y-6">
        <PageTitleBar title="Familia" userId={user.id} />

        {myIncoming.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-ink-secondary">
              Invitaciones para ti
            </h2>
            <ul className="space-y-2">
              {myIncoming.map((inv) => (
                <li
                  key={inv.id}
                  className="space-y-2 rounded-lg border border-brand bg-brand-soft p-3"
                >
                  <p className="text-sm">
                    Te invitaron a{" "}
                    <span className="font-medium">
                      {inv.households?.name ?? "un espacio compartido"}
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <form action={acceptInvitation}>
                      <input type="hidden" name="invitationId" value={inv.id} />
                      <button
                        type="submit"
                        className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-brand-ink"
                      >
                        Aceptar
                      </button>
                    </form>
                    <form action={declineInvitation}>
                      <input type="hidden" name="invitationId" value={inv.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-border px-3 py-1.5 text-xs text-ink-secondary"
                      >
                        Rechazar
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {householdDetails.length === 0 ? (
          <section className="space-y-3">
            <p className="text-sm text-ink-secondary">
              Aún no tienes un espacio compartido. Créalo para llevar
              ingresos, gastos, deudas y ahorro junto con tu familia.
            </p>
            <CreateHouseholdForm />
          </section>
        ) : (
          householdDetails.map(({ household, isOwner, members, sentInvitations }) => (
            <section key={household.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{household.name}</h2>
                {!isOwner && (
                  <form action={leaveHousehold}>
                    <input type="hidden" name="householdId" value={household.id} />
                    <button
                      type="submit"
                      className="text-xs text-negative underline"
                    >
                      Salir
                    </button>
                  </form>
                )}
              </div>

              {isOwner && (
                <HouseholdSettings householdId={household.id} name={household.name} />
              )}

              <div className="space-y-1.5">
                <p className="text-xs text-ink-muted">Miembros</p>
                <ul className="space-y-1">
                  {members.map((m) => (
                    <li
                      key={m.user_id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {m.fullName || "Sin nombre"}
                        {m.role === "owner" && (
                          <span className="ml-1.5 text-xs text-ink-muted">
                            (dueño)
                          </span>
                        )}
                      </span>
                      {isOwner && m.user_id !== user.id && (
                        <form action={removeMember}>
                          <input type="hidden" name="householdId" value={household.id} />
                          <input type="hidden" name="userId" value={m.user_id} />
                          <button
                            type="submit"
                            className="text-xs text-negative underline"
                          >
                            Quitar
                          </button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {isOwner && (
                <div className="space-y-2 border-t border-border pt-3">
                  <p className="text-xs text-ink-muted">Invitar a alguien</p>
                  <InviteForm householdId={household.id} />
                  {sentInvitations.length > 0 && (
                    <ul className="space-y-1 pt-1">
                      {sentInvitations.map((inv) => (
                        <li
                          key={inv.id}
                          className="text-xs text-ink-muted"
                        >
                          Pendiente: {inv.invited_email}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageTransition } from "@/components/page-transition";
import { RealtimeRefresher } from "@/components/realtime-refresher";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <RealtimeRefresher userId={user.id} />
      <PageTransition>{children}</PageTransition>
    </div>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Option = { id: string; name: string };

function IconSelect({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const selected = options.find((o) => o.id === value);

  return (
    <div
      className={
        "relative inline-flex h-8 items-center gap-1 rounded-full border text-xs " +
        (selected
          ? "border-brand bg-brand-soft pl-2 pr-5 text-ink"
          : "border-border pl-1.5 pr-4 text-ink-muted")
      }
    >
      <span aria-hidden="true">{icon}</span>
      {selected && <span className="max-w-16 truncate">{selected.name}</span>}
      <span className="pointer-events-none absolute right-1.5 text-[9px]" aria-hidden="true">
        ▾
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FilterBar({
  categories,
  tags,
}: {
  categories: Option[];
  tags: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <IconSelect
        icon="🗂️"
        label="Categoría"
        value={searchParams.get("category") ?? ""}
        options={categories}
        onChange={(v) => setParam("category", v)}
      />
      <IconSelect
        icon="🏷️"
        label="Etiqueta"
        value={searchParams.get("tag") ?? ""}
        options={tags}
        onChange={(v) => setParam("tag", v)}
      />
    </div>
  );
}

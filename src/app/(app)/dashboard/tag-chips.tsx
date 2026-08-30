import { colorForId } from "@/lib/chart-colors";

export type TagChipDatum = {
  id: string;
  name: string;
};

export function TagChips({ tags }: { tags: TagChipDatum[] }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const color = colorForId(tag.id);
        return (
          <span
            key={tag.id}
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
            style={{ borderColor: color + "40" }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {tag.name}
          </span>
        );
      })}
    </div>
  );
}

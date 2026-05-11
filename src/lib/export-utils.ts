export type ExportItem = {
  url: string;
  canonicalUrl: string;
  source: "x" | "reddit" | "instagram" | "link";
  sourceItemId?: string;
  title?: string;
  description?: string;
  note?: string;
  tags?: string[];
  authorName?: string;
  authorHandle?: string;
  text?: string;
  mediaUrl?: string;
};

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsJson(items: ExportItem[]) {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    count: items.length,
    items,
  };
  const json = JSON.stringify(payload, null, 2);
  triggerDownload(json, `collectr-export-${Date.now()}.json`, "application/json");
}

const CSV_COLUMNS = [
  "url",
  "canonicalUrl",
  "source",
  "sourceItemId",
  "title",
  "description",
  "note",
  "tags",
  "authorName",
  "authorHandle",
  "text",
  "mediaUrl",
] as const;

function escapeCsvField(value: string | undefined | null): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportAsCsv(items: ExportItem[]) {
  const header = CSV_COLUMNS.join(",");
  const rows = items.map((item) =>
    CSV_COLUMNS.map((col) => {
      const val = item[col as keyof ExportItem];
      if (col === "tags" && Array.isArray(val)) {
        return escapeCsvField(val.join(";"));
      }
      return escapeCsvField(val as string);
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  triggerDownload(csv, `collectr-export-${Date.now()}.csv`, "text/csv");
}

export function parseImportJson(text: string): ExportItem[] {
  const data = JSON.parse(text);

  let items: unknown[];
  if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === "object" && Array.isArray(data.items)) {
    items = data.items;
  } else {
    throw new Error("Invalid file format: expected { items: [...] } or an array");
  }

  const validSources = new Set(["x", "reddit", "instagram", "link"]);

  return items
    .filter((item): item is Record<string, unknown> => {
      if (!item || typeof item !== "object") return false;
      const rec = item as Record<string, unknown>;
      return typeof rec.canonicalUrl === "string" && typeof rec.source === "string";
    })
    .map((item) => ({
      url: String(item.url ?? item.canonicalUrl),
      canonicalUrl: String(item.canonicalUrl),
      source: validSources.has(String(item.source)) ? (String(item.source) as ExportItem["source"]) : "link",
      sourceItemId: item.sourceItemId ? String(item.sourceItemId) : undefined,
      title: item.title ? String(item.title) : undefined,
      description: item.description ? String(item.description) : undefined,
      note: item.note ? String(item.note) : undefined,
      tags: Array.isArray(item.tags) ? item.tags.map(String) : undefined,
      authorName: item.authorName ? String(item.authorName) : undefined,
      authorHandle: item.authorHandle ? String(item.authorHandle) : undefined,
      text: item.text ? String(item.text) : undefined,
      mediaUrl: item.mediaUrl ? String(item.mediaUrl) : undefined,
    }));
}

const fs = require('fs');

const p = 'src/components/command-palette.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  'import type { Doc } from "../../convex/_generated/dataModel";',
  'import type { Doc } from "../../convex/_generated/dataModel";\nimport { Surface } from "./system/primitives/surface";\nimport { Pill } from "./system/primitives/pill";'
);

c = c.replace(
  /<div\s+role="dialog"\s+aria-modal="true"\s+aria-label="Command palette"\s+className="relative z-10 w-full max-w-xl mx-4 rounded-xl border border-border bg-popover shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"\s*>/,
  '<Surface variant="overlay" radius="lg" padding="none" role="dialog" aria-modal="true" aria-label="Command palette" className="relative z-10 w-full max-w-xl mx-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 overflow-hidden">'
);

c = c.replace(
  /<\/div>\n    <\/div>\n  \);\n}\n\nfunction CommandItem/,
  '</Surface>\n    </div>\n  );\n}\n\nfunction CommandItem'
);

c = c.replace(
  /<div className="flex items-center border-b border-border px-4">/,
  '<div className="flex items-center border-b border-line dark:border-dark-border px-4 bg-panel/50 dark:bg-charcoal/50">'
);

c = c.replace(
  /<Search className="size-4 shrink-0 text-muted-foreground" \/>/,
  '<Search className="size-5 shrink-0 text-ink/50 dark:text-primary/50" />'
);

c = c.replace(
  /className="flex h-12 w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"/,
  'className="flex h-[52px] w-full bg-transparent px-4 py-2 text-[15px] font-medium text-ink dark:text-primary outline-none placeholder:text-ink/40 dark:placeholder:text-primary/40"'
);

c = c.replace(
  /<kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-\[10px\] font-medium text-muted-foreground shrink-0">/,
  '<kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded-md border border-line-strong dark:border-dark-border bg-black/5 dark:bg-white/5 px-2 font-mono text-[10px] font-medium text-ink/60 dark:text-primary/60 shrink-0">'
);

c = c.replace(
  /<div className="px-2\.5 py-1\.5 text-\[11px\] font-medium text-muted-foreground uppercase tracking-wider">/g,
  '<div className="px-3 py-2 text-[10px] font-bold text-ink/40 dark:text-primary/40 uppercase tracking-widest">'
);

c = c.replace(
  /<div className="px-2\.5 py-1\.5 mt-1 text-\[11px\] font-medium text-muted-foreground uppercase tracking-wider">/,
  '<div className="px-3 py-2 mt-2 text-[10px] font-bold text-ink/40 dark:text-primary/40 uppercase tracking-widest">'
);

c = c.replace(
  /<div className="border-t border-border px-4 py-2 flex items-center gap-3 text-\[11px\] text-muted-foreground">/g,
  '<div className="border-t border-line dark:border-dark-border px-4 py-3 flex items-center gap-4 text-[11px] font-medium text-ink/50 dark:text-primary/50 bg-black/5 dark:bg-white/5">'
);

c = c.replace(
  /<kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-\[10px\]">/g,
  '<kbd className="inline-flex h-5 items-center rounded-md border border-line-strong dark:border-dark-border bg-white/50 dark:bg-charcoal/50 px-1.5 font-mono text-[10px]">'
);

c = c.replace(
  /className={cn\(\n        "flex w-full items-center gap-3 rounded-lg px-2\.5 py-2 text-sm transition-colors duration-75 text-left",\n        active\n          \? "bg-accent text-accent-foreground"\n          : "text-foreground hover:bg-accent\/50"\n      \)}/,
  'className={cn(\n        "flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors duration-75 text-left",\n        active\n          ? "bg-butter text-[#312719]"\n          : "text-ink dark:text-primary hover:bg-black/5 dark:hover:bg-white/5"\n      )}'
);

c = c.replace(
  /<span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">/,
  '<span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full transition-colors", active ? "bg-white/40 text-[#312719]" : "bg-black/5 dark:bg-white/10 text-ink/60 dark:text-primary/60")}>'
);

c = c.replace(
  /<div className="font-medium truncate">{item\.label}<\/div>/,
  '<div className="font-semibold truncate tracking-tight">{item.label}</div>'
);

c = c.replace(
  /<div className="text-xs text-muted-foreground truncate">/,
  '<div className={cn("text-[13px] truncate mt-0.5", active ? "text-[#312719]/70" : "text-ink/50 dark:text-primary/50")}>'
);

c = c.replace(
  /<span className="flex items-center gap-1 shrink-0">/,
  '<span className="flex items-center gap-1 shrink-0 ml-2">'
);

c = c.replace(
  /className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-\[10px\] font-medium text-muted-foreground"/,
  'className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-md border px-1 font-mono text-[10px] font-medium", active ? "border-[#312719]/20 bg-white/30 text-[#312719]" : "border-line-strong dark:border-dark-border bg-white/50 dark:bg-charcoal/50 text-ink/60 dark:text-primary/60")}'
);

c = c.replace(
  /<ArrowRight className="size-3\.5 shrink-0 text-muted-foreground" \/>/,
  '<ArrowRight className="size-4 shrink-0 text-[#312719]/50 ml-1" />'
);

fs.writeFileSync(p, c);

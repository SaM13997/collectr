const fs = require('fs');

const p = 'src/components/folder-picker.tsx';
let c = fs.readFileSync(p, 'utf8');

if (!c.includes('Surface')) {
  c = c.replace(
    'import { FolderPickerSkeleton } from "@/components/skeletons";',
    'import { FolderPickerSkeleton } from "@/components/skeletons";\nimport { Surface } from "./system/primitives/surface";'
  );
}

c = c.replace(
  /<div\n\s+ref={containerRef}\n\s+className="w-full max-w-sm rounded-\[1\.5rem\] border border-border\/70 bg-card\/92 p-4 shadow-xl"\n\s+role="dialog"\n\s+aria-modal="true"\n\s+aria-label="Move link to collection"\n\s+tabIndex={-1}\n\s+onClick={\(e\) => e.stopPropagation\(\)}\n\s+>/,
  '<Surface\n        variant="overlay"\n        radius="lg"\n        padding="md"\n        ref={containerRef as any}\n        className="w-full max-w-sm"\n        role="dialog"\n        aria-modal="true"\n        aria-label="Move link to collection"\n        tabIndex={-1}\n        onClick={(e) => e.stopPropagation()}\n      >'
);

c = c.replace(
  /<\/div>\n    <\/div>\n  \);\n}/,
  '</Surface>\n    </div>\n  );\n}'
);

c = c.replace(
  /<h3 className="text-sm font-medium text-foreground">Move to collection<\/h3>/,
  '<h3 className="text-sm font-semibold tracking-tight text-ink dark:text-primary">Move to collection</h3>'
);

c = c.replace(
  /className="rounded-full p-2 text-muted-foreground transition-colors duration-150 ease-\[var\(--ease-out\)\] hover:bg-accent hover:text-foreground active:scale-\[0\.95\]"/,
  'className="rounded-full p-2 text-ink/50 dark:text-primary/50 transition-colors duration-150 ease-[var(--ease-out)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-primary active:scale-[0.95]"'
);

c = c.replace(
  /className="flex min-h-11 w-full items-center gap-2 rounded-\[1rem\] px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 ease-\[var\(--ease-out\)\] hover:bg-accent hover:text-foreground active:scale-\[0\.99\]"/g,
  'className="flex min-h-[44px] w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-ink/70 dark:text-primary/70 transition-colors duration-150 ease-[var(--ease-out)] hover:bg-butter hover:text-[#312719] active:scale-[0.99]"'
);

c = c.replace(
  /className={cn\(\n\s+"flex min-h-11 w-full items-center gap-2 rounded-\[1rem\] px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 ease-\[var\(--ease-out\)\] hover:bg-accent hover:text-foreground active:scale-\[0\.99\]"\n\s+\)}/g,
  'className={cn(\n                "flex min-h-[44px] w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-ink/70 dark:text-primary/70 transition-colors duration-150 ease-[var(--ease-out)] hover:bg-butter hover:text-[#312719] active:scale-[0.99]"\n              )}'
);

c = c.replace(
  /<Inbox className="size-4 text-brand" \/>/g,
  '<Inbox className="size-[18px] opacity-70" />'
);

c = c.replace(
  /<Folder className="size-4 text-brand" \/>/g,
  '<Folder className="size-[18px] opacity-70" />'
);

fs.writeFileSync(p, c);

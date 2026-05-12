const fs = require('fs');

function updateSavedItemCard() {
  const file = 'src/components/saved-item-card.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Replace Button import
  content = content.replace(
    /import \{ Button \} from "@\/components\/ui\/button";/,
    `import { Button } from "@/components/system/primitives/button";\nimport { Pill } from "@/components/system/primitives/pill";`
  );

  // Update image placeholder background
  content = content.replace(
    /className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-muted to-background p-2"/,
    `className="flex h-full w-full flex-col items-center justify-center gap-1 bg-panel-strong dark:bg-charcoal-2 p-2"`
  );

  // Update domain badge to Pill
  content = content.replace(
    /<span className="text-\[10px\] font-medium uppercase tracking-wide text-muted-foreground">\s*\{domain\}\s*<\/span>/,
    `<Pill variant="default" size="sm" className="mt-1 opacity-80">\n                {domain}\n              </Pill>`
  );

  // Update main card wrapper classes
  content = content.replace(
    /"min-w-0 flex-1 items-center rounded-xl border border-border bg-card p-3 transition-colors duration-150 ease-\[var\(--ease-out\)\] active:scale-\[0.99\] \[@media\(hover:hover\)\]:hover:bg-accent"/,
    `"min-w-0 flex-1 items-center rounded-[var(--radius-md)] border border-line bg-panel p-3 transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.99] [@media(hover:hover)]:hover:bg-surface-raised dark:border-dark-border dark:bg-charcoal dark:hover:bg-charcoal-2"`
  );

  // Update list view image wrapper
  content = content.replace(
    /className=\{cn\(\n\s*"relative overflow-hidden rounded-xl bg-muted transition-transform duration-150 ease-\[var\(--ease-out\)\] active:scale-\[0.97\]",/,
    `className={cn(\n          "relative overflow-hidden rounded-[var(--radius-sm)] bg-panel-strong dark:bg-charcoal-2 transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]",`
  );
  
  // Tags update to pills? Tags are already tiny pills. Let's make them more branded.
  content = content.replace(
    /className="inline-flex items-center gap-0.5 rounded-full border border-border px-1.5 py-0 text-\[10px\] text-muted-foreground"/g,
    `className="inline-flex items-center gap-0.5 rounded-full border border-line px-1.5 py-0 text-[10px] text-ink/70 dark:border-dark-border dark:text-dark-muted-text bg-white/50 dark:bg-charcoal/50"`
  );

  fs.writeFileSync(file, content);
}

function updateCollectionCard() {
  const file = 'src/components/collection-card.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Update wrapper classes
  content = content.replace(
    /"group flex shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-150 ease-\[var\(--ease-out\)\]",\n\s*"active:scale-\[0.99\] \[@media\(hover:hover\)\]:hover:border-foreground\/15",/,
    `"group flex shrink-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-line bg-panel transition-colors duration-150 ease-[var(--ease-out)] dark:border-dark-border dark:bg-charcoal",\n        "active:scale-[0.99] [@media(hover:hover)]:hover:bg-surface-raised dark:[@media(hover:hover)]:hover:bg-charcoal-2",`
  );
  
  // Empty state background
  content = content.replace(
    /style=\{\{\n\s*background:\n\s*"linear-gradient\(135deg, #ffd6fa 0%, #c5b6ff 50%, #d4a6ff 100%\)",\n\s*\}\}/,
    `className="bg-violet/20 dark:bg-violet/10"`
  );

  // Text color
  content = content.replace(
    /text-foreground/g,
    `text-ink dark:text-dark-text`
  );

  fs.writeFileSync(file, content);
}

function updateBulkToolbar() {
  const file = 'src/components/bulk-selection-toolbar.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Replace Button
  content = content.replace(
    /import \{ Button \} from "@\/components\/ui\/button";/,
    `import { Button } from "@/components/system/primitives/button";\nimport { Surface } from "@/components/system/primitives/surface";`
  );

  // Toolbar wrapper
  content = content.replace(
    /className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background\/95 px-4 py-2 backdrop-blur-sm"/,
    `className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-line bg-panel/95 dark:border-dark-border dark:bg-charcoal/95 px-4 py-2 backdrop-blur-sm"`
  );

  // Modal Dialog -> replace with Surface
  content = content.replace(
    /className="w-full max-w-sm rounded-\[1.5rem\] border border-border\/70 bg-card\/92 p-4 shadow-xl"/,
    `className="w-full max-w-sm"\n        role="dialog"\n        aria-modal="true"\n        aria-label="Move selected items to collection"\n        onClick={(e) => e.stopPropagation()}\n      >\n      <Surface variant="overlay" radius="xl" padding="lg">`
  );
  
  // Fix the closing tags for the modal
  content = content.replace(
    /<\/div>\n\s*<\/div>\n\s*\);/,
    `</Surface>\n      </div>\n    </div>\n  );`
  );
  
  // Remove the old role="dialog" block that was left over because we inserted Surface
  content = content.replace(
    /role="dialog"\n\s*aria-modal="true"\n\s*aria-label="Move selected items to collection"\n\s*onClick=\{\(e\) => e.stopPropagation\(\)\}\n\s*>\n\s*<Surface variant="overlay" radius="xl" padding="lg">/,
    `><Surface variant="overlay" radius="xl" padding="lg" role="dialog" aria-modal="true" aria-label="Move selected items to collection" onClick={(e) => e.stopPropagation()}>`
  );

  fs.writeFileSync(file, content);
}

updateSavedItemCard();
updateCollectionCard();
updateBulkToolbar();

const fs = require('fs');
const file = 'src/components/bulk-selection-toolbar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /className="w-full max-w-sm"\n\s*role="dialog"\n\s*aria-modal="true"\n\s*aria-label="Move selected items to collection"\n\s*onClick=\{\(e\) => e.stopPropagation\(\)\}\n\s*>\n\s*<Surface variant="overlay" radius="xl" padding="lg">/,
  `className="w-full max-w-sm"\n      >\n        <Surface variant="overlay" radius="xl" padding="lg" role="dialog" aria-modal="true" aria-label="Move selected items to collection" onClick={(e) => e.stopPropagation()}>`
);

content = content.replace(
  /<Surface variant="overlay" radius="xl" padding="lg" role="dialog" aria-modal="true" aria-label="Move selected items to collection" onClick=\{\(e\) => e.stopPropagation\(\)\}>\s*<div className="flex items-center justify-between">/,
  `<Surface variant="overlay" radius="xl" padding="lg" role="dialog" aria-modal="true" aria-label="Move selected items to collection" onClick={(e) => e.stopPropagation()}>\n        <div className="flex items-center justify-between">`
);

// If the first regex missed, we can just replace the whole broken block:
content = content.replace(
  /className="w-full max-w-sm"[\s\S]*?onClick=\{\(e\) => e.stopPropagation\(\)\}\s*>\s*<div className="flex items-center justify-between">/,
  `className="w-full max-w-sm">\n        <Surface variant="overlay" radius="xl" padding="lg" role="dialog" aria-modal="true" aria-label="Move selected items to collection" onClick={(e) => e.stopPropagation()}>\n        <div className="flex items-center justify-between">`
);

fs.writeFileSync(file, content);

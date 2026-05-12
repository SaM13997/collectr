const fs = require('fs');

// Fix bulk-selection-toolbar sizes
const file1 = 'src/components/bulk-selection-toolbar.tsx';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace(/size="icon-sm"/g, 'size="icon"');
fs.writeFileSync(file1, content1);

// Fix collection-card JSX error
const file2 = 'src/components/collection-card.tsx';
let content2 = fs.readFileSync(file2, 'utf8');
// Let's find the duplicate attribute. It might be className.
// Looking at the replace logic I used earlier:
// I replaced text-foreground with text-ink dark:text-dark-text, and added dark classes, let's see where it duplicates.
console.log(content2.split('\n')[40]);

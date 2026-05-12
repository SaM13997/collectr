const fs = require('fs');
const file = 'src/components/collection-card.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /className="absolute inset-0"\s*className="bg-violet\/20 dark:bg-violet\/10"/,
  `className="absolute inset-0 bg-violet/20 dark:bg-violet/10"`
);

fs.writeFileSync(file, content);

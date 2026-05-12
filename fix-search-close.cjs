const fs = require('fs');
let file = 'src/routes/search.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /(\)\s*:\s*null\}\s*)(<\/AppLayout>)/,
  '$1</div>\n    $2'
);
fs.writeFileSync(file, content);

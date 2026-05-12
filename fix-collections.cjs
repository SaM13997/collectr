const fs = require('fs');
let file = 'src/routes/collections.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('<div className="p-4 md:p-8 max-w-5xl mx-auto w-full">')) {
  content = content.replace(
    /(<AppLayout title="Collections">)\s*({folderData === undefined \? \()/,
    '$1\n      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">\n      $2'
  );
  
  content = content.replace(
    /(\s*<\/div>\n\s*\)\s*\}\n\s*)(<\/AppLayout>)/,
    '$1      </div>\n    $2'
  );
  
  fs.writeFileSync(file, content);
}

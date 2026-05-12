const fs = require('fs');

let file = 'src/routes/entries.$entryId.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the main content wrapper
if (!content.includes('<div className="p-4 md:p-8 max-w-2xl mx-auto w-full">')) {
  // Add it after AppLayout
  content = content.replace(
    /(\s*backButton=\{<BackButton onClick=\{\(\) => router.history.back\(\)\} \/>\}\n\s*>\n)(\s*\{\/\* Author header \*\/})/g,
    '$1      <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">\n$2'
  );
  
  // Close it before AppLayout
  content = content.replace(
    /(\s*<\/FolderPicker>\n\s*\)\s*:\s*null\}\n)(\s*<\/AppLayout>)/,
    '$1      </div>\n$2'
  );
  
  // And fix the error where I previously missed the opening tag in the skeletons
  content = content.replace(
    /<div className="flex flex-col gap-4 animate-pulse">/,
    '<div className="p-4 md:p-8 max-w-2xl mx-auto w-full">\n        <div className="flex flex-col gap-4 animate-pulse">'
  );
  
  content = content.replace(
    /<div className="flex flex-col items-center justify-center py-20 text-center">/,
    '<div className="p-4 md:p-8 max-w-2xl mx-auto w-full">\n        <div className="flex flex-col items-center justify-center py-20 text-center">'
  );
  
  fs.writeFileSync(file, content);
}

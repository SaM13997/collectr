const fs = require('fs');

function fixEntries() {
  let file = 'src/routes/entries.$entryId.tsx';
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('<div className="p-4 md:p-8 max-w-3xl mx-auto w-full">')) {
    content = content.replace(
      /(<AppLayout\s+title=[^>]+>\s*{?\/\*\s*Author header\s*\*\/}?)\s*(<div className="flex items-center gap-3">)/,
      '$1\n      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">\n        $2'
    );
    content = content.replace(
      /(<FolderPicker[^>]+>\s*\)\s*:\s*null}\s*)(<\/AppLayout>)/,
      '$1</div>\n    $2'
    );
    
    // Fallbacks
    content = content.replace(
      /(<AppLayout[^>]*>)\s*(<div className="flex flex-col gap-4 animate-pulse">)/,
      '$1\n        <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">\n$2'
    );
    content = content.replace(
      /(<div className="h-48 rounded-xl bg-muted" \/>\s*<\/div>)\s*(<\/AppLayout>)/,
      '$1\n        </div>\n      $2'
    );
    
    content = content.replace(
      /(<AppLayout[^>]*>)\s*(<div className="flex flex-col items-center justify-center py-20 text-center">)/,
      '$1\n        <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">\n$2'
    );
    content = content.replace(
      /(<Link to="\/">Go back<\/Link>\s*<\/Button>\s*<\/div>)\s*(<\/AppLayout>)/,
      '$1\n        </div>\n      $2'
    );
    
    fs.writeFileSync(file, content);
  }
}

function fixSearch() {
  let file = 'src/routes/search.tsx';
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('<div className="p-4 md:p-8 max-w-5xl mx-auto w-full">')) {
    content = content.replace(
      /(<AppLayout title="Search">)\s*(<div className="relative mb-4">)/,
      '$1\n      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">\n      $2'
    );
    content = content.replace(
      /(<FolderPicker[^>]+>\s*\)\s*:\s*null}\s*)(<\/AppLayout>)/,
      '$1</div>\n    $2'
    );
    fs.writeFileSync(file, content);
  }
}

function fixProfile() {
  let file = 'src/routes/profile.tsx';
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('<div className="p-4 md:p-8 max-w-3xl mx-auto w-full">')) {
    content = content.replace(
      /(<AppLayout title="Profile">)\s*({?\/\*\s*User Info\s*\*\/}?)\s*(<div className="slide-up)/,
      '$1\n      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">\n      $2\n      $3'
    );
    content = content.replace(
      /(<LogOut className="size-4" \/>\s*<span>Sign out<\/span>\s*<\/Button>\s*<\/div>)\s*(<\/AppLayout>)/,
      '$1\n      </div>\n    $2'
    );
    fs.writeFileSync(file, content);
  }
}

fixEntries();
fixSearch();
fixProfile();

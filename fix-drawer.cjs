const fs = require('fs');
let file = 'src/components/layout/MobileAddDrawer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /className="bg-panel dark:bg-charcoal flex flex-col rounded-t-3xl h-\[85vh\] mt-24 fixed bottom-0 left-0 right-0 z-50"/g,
  'className="bg-background flex flex-col rounded-t-[32px] h-auto max-h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50"'
);

content = content.replace(
  /className="p-4 bg-panel dark:bg-charcoal rounded-t-3xl flex-1 overflow-hidden flex flex-col"/g,
  'className="p-4 bg-background rounded-t-[32px] overflow-y-auto flex flex-col"'
);

fs.writeFileSync(file, content);

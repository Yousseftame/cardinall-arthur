const fs = require('fs');

function restoreH3(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  const multiLineRegex = /className=["']([^"']*)font-heading font-light tracking-tighter([^"']*)["']/g;
  content = content.replace(multiLineRegex, (match, p1, p2) => {
    if (match.includes('text-base') || match.includes('text-lg') || file.includes('Marketplace') || file.includes('ProductPage')) {
      return 'className="' + p1 + 'font-medium' + p2 + '"';
    }
    return match;
  });

  fs.writeFileSync(file, content, 'utf8');
}

restoreH3('./src/components/sections/ProductsSection.tsx');
restoreH3('./src/components/sections/ClientFeedbackSection.tsx');
restoreH3('./src/components/layout/CartSidebar.tsx');
restoreH3('./src/pages/storefront/ProductPage.tsx');
restoreH3('./src/pages/storefront/MarketplacePage.tsx');
console.log('Restored H3s');

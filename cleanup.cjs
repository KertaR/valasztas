const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const pages = fs.readdirSync(pagesDir);

pages.forEach(page => {
    let p = path.join(pagesDir, page);
    let content = fs.readFileSync(p, 'utf8');

    // Replace the opening {activeTab === '...' && (
    content = content.replace(/\{\s*activeTab\s*===\s*'[a-zA-Z]+'\s*&&\s*\(/g, '');

    // Replace the closing )} right before the closing fragment </>
    // We can just find the last )} before </>
    let lastParenIndex = content.lastIndexOf(')}');
    if (lastParenIndex !== -1) {
        content = content.substring(0, lastParenIndex) + content.substring(lastParenIndex + 2);
    }

    fs.writeFileSync(p, content);
    console.log(`Cleaned up ${page}`);
});

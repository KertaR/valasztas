const fs = require('fs');
let content = fs.readFileSync('c:\\\\xampp\\\\htdocs\\\\React.js', 'utf8');

const componentsStart = content.indexOf('// --- SEGÉDKOMPONENSEK ---');
if (componentsStart !== -1) {
    let mainCode = content.substring(0, componentsStart);

    const importsToAdd = `
import ToastContainer from './components/ToastContainer';
import StatusBadge from './components/StatusBadge';
import FileStatusCard from './components/FileStatusCard';
import NavItem from './components/NavItem';
import StatCard from './components/StatCard';
`;

    const lucideImportEnd = mainCode.indexOf("} from 'lucide-react';") + 22;
    mainCode = mainCode.slice(0, lucideImportEnd) + '\\n' + importsToAdd + mainCode.slice(lucideImportEnd);

    fs.writeFileSync('c:\\\\xampp\\\\htdocs\\\\valasztas-app\\\\src\\\\App.jsx', mainCode);
    console.log("Successfully split App.jsx");
} else {
    console.log("Could not find the components section.");
}

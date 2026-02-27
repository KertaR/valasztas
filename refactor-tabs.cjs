const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(p, 'utf8');

const componentsDirs = path.join(__dirname, 'src', 'pages');
if (!fs.existsSync(componentsDirs)) {
    fs.mkdirSync(componentsDirs);
}

// Extract Tabs
function extractTab(tabName, startComment, endComment, outputName, propsStr, imports) {
    const startIndex = content.indexOf(startComment);
    const endIndex = content.indexOf(endComment);

    if (startIndex !== -1 && endIndex !== -1) {
        const tabContent = content.substring(startIndex, endIndex);

        const componentCode = `import React from 'react';
import { 
    Users, Building2, Map, UsersRound, FileText, BarChart, 
    Activity, ChevronRightCircle, Clock, Calendar, Search,
    Download, Filter, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
    MapPin, Target, UserCircle2, Info, Zap
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { ResponsiveContainer, PieChart, Pie, Tooltip as RechartsTooltip, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

export default function ${outputName}({ ${propsStr} }) {
    return (
        <>
        ${tabContent.trim()}
        </>
    );
}`;
        // Note: some lucid imports might be unneeded but that's fine
        fs.writeFileSync(path.join(componentsDirs, outputName + '.jsx'), componentCode);

        // Replace in App.jsx
        content = content.replace(tabContent, `{activeTab === '${tabName}' && <${outputName} ${propsStr.split(',').map(p => p.trim()).map(p => p + '={' + p + '}').join(' ')} />} \n                `);

        // Add import to App.jsx
        content = `import ${outputName} from './pages/${outputName}';\n` + content;

        console.log(`Extracted ${outputName}`);
    } else {
        console.log(`Could not find ${outputName}`, startIndex, endIndex);
    }
}

let dashProps = "enrichedData, data, setSelectedOevk, setSelectedCandidate";
extractTab('dashboard', "{/* TAB: ÁTTEKINTÉS */}", "{/* TAB: JELÖLTEK */}", "DashboardTab", dashProps);

let jeloltProps = "processedCandidates, enrichedData, exportToCSV, quickFilter, setQuickFilter, searchTerm, setSearchTerm, selectedCounty, setSelectedCounty, filterOptions, selectedParty, setSelectedParty, selectedStatus, setSelectedStatus, handleSort, getSortIcon, paginatedCandidates, setSelectedCandidate, getInitials, currentPage, setCurrentPage, itemsPerPage, totalPages";
extractTab('jeloltek', "{/* TAB: JELÖLTEK */}", "{/* TAB: SZERVEZETEK */}", "CandidatesTab", jeloltProps);

let orgProps = "enrichedData, setSelectedOrg";
extractTab('szervezetek', "{/* TAB: SZERVEZETEK */}", "{/* TAB: OEVK */}", "OrganizationsTab", orgProps);

let oevkProps = "enrichedData, setSelectedOevk";
extractTab('oevk', "{/* TAB: OEVK */}", "{/* TAB: VÁRMEGYÉK */}", "OevkTab", oevkProps);

let countyProps = "enrichedData";
extractTab('megyek', "{/* TAB: VÁRMEGYÉK */}", "</main>", "CountiesTab", countyProps);

fs.writeFileSync(p, content);
console.log("Done");

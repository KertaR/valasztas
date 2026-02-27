import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// Organizations Components
import { OrganizationsHeader, OrganizationsTable } from '../components';

export default function OrganizationsTab({ enrichedData, setSelectedOrg }) {
    const [showOnlyNew, setShowOnlyNew] = useState(false);

    const filteredOrgs = useMemo(() => {
        let list = enrichedData.organizations.filter(org => !org.isCoalitionPartner);
        if (!showOnlyNew) return list;
        return list.filter(org => org.isNew);
    }, [enrichedData.organizations, showOnlyNew]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-6xl mx-auto transition-colors">
            <OrganizationsHeader showOnlyNew={showOnlyNew} setShowOnlyNew={setShowOnlyNew} />
            <OrganizationsTable organizations={filteredOrgs} onSelect={setSelectedOrg} />
        </motion.div>
    );
}
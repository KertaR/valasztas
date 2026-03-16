import React from 'react';
import { Users, Building2, Map, UsersRound, UserCircle2 } from 'lucide-react';
import { StatCard } from '../ui';

const StatsGrid = React.memo(({
    candidatesCount,
    organizationsCount,
    districtsCount,
    totalEligibleVoters,
    diffs,
    onCandidatesDiffClick
}) => {
    const effectiveDiffs = diffs || {};
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
                title="Induló Jelöltek"
                value={candidatesCount || 0}
                diff={effectiveDiffs.candidates}
                icon={<UserCircle2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />}
                color="indigo"
            />
            <StatCard
                title="Jelölő Szervezetek"
                value={organizationsCount || 0}
                diff={effectiveDiffs.organizations}
                icon={<Building2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400" />}
                color="emerald"
            />
            <StatCard
                title="Választókerületek"
                value={districtsCount || 0}
                icon={<Map className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" />}
                color="amber"
            />
            <StatCard
                title="Szavazásra Jogosultak"
                value={(totalEligibleVoters || 0).toLocaleString('hu-HU')}
                diff={effectiveDiffs.voters}
                icon={<Users className="w-5 h-5 md:w-6 md:h-6 text-rose-600 dark:text-rose-400" />}
                color="rose"
                onDiffClick={onCandidatesDiffClick}
            />
        </div>
    );
});

export default StatsGrid;

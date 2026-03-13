import React from 'react';
import { Users, Building2, Map, UsersRound } from 'lucide-react';
import { StatCard } from '../ui';

export default function StatsGrid({
    candidatesCount,
    organizationsCount,
    districtsCount,
    totalEligibleVoters,
    diffs,
    onCandidatesDiffClick
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <StatCard
                icon={<Users className="w-7 h-7 text-blue-600" />}
                title="Induló Jelöltek"
                value={candidatesCount}
                color="bg-blue-100"
                diff={diffs?.candidates}
                onClick={onCandidatesDiffClick}
            />
            <StatCard
                icon={<Building2 className="w-7 h-7 text-purple-600" />}
                title="Jelölő Szervezetek"
                value={organizationsCount}
                color="bg-purple-100"
                diff={diffs?.organizations}
            />
            <StatCard
                icon={<Map className="w-7 h-7 text-emerald-600" />}
                title="Választókerületek"
                value={districtsCount}
                color="bg-emerald-100"
                diff={diffs?.districts}
            />
            <StatCard
                icon={<UsersRound className="w-7 h-7 text-amber-600" />}
                title="Szavazásra Jogosultak"
                value={totalEligibleVoters}
                color="bg-amber-100"
                diff={diffs?.voters}
            />
        </div>
    );
}

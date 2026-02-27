import DistrictCard from './DistrictCard';

export default function DistrictGrid({ districts, onSelect }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {districts.map(dist => (
                <DistrictCard
                    key={`${dist.maz}-${dist.evk}`}
                    dist={dist}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}

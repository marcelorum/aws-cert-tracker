import { useEffect } from 'react';
import { useDomains } from '../db/hooks';
import { DomainCard } from '../components/checklist/DomainCard';
import { seedDatabase } from '../db/seed-data';

export function ChecklistPage() {
  const domains = useDomains();

  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Checklist</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track topics across all CLF-C02 domains. Click a status badge to advance it.
        </p>
      </div>

      <div className="space-y-3">
        {domains.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <p className="text-sm text-gray-400">Loading checklist...</p>
            </div>
          </div>
        )}

        {domains.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </div>
    </div>
  );
}

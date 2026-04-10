'use client';

import { useCompany } from '@/hooks/useCompanies';
import { BadgeCheck } from 'lucide-react';

interface CompanyVerifiedBadgeProps {
  companyId: string;
  showName?: boolean;
}

export function CompanyVerifiedBadge({ companyId, showName = false }: CompanyVerifiedBadgeProps) {
  const { data: company } = useCompany(companyId);

  if (!company) return null;

  return (
    <div className="flex items-center gap-1.5">
      {showName && (
        <span className="text-sm text-gray-600">{company.name}</span>
      )}
      {company.isVerified && (
        <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
          <BadgeCheck className="w-3.5 h-3.5" />
          Verified
        </span>
      )}
    </div>
  );
}

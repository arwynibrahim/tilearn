'use client';

import { cn, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface UserListItemProps {
  prenom: string;
  nom: string;
  email: string;
  badge?: { label: string; variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' };
  date?: string;
  href?: string;
}

export function UserListItem({ prenom, nom, email, badge, date, href }: UserListItemProps) {
  const Wrapper = href ? 'a' : 'div';

  return (
    <Wrapper
      href={href}
      className={cn(
        'flex items-center justify-between py-3',
        href && 'cursor-pointer rounded-lg px-2 -mx-2 transition-colors hover:bg-gray-50'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
          {getInitials(prenom, nom)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {prenom} {nom}
          </p>
          <p className="truncate text-xs text-gray-400">{email}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {badge && <Badge variant={badge.variant ?? 'default'}>{badge.label}</Badge>}
        {date && <span className="text-xs text-gray-400">{date}</span>}
      </div>
    </Wrapper>
  );
}

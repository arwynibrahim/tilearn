'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  BadgeCheck,
  Headphones,
  BookOpen,
  Library,
  LogOut,
  ChevronRight,
  CreditCard,
  UserCheck,
  Shield,
  GraduationCap,
  Compass,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { getInitials } from '@/lib/utils';
import { Brand } from '@/components/layout/brand';
import type { Membership } from '@/types';
import { hasPlatformRole, hasOrgAdminRole, hasRole } from '@/types';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

const superAdminNav: NavItem[] = [
  { href: '/super-admin', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/catalogue', icon: Compass, label: 'Catalogue' },
  { href: '/super-admin/users', icon: Users, label: 'Utilisateurs' },
  { href: '/super-admin/organizations', icon: Building2, label: 'Organisations' },
  { href: '/super-admin/instructors', icon: UserCheck, label: 'Instructeurs' },
  { href: '/admin/catalogue', icon: Library, label: 'Gestion catalogue' },
  { href: '/admin/licenses', icon: BadgeCheck, label: 'Licences' },
  { href: '/admin/learning-paths', icon: BookOpen, label: 'Parcours' },
  { href: '/admin/mdm', icon: Headphones, label: 'Parc VR (MDM)' },
  { href: '/admin/payments', icon: CreditCard, label: 'Paiements' },
  { href: '/super-admin/roles', icon: Shield, label: 'Rôles & Permissions' },
];

const institutionAdminNav: NavItem[] = [
  { href: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/catalogue', icon: Compass, label: 'Catalogue' },
  { href: '/admin/catalogue', icon: Library, label: 'Gestion catalogue' },
  { href: '/admin/licenses', icon: BadgeCheck, label: 'Licences' },
  { href: '/admin/learning-paths', icon: BookOpen, label: 'Parcours' },
  { href: '/admin/mdm', icon: Headphones, label: 'Parc VR (MDM)' },
  { href: '/admin/payments', icon: CreditCard, label: 'Paiements' },
];

const instructorNav: NavItem[] = [
  { href: '/dashboard/instructor', icon: GraduationCap, label: 'Mon espace' },
  { href: '/dashboard/catalogue', icon: Compass, label: 'Catalogue' },
  { href: '/dashboard/courses', icon: BookOpen, label: 'Cours suivis' },
  { href: '/dashboard/vr', icon: Headphones, label: 'Mes VR' },
  { href: '/dashboard/certificates', icon: BadgeCheck, label: 'Certificats' },
];

const learnerNav: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/catalogue', icon: Compass, label: 'Catalogue' },
  { href: '/dashboard/recommendations', icon: Sparkles, label: 'Recommandations' },
  { href: '/dashboard/courses', icon: BookOpen, label: 'Mes cours' },
  { href: '/dashboard/certificates', icon: BadgeCheck, label: 'Certificats' },
  { href: '/dashboard/payments', icon: CreditCard, label: 'Mes paiements' },
  { href: '/dashboard/vr', icon: Headphones, label: 'Mes VR' },
];

function getNavForMemberships(memberships: Membership[] | undefined): NavItem[] {
  if (!memberships?.length) return learnerNav;
  if (memberships.some((m) => m.contextType === 'PLATFORM')) return superAdminNav;
  if (memberships.some((m) => m.contextType === 'ORGANIZATION' && m.role === 'ADMIN')) return institutionAdminNav;
  if (memberships.some((m) => m.role === 'CREATOR')) return instructorNav;
  return learnerNav;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout = useLogout();
  const items = getNavForMemberships(user?.memberships);
  const isSuperAdmin = hasPlatformRole(user);

  return (
    <aside className={cn('flex h-full w-64 flex-col border-r', isSuperAdmin ? 'border-navy-800 bg-navy-900' : 'border-gray-100 bg-white')}>
      <div className={cn('flex h-16 items-center border-b px-5', isSuperAdmin ? 'border-navy-800' : 'border-gray-100')}>
        <Brand size={36} textClassName={isSuperAdmin ? 'text-white' : 'text-navy'} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigation latérale">
        <ul className="space-y-1" role="list">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/super-admin' && item.href !== '/dashboard' && item.href !== '/dashboard/instructor' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? isSuperAdmin ? 'bg-navy-700 text-white' : 'bg-brand/10 text-brand'
                      : isSuperAdmin
                        ? 'text-gray-400 hover:bg-navy-800 hover:text-gray-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                  {isActive && <ChevronRight className="ml-auto size-3" aria-hidden="true" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {user && (
        <div className={cn('border-t p-4', isSuperAdmin ? 'border-navy-800' : 'border-gray-100')}>
          <div className="mb-3 flex items-center gap-3">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold', isSuperAdmin ? 'bg-navy-700 text-gray-300' : 'bg-brand/10 text-brand')} aria-hidden="true">
              {getInitials(user.prenom, user.nom)}
            </div>
            <div className="min-w-0">
              <p className={cn('truncate text-sm font-semibold', isSuperAdmin ? 'text-gray-200' : 'text-gray-900')}>
                {user.prenom} {user.nom}
              </p>
              <p className={cn('truncate text-xs', isSuperAdmin ? 'text-gray-500' : 'text-gray-500')}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              isSuperAdmin
                ? 'text-gray-400 hover:bg-red-900/30 hover:text-red-400'
                : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
            )}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      )}
    </aside>
  );
}

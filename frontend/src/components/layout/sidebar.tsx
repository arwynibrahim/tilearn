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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { getInitials } from '@/lib/utils';
import { Brand } from '@/components/layout/brand';
import type { Role } from '@/types';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

const adminNav: NavItem[] = [
  { href: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/catalogue', icon: Compass, label: 'Catalogue' },
  { href: '/admin/catalogue', icon: Library, label: 'Gestion catalogue' },
  { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { href: '/admin/organizations', icon: Building2, label: 'Organisations' },
  { href: '/admin/licenses', icon: BadgeCheck, label: 'Licences' },
  { href: '/admin/learning-paths', icon: BookOpen, label: 'Parcours' },
  { href: '/admin/mdm', icon: Headphones, label: 'Parc VR (MDM)' },
  { href: '/admin/payments', icon: CreditCard, label: 'Paiements' },
  { href: '/admin/instructors', icon: UserCheck, label: 'Instructeurs' },
  { href: '/admin/roles', icon: Shield, label: 'Rôles & Permissions' },
];

const instructorNav: NavItem[] = [
  { href: '/dashboard/instructor', icon: GraduationCap, label: 'Mon espace' },
  { href: '/dashboard/catalogue', icon: Compass, label: 'Catalogue' },
  { href: '/dashboard/courses', icon: BookOpen, label: 'Mes cours' },
  { href: '/dashboard/vr', icon: Headphones, label: 'Mes VR' },
  { href: '/dashboard/certificates', icon: BadgeCheck, label: 'Certificats' },
];

const learnerNav: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/catalogue', icon: Compass, label: 'Catalogue' },
  { href: '/dashboard/courses', icon: BookOpen, label: 'Mes cours' },
  { href: '/dashboard/certificates', icon: BadgeCheck, label: 'Certificats' },
  { href: '/dashboard/payments', icon: CreditCard, label: 'Mes paiements' },
  { href: '/dashboard/vr', icon: Headphones, label: 'Mes VR' },
];

function getNavForRole(role: Role): NavItem[] {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN_INSTITUTION':
      return adminNav;
    case 'INSTRUCTOR':
      return instructorNav;
    case 'LEARNER':
    default:
      return learnerNav;
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout = useLogout();
  const items = getNavForRole(user?.role ?? 'LEARNER');

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-100 bg-white">
      <div className="flex h-16 items-center border-b border-gray-100 px-5">
        <Brand size={36} textClassName="text-navy" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigation latérale">
        <ul className="space-y-1" role="list">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/dashboard' && item.href !== '/dashboard/instructor' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand/10 text-brand'
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
        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand" aria-hidden="true">
              {getInitials(user.prenom, user.nom)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user.prenom} {user.nom}
              </p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      )}
    </aside>
  );
}

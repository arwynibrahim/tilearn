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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { getInitials } from '@/lib/utils';
import { Brand } from '@/components/layout/brand';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  adminOnly?: boolean;
}

const adminNav: NavItem[] = [
  { href: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { href: '/admin/catalogue', icon: Library, label: 'Catalogue' },
  { href: '/admin/organizations', icon: Building2, label: 'Organisations' },
  { href: '/admin/licenses', icon: BadgeCheck, label: 'Licences' },
  { href: '/admin/learning-paths', icon: BookOpen, label: 'Parcours' },
  { href: '/admin/mdm', icon: Headphones, label: 'Parc VR (MDM)' },
  { href: '/admin/payments', icon: CreditCard, label: 'Paiements' },
  { href: '/admin/instructors', icon: UserCheck, label: 'Instructeurs' },
  { href: '/admin/roles', icon: Shield, label: 'Rôles & Permissions' },
];

const learnerNav: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/courses', icon: Library, label: 'Catalogue' },
  { href: '/dashboard/courses', icon: BookOpen, label: 'Mes cours' },
  { href: '/dashboard/certificates', icon: BadgeCheck, label: 'Certificats' },
  { href: '/dashboard/payments', icon: CreditCard, label: 'Mes paiements' },
  { href: '/dashboard/vr', icon: Headphones, label: 'Mes VR' },
];

export function Sidebar({ variant = 'admin' }: { variant?: 'admin' | 'learner' }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout = useLogout();
  const items = variant === 'admin' ? adminNav : learnerNav;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-100 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-gray-100 px-5">
        <Brand size={36} textClassName="text-navy" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                  {isActive && <ChevronRight className="ml-auto size-3" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      {user && (
        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
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
            <LogOut className="size-4" />
            Déconnexion
          </button>
        </div>
      )}
    </aside>
  );
}

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
  CreditCard,
  UserCheck,
  Shield,
  GraduationCap,
  Compass,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/hooks/use-auth';
import { Brand } from '@/components/layout/brand';
import type { Membership } from '@/types';
import { hasPlatformRole, hasOrgAdminRole } from '@/types';
import { useState, useEffect } from 'react';

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

function isActiveRoute(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === '/super-admin' || href === '/admin' || href === '/dashboard' || href === '/dashboard/instructor') {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

interface SidebarContentProps {
  isCollapsed: boolean;
  onNavClick?: () => void;
}

function SidebarContent({ isCollapsed, onNavClick }: SidebarContentProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout = useLogout();
  const items = getNavForMemberships(user?.memberships);
  const isSuperAdmin = hasPlatformRole(user);

  return (
    <>
      <div className={cn('flex h-16 items-center border-b px-5', isSuperAdmin ? 'border-navy-800' : 'border-gray-100')}>
        <Brand size={32} textClassName={isSuperAdmin ? 'text-white' : 'text-navy'} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigation latérale">
        <ul className="space-y-0.5" role="list">
          {items.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    active
                      ? isSuperAdmin
                        ? 'bg-navy-700 text-white'
                        : 'bg-brand/10 text-brand font-semibold'
                      : isSuperAdmin
                        ? 'text-gray-400 hover:bg-navy-800 hover:text-gray-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                  {active && (
                    <span className={cn(
                      'ml-auto block size-1.5 rounded-full',
                      isSuperAdmin ? 'bg-brand' : 'bg-brand'
                    )} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {user && (
        <div className={cn('border-t p-4', isSuperAdmin ? 'border-navy-800' : 'border-gray-100')}>
          <div className="mb-3 flex items-center gap-3">
            <div className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
              isSuperAdmin ? 'bg-navy-700 text-gray-300' : 'bg-brand/10 text-brand'
            )}>
              {getInitials(user.prenom, user.nom)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className={cn('truncate text-sm font-semibold', isSuperAdmin ? 'text-gray-200' : 'text-gray-900')}>
                  {user.prenom} {user.nom}
                </p>
                <p className={cn('truncate text-xs', isSuperAdmin ? 'text-gray-500' : 'text-gray-400')}>{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              isSuperAdmin
                ? 'text-gray-500 hover:bg-red-900/30 hover:text-red-400'
                : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
            )}
          >
            <LogOut className="size-4" aria-hidden="true" />
            {!isCollapsed && 'Déconnexion'}
          </button>
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const pathname = usePathname();
  const { user } = useAuthStore();
  const isSuperAdmin = hasPlatformRole(user);

  return (
    <>
      {/* Mobile toggle — visible below lg */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex size-10 items-center justify-center rounded-xl bg-white shadow-card lg:hidden focus-ring"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5 text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-white shadow-sidebar transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <Brand size={32} textClassName="text-navy" />
          <button
            onClick={() => setMobileOpen(false)}
            className="flex size-8 items-center justify-center rounded-lg hover:bg-gray-100 focus-ring"
            aria-label="Fermer le menu"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>
        <SidebarContent isCollapsed={false} onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden h-screen w-64 flex-col border-r shadow-sidebar lg:flex',
          isSuperAdmin ? 'border-navy-800 bg-navy-900' : 'border-gray-100 bg-white'
        )}
      >
        <a
          href="#main-content"
          className="fixed -translate-x-full focus:translate-x-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        <SidebarContent isCollapsed={false} />
      </aside>
    </>
  );
}

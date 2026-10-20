import {
  Boxes,
  Cpu,
  FlaskConical,
  Image as ImageIcon,
  KeyRound,
  Landmark,
  LayoutDashboard,
  ListChecks,
  Network,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface AppNavItem {
  path: string;
  label: string;
  pageLabel: string;
  icon: LucideIcon;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { path: '/app', label: 'Overview', pageLabel: 'Overview', icon: LayoutDashboard },
  { path: '/app/compute', label: 'Compute', pageLabel: 'Compute', icon: Cpu },
  { path: '/app/playground', label: 'Playground', pageLabel: 'Playground', icon: FlaskConical },
  { path: '/app/images', label: 'Images', pageLabel: 'Images', icon: ImageIcon },
  { path: '/app/workloads', label: 'Workloads', pageLabel: 'Workloads', icon: Boxes },
  { path: '/app/jobs', label: 'Jobs', pageLabel: 'Jobs', icon: ListChecks },
  { path: '/app/keys', label: 'API Keys', pageLabel: 'API Keys', icon: KeyRound },
  { path: '/app/network', label: 'Network', pageLabel: 'Network', icon: Network },
  { path: '/app/treasury', label: 'Treasury', pageLabel: 'Treasury', icon: Landmark },
  { path: '/app/settings', label: 'Settings', pageLabel: 'Settings', icon: Settings },
];

/** Items shown directly in the mobile bottom bar (max 4 + More). */
export const MOBILE_PRIMARY_PATHS = ['/app', '/app/compute', '/app/playground', '/app/images'];

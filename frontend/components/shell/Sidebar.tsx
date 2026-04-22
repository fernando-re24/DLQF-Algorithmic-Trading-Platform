'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/Icon';

type NavItem = { href: string; label: string; icon: IconName; match?: RegExp };

const PLATFORM: NavItem[] = [{ href: '/', label: 'Home', icon: 'home', match: /^\/$/ }];

const CHALLENGE = (projectId: string): NavItem[] => [
  { href: `/projects/${projectId}/jobs`, label: 'Challenge', icon: 'trophy', match: new RegExp(`^/projects/${projectId}/jobs/?$`) },
  { href: `/projects/${projectId}/jobs/new`, label: 'Submit', icon: 'upload' },
  { href: `/projects/${projectId}/leaderboard`, label: 'Leaderboard', icon: 'chart' },
];

type Props = { projectId?: string };

export function Sidebar({ projectId = 'spring-2026' }: Props) {
  const pathname = usePathname() ?? '/';

  const isActive = (item: NavItem) => {
    if (item.match) return item.match.test(pathname);
    return pathname.startsWith(item.href);
  };

  const challenge = CHALLENGE(projectId);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          Δ
        </div>
        <div>
          <div className="brand-name">DLQF</div>
          <div className="brand-sub">Quant Platform</div>
        </div>
      </div>
      <nav className="nav" aria-label="Primary">
        <div className="nav-section">Platform</div>
        {PLATFORM.map((n) => (
          <Link key={n.href} href={n.href} className={`nav-item ${isActive(n) ? 'active' : ''}`}>
            <Icon name={n.icon} size={15} />
            <span>{n.label}</span>
          </Link>
        ))}
        <div className="nav-section">Spring 2026 Challenge</div>
        {challenge.map((n) => (
          <Link key={n.href} href={n.href} className={`nav-item ${isActive(n) ? 'active' : ''}`}>
            <Icon name={n.icon} size={15} />
            <span>{n.label}</span>
          </Link>
        ))}
        <div className="nav-section">Workspace</div>
        <button type="button" className="nav-item">
          <Icon name="dataset" size={15} />
          <span>Datasets</span>
        </button>
        <button type="button" className="nav-item">
          <Icon name="gear" size={15} />
          <span>Settings</span>
        </button>
      </nav>
      <div className="sidebar-footer">
        <div className="avatar">EK</div>
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontWeight: 500 }}>Elena Kuznetsova</div>
          <div style={{ color: 'var(--fg-2)', fontSize: 11 }}>Team · DLQF-YOU</div>
        </div>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/Icon';

type NavItem = { href: string; label: string; icon: IconName; match?: RegExp };

const PLATFORM: NavItem[] = [{ href: '/', label: 'Home', icon: 'home', match: /^\/$/ }];

const CHALLENGE: NavItem[] = [
  { href: '/challenge', label: 'Challenge', icon: 'trophy', match: /^\/challenge(\/.*)?$/ },
  { href: '/submit', label: 'Submit', icon: 'upload', match: /^\/submit(\/.*)?$/ },
  { href: '/leaderboard', label: 'Leaderboard', icon: 'chart', match: /^\/leaderboard(\/.*)?$/ },
];

export function Sidebar() {
  const pathname = usePathname() ?? '/';

  const isActive = (item: NavItem) => {
    if (item.match) return item.match.test(pathname);
    return pathname.startsWith(item.href);
  };

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
        {CHALLENGE.map((n) => (
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

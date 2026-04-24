'use client';

import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/lib/auth-context';

type Props = {
  crumbs: string[];
  actions?: ReactNode;
};

export function Topbar({ crumbs, actions }: Props) {
  const { session, signOut } = useAuth();
  const router = useRouter();

  const onSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <header className="topbar">
      <div className="crumb" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span className="sep" aria-hidden="true">
                /
              </span>
            )}
            <span className={i === crumbs.length - 1 ? 'curr' : ''}>{c}</span>
          </Fragment>
        ))}
      </div>
      <div className="topbar-right">
        <span className="env-pill">
          <span className="dot" aria-hidden="true"></span>ENGINE · v2.4.1
        </span>
        {actions}
        <button type="button" className="btn btn-ghost btn-sm" aria-label="Notifications">
          <Icon name="bell" size={14} />
        </button>
        <button type="button" className="btn btn-ghost btn-sm" aria-label="Search">
          <Icon name="search" size={14} /> <span className="kbd">⌘K</span>
        </button>
        {session ? (
          <>
            <span
              className="mono"
              style={{ fontSize: 11, color: 'var(--fg-2)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={session.user.email ?? ''}
            >
              {session.user.email}
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <Link href="/sign-in" className="btn btn-primary btn-sm">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

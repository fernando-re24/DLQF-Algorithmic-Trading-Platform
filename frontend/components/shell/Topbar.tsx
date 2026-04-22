import { Fragment, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';

type Props = {
  crumbs: string[];
  actions?: ReactNode;
};

export function Topbar({ crumbs, actions }: Props) {
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
      </div>
    </header>
  );
}

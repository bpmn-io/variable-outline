import { useContext } from 'react';
import { CollapseAll } from '@carbon/icons-react';

import { ScopeExpandContext } from '../../Context/ScopeExpandContext';

export default function CollapseAllButton() {
  const { collapseAll } = useContext(ScopeExpandContext);

  return (
    <button
      className="filter-toggle"
      onClick={ collapseAll }
      title="Collapse all scope groups"
      type="button"
    >
      <CollapseAll className="filter-toggle-icon" />
      <span className="filter-toggle-label">Collapse all</span>
    </button>
  );
}

import { useContext } from 'react';
import { CollapseAll, ExpandAll } from '@carbon/icons-react';

import { ScopeExpandContext } from '../../Context/ScopeExpandContext';

export default function CollapseAllButton() {
  const { allCollapsed, collapseAll, expandAll } = useContext(ScopeExpandContext);

  const Icon = allCollapsed ? ExpandAll : CollapseAll;
  const label = allCollapsed ? 'Expand all' : 'Collapse all';

  return (
    <button
      className="bio-vo-collapse-button"
      onClick={ allCollapsed ? expandAll : collapseAll }
      title={ label }
      type="button"
    >
      <Icon className="bio-vo-collapse-icon" />
    </button>
  );
}

import { useContext } from 'react';
import { CollapseAll, ExpandAll } from '@carbon/icons-react';
import { IconButton } from '@carbon/react';

import { ScopeExpandContext } from '../../context/ScopeExpandContext';

export default function CollapseAllButton() {
  const { allCollapsed, collapseAll, expandAll } = useContext(ScopeExpandContext);

  const Icon = allCollapsed ? ExpandAll : CollapseAll;
  const label = allCollapsed ? 'Expand all' : 'Collapse all';

  return (
    <IconButton
      className="bio-vo-collapse-button"
      kind="ghost"
      size="sm"
      label={ label }
      aria-label={ label }
      align="left"
      onClick={ allCollapsed ? expandAll : collapseAll }
    >
      <Icon />
    </IconButton>
  );
}

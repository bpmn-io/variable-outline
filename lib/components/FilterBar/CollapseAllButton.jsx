import { useContext } from 'react';
import { IconButton } from '@camunda/design-system';
import { ChevronsDownUp, ChevronsUpDown } from '@camunda/design-system/icons';

import { ScopeExpandContext } from '../../context/ScopeExpandContext';

export default function CollapseAllButton() {
  const { allCollapsed, collapseAll, expandAll } = useContext(ScopeExpandContext);

  return (
    <IconButton
      variant="ghost"
      size="sm"
      label={ allCollapsed ? 'Expand all' : 'Collapse all' }
      tooltipSide="left"
      icon={ allCollapsed ? ChevronsUpDown : ChevronsDownUp }
      onClick={ allCollapsed ? expandAll : collapseAll }
    />
  );
}

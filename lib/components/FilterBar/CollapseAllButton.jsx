import { useContext } from 'react';
import { IconButton } from '@camunda/design-system';
import { FoldVertical, UnfoldVertical } from '@camunda/design-system/icons';

import { ScopeExpandContext } from '../../context/ScopeExpandContext';

export default function CollapseAllButton() {
  const { allCollapsed, collapseAll, expandAll } = useContext(ScopeExpandContext);

  return (
    <IconButton
      variant="ghost"
      size="xs"
      label={ allCollapsed ? 'Expand all' : 'Collapse all' }
      tooltipSide="left"
      icon={ allCollapsed ? UnfoldIcon : FoldIcon }
      onClick={ allCollapsed ? expandAll : collapseAll }
    />
  );
}

// `xs` buttons shrink icons to 12px, too small for the fold icon's detail
function FoldIcon(props) {
  return <FoldVertical { ...props } className="size-4" />;
}

function UnfoldIcon(props) {
  return <UnfoldVertical { ...props } className="size-4" />;
}

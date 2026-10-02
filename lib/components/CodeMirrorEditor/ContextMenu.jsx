import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@camunda/design-system';

import useContextMenuBehavior from '../../hooks/useContextMenuBehavior';

export function ContextMenu({ menuState, view, rootVariableName, onClose }) {
  const { copyPath, copyValue, style } = useContextMenuBehavior({
    menuState, view, rootVariableName
  });

  if (!menuState) return null;

  return (
    <DropdownMenu open onOpenChange={ open => !open && onClose() }>
      <DropdownMenuTrigger asChild>
        <span aria-hidden="true" style={ style } />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={ event => {
          event.preventDefault();
          view.focus();
        } }
      >
        <DropdownMenuItem onSelect={ copyPath }>Copy path</DropdownMenuItem>
        <DropdownMenuItem onSelect={ copyValue }>Copy value</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

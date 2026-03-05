import ReactDOM from 'react-dom';
import useContextMenuBehavior from '../../hooks/useContextMenuBehavior';

export function ContextMenu({ menuState, view, rootVariableName, onClose }) {
  const { menuRef, firstItemRef, copyPath, copyValue, style } = useContextMenuBehavior({
    menuState, view, rootVariableName, onClose
  });

  if (!menuState) return null;

  return ReactDOM.createPortal(
    <div
      className="vd-context-menu"
      style={ style }
      ref={ menuRef }
      role="menu"
    >
      <button
        className="vd-context-menu-item"
        onClick={ copyPath }
        role="menuitem"
        type="button"
        ref={ firstItemRef }
      >
        Copy path
      </button>
      <button
        className="vd-context-menu-item"
        onClick={ copyValue }
        role="menuitem"
        type="button"
      >
        Copy value
      </button>
    </div>,
    document.body
  );
}

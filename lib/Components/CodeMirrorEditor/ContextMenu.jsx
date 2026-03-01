/* global document, navigator, window */
import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { buildPathFromSyntaxNode, extractValue, getLineContext } from './jsonTreeUtils';

export function ContextMenu({ menuState, view, rootVariableName, onClose }) {
  const menuRef = useRef(null);
  const firstItemRef = useRef(null);

  useEffect(() => {
    if (!menuState) return;

    if (firstItemRef.current) {
      firstItemRef.current.focus();
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const items = menuRef.current.querySelectorAll('[role="menuitem"]');
        const currentIndex = Array.from(items).indexOf(document.activeElement);
        let nextIndex;
        if (event.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % items.length;
        } else {
          nextIndex = (currentIndex - 1 + items.length) % items.length;
        }
        items[nextIndex].focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ menuState, onClose ]);

  if (!menuState) return null;

  const { anchorPos, rect } = menuState;

  const style = {
    top: rect.bottom + 2,
    right: window.innerWidth - rect.right
  };

  const copyPath = () => {
    const { propertyNode, valueNode } = getLineContext(view, anchorPos);
    const node = propertyNode || valueNode;

    if (node) {
      const suffix = buildPathFromSyntaxNode(node, view.state.doc);
      const path = rootVariableName
        ? `${rootVariableName}${suffix}`
        : suffix.replace(/^\./, '');

      if (path) {
        navigator.clipboard.writeText(path).catch(() => {});
      }
    }
    onClose();
  };

  const copyValue = () => {
    const { valueNode } = getLineContext(view, anchorPos);
    const value = extractValue(valueNode, view.state.doc);

    if (value !== undefined) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    onClose();
  };

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
        ref={ firstItemRef }
      >
        Copy path
      </button>
      <button
        className="vd-context-menu-item"
        onClick={ copyValue }
        role="menuitem"
      >
        Copy value
      </button>
    </div>,
    document.body
  );
}

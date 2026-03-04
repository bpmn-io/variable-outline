/* global console, document, navigator, window */
import { useEffect, useRef, useCallback } from 'react';
import { buildPathFromSyntaxNode, extractValue, getLineContext } from '../Components/CodeMirrorEditor/jsonTreeUtils';

export default function useContextMenuBehavior({ menuState, view, rootVariableName, onClose }) {
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

  const copyPath = useCallback(() => {
    const { anchorPos } = menuState;
    const { propertyNode, valueNode } = getLineContext(view, anchorPos);
    const node = propertyNode || valueNode;

    if (node) {
      const suffix = buildPathFromSyntaxNode(node, view.state.doc);
      const path = rootVariableName
        ? `${rootVariableName}${suffix}`
        : suffix.replace(/^\./, '');

      if (path) {
        navigator.clipboard
          .writeText(path)
          .catch((error) => console.warning('[bpmn-io/variable-outline] Failed to copy to clipboard', error));

      }
    }

    onClose();
  }, [ menuState, view, rootVariableName, onClose ]);

  const copyValue = useCallback(() => {
    const { anchorPos } = menuState;
    const { valueNode } = getLineContext(view, anchorPos);
    const value = extractValue(valueNode, view.state.doc);

    if (value !== undefined) {
      navigator.clipboard
        .writeText(value)
        .catch((error) => console.warning('[bpmn-io/variable-outline] Failed to copy to clipboard', error));
    }

    onClose();
  }, [ menuState, view, onClose ]);

  const style = menuState ? {
    top: menuState.rect.bottom + 2,
    right: window.innerWidth - menuState.rect.right
  } : null;

  return { menuRef, firstItemRef, copyPath, copyValue, style };
}

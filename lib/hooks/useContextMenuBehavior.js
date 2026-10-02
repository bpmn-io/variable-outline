import { useCallback } from 'react';
import { buildPathFromSyntaxNode, extractValue, getLineContext } from '../components/CodeMirrorEditor/treeUtils';
import useTracking from './useTracking';

export default function useContextMenuBehavior({ menuState, view, rootVariableName }) {
  const track = useTracking();

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
          .catch((error) => console.warn('[bpmn-io/variable-outline] Failed to copy to clipboard', error));

        track('variablePathCopy');
      }
    }
  }, [ menuState, view, rootVariableName, track ]);

  const copyValue = useCallback(() => {
    const { anchorPos } = menuState;
    const { valueNode } = getLineContext(view, anchorPos);
    const value = extractValue(valueNode, view.state.doc);

    if (value !== undefined) {
      navigator.clipboard
        .writeText(value)
        .catch((error) => console.warn('[bpmn-io/variable-outline] Failed to copy to clipboard', error));

      track('variableValueCopy');
    }
  }, [ menuState, view, track ]);

  // the line button lives in CodeMirror, outside React; anchor the menu to its position
  const style = menuState ? {
    position: 'fixed',
    top: menuState.rect.top,
    left: menuState.rect.left,
    width: menuState.rect.right - menuState.rect.left,
    height: menuState.rect.bottom - menuState.rect.top,
    pointerEvents: 'none'
  } : null;

  return { copyPath, copyValue, style };
}

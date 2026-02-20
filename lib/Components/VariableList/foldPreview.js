/* global document */

import { codeFolding, syntaxTree } from '@codemirror/language';

const PREVIEW_KEYS = 2;

function extractPreview(node, doc) {
  const name = node.type.name;

  if (name === 'Object') {
    const keys = [];
    let total = 0;
    let child = node.firstChild;
    while (child) {
      if (child.type.name === 'Property') {
        total++;
        if (keys.length < PREVIEW_KEYS) {
          const keyNode = child.firstChild;
          if (keyNode) {
            keys.push(doc.sliceString(keyNode.from, keyNode.to).replace(/^"|"$/g, ''));
          }
        }
      }
      child = child.nextSibling;
    }
    return { keys, total, open: '{', close: '}' };
  }

  if (name === 'Array') {
    let total = 0;
    let child = node.firstChild;
    while (child) {
      const childName = child.type.name;
      if (childName !== '[' && childName !== ']' && childName !== ',') total++;
      child = child.nextSibling;
    }
    return { keys: [], total, open: '[', close: ']' };
  }

  return null;
}

function buildPlaceholderDOM(view, from) {
  const node = syntaxTree(view.state).resolveInner(from + 1, 1);
  const preview = extractPreview(node, view.state.doc);

  const span = document.createElement('span');
  span.className = 'vd-fold-placeholder';

  if (!preview) {
    span.textContent = '…';
    return span;
  }

  const { keys, total, open } = preview;

  if (open === '[') {
    span.textContent = `[ ${total} item${total === 1 ? '' : 's'} ]`;
    return span;
  }

  const hasMore = total > PREVIEW_KEYS;
  const parts = hasMore ? [ ...keys, '…' ] : keys;
  span.textContent = `{ ${parts.join(', ')} }`;
  return span;
}

export function foldPreview() {
  return codeFolding({ placeholderDOM: buildPlaceholderDOM });
}

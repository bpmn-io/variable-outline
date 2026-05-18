import { codeFolding, syntaxTree } from '@codemirror/language';

const PREVIEW_KEYS = 2;

function extractPreview(node, doc) {
  const name = node.type.name;

  if (name === 'Context') {
    const keys = [];
    let total = 0;
    let child = node.firstChild;
    while (child) {
      if (child.type.name === 'ContextEntry') {
        total++;
        if (keys.length < PREVIEW_KEYS) {
          const keyNode = child.firstChild;
          if (keyNode && keyNode.type.name === 'Key') {
            const nameNode = keyNode.firstChild;
            if (nameNode) {
              keys.push(doc.sliceString(nameNode.from, nameNode.to).replace(/^"|"$/g, ''));
            }
          }
        }
      }
      child = child.nextSibling;
    }
    return { keys, total, open: '{', close: '}' };
  }

  if (name === 'List') {
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

function preparePlaceholder(state, range) {
  let node = syntaxTree(state).resolveInner(range.from + 1, 1);

  // Walk up to find the container node
  while (node && node.name !== 'Context' && node.name !== 'List') {
    node = node.parent;
  }
  return node ? extractPreview(node, state.doc) : null;
}

function buildPlaceholderDOM(view, onclick, prepared) {
  const span = document.createElement('span');
  span.className = 'vd-fold-placeholder';
  span.onclick = onclick;

  if (!prepared) {
    span.textContent = '…';
    return span;
  }

  const { keys, total, open } = prepared;

  if (open === '[') {
    span.textContent = ` ${total} item${total === 1 ? '' : 's'} `;
    return span;
  }

  const hasMore = total > PREVIEW_KEYS;
  const parts = hasMore ? [ ...keys, '…' ] : keys;
  span.textContent = ` ${parts.join(', ')} `;
  return span;
}

export function foldPreview() {
  return codeFolding({ preparePlaceholder, placeholderDOM: buildPlaceholderDOM });
}

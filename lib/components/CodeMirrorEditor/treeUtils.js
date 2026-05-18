import { syntaxTree } from '@codemirror/language';

const SIMPLE_KEY = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
const STRUCTURAL = new Set([ '{', '}', '[', ']', ':', ',', 'Expression' ]);

function feelIndexInArray(node) {

  // FEEL arrays are 1-based; count only value nodes, skip structural tokens
  let idx = 1;
  let child = node.parent.firstChild;
  while (child) {
    if (child === node) break;
    if (!STRUCTURAL.has(child.name)) idx++;
    child = child.nextSibling;
  }
  return idx;
}

export function buildPathFromSyntaxNode(node, doc) {
  const segments = [];
  let current = node;

  while (current && current.name !== 'Expression') {
    const name = current.name;
    const parentName = current.parent?.name;

    if (name === 'ContextEntry') {
      const keyNode = current.firstChild;
      if (keyNode && keyNode.name === 'Key') {
        const nameNode = keyNode.firstChild;
        if (nameNode) {
          let key;
          if (nameNode.name === 'StringLiteral') {
            key = doc.sliceString(nameNode.from, nameNode.to).replace(/^"|"$/g, '');
          } else {
            key = doc.sliceString(nameNode.from, nameNode.to);
          }
          segments.unshift(SIMPLE_KEY.test(key) ? `.${key}` : `["${key}"]`);
        }
      }
    } else if (parentName === 'List' &&
               !STRUCTURAL.has(name) && name !== 'ContextEntry') {
      segments.unshift(`[${feelIndexInArray(current)}]`);
    }

    current = current.parent;
  }

  return segments.join('');
}



export function getValueNode(node) {

  // FEEL tree: Key > Name/StringLiteral → ContextEntry → value
  if (node.name === 'StringLiteral' || node.name === 'Name') {
    const keyNode = node.parent;
    if (keyNode && keyNode.name === 'Key') {
      const entry = keyNode.parent;
      if (entry && entry.name === 'ContextEntry') {
        let child = entry.lastChild;
        while (child) {
          if (child.name !== 'Key' && !STRUCTURAL.has(child.name)) return child;
          child = child.prevSibling;
        }
      }
    }
  }

  if (!STRUCTURAL.has(node.name) && node.name !== 'Key' && node.name !== 'ContextEntry') {
    return node;
  }
  return null;
}

export function extractValue(valueNode, doc) {
  if (!valueNode) return null;
  const raw = doc.sliceString(valueNode.from, valueNode.to);
  if (valueNode.name === 'StringLiteral') return raw.replace(/^"|"$/g, '');
  return raw;
}

export function getLineContext(view, pos) {
  const line = view.state.doc.lineAt(pos);
  const tree = syntaxTree(view.state);
  let propertyNode = null;
  let valueNode = null;

  tree.iterate({
    from: line.from,
    to: line.to,
    enter: (nodeRef) => {
      if (propertyNode) return false;

      if ((nodeRef.name === 'Name' || nodeRef.name === 'StringLiteral') &&
          nodeRef.node.parent?.name === 'Key' &&
          nodeRef.node.parent?.parent?.name === 'ContextEntry') {
        propertyNode = nodeRef.node;
        valueNode = getValueNode(nodeRef.node);
        return false;
      }

      if (!valueNode && !STRUCTURAL.has(nodeRef.name) &&
          nodeRef.name !== 'Key' && nodeRef.name !== 'ContextEntry' &&
          nodeRef.from >= line.from) {
        valueNode = nodeRef.node;
        if (nodeRef.name !== 'Context' && nodeRef.name !== 'List') {
          return false;
        }
      }
    }
  });

  return { propertyNode, valueNode };
}

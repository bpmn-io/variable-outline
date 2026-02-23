import { syntaxTree } from '@codemirror/language';

export const SIMPLE_KEY = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
export const STRUCTURAL = new Set([ '{', '}', '[', ']', ':', ',', 'JsonText' ]);
export const VALUE_NODES = new Set([ 'String', 'Number', 'True', 'False', 'Null', 'Object', 'Array' ]);

export function feelIndexInArray(node) {

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

  while (current && current.name !== 'JsonText') {
    const name = current.name;
    const parentName = current.parent?.name;

    if (name === 'Property') {
      const propName = current.firstChild;
      if (propName && propName.name === 'PropertyName') {
        const raw = doc.sliceString(propName.from, propName.to);
        const key = raw.replace(/^"|"$/g, '');
        segments.unshift(SIMPLE_KEY.test(key) ? `.${key}` : `["${key}"]`);
      }
    } else if (parentName === 'Array' && name !== 'Property') {
      segments.unshift(`[${feelIndexInArray(current)}]`);
    }

    current = current.parent;
  }

  return segments.join('');
}

export function getFeelPath(view, pos, rootVariableName) {
  const tree = syntaxTree(view.state);
  const node = tree.resolveInner(pos, -1);
  const suffix = buildPathFromSyntaxNode(node, view.state.doc);
  return rootVariableName ? `${rootVariableName}${suffix}` : suffix.replace(/^\./, '');
}

export function getValueNode(node) {
  if (node.name === 'PropertyName') {
    let sibling = node.nextSibling;
    while (sibling) {
      if (VALUE_NODES.has(sibling.name)) return sibling;
      sibling = sibling.nextSibling;
    }
    return null;
  }
  return VALUE_NODES.has(node.name) ? node : null;
}

export function extractValue(valueNode, doc) {
  if (!valueNode) return null;
  const raw = doc.sliceString(valueNode.from, valueNode.to);
  if (valueNode.name === 'String') return raw.replace(/^"|"$/g, '');
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

      if (nodeRef.name === 'PropertyName') {
        propertyNode = nodeRef.node;
        valueNode = getValueNode(nodeRef.node);
        return false;
      }

      // Only match value nodes that start on this line.
      // Parent containers (Object/Array) starting on earlier lines
      // are visited first by tree.iterate (depth-first pre-order)
      // and would incorrectly shadow the actual property on this line.
      if (!valueNode && VALUE_NODES.has(nodeRef.name) && nodeRef.from >= line.from) {
        valueNode = nodeRef.node;

        // Don't stop at Object/Array — a PropertyName may be inside
        if (nodeRef.name !== 'Object' && nodeRef.name !== 'Array') {
          return false;
        }
      }
    }
  });

  return { propertyNode, valueNode };
}

/* global document, navigator, clearTimeout, setTimeout */

import { syntaxTree } from '@codemirror/language';
import { hoverTooltip } from '@codemirror/view';

const SIMPLE_KEY = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
const STRUCTURAL = new Set([ '{', '}', '[', ']', ':', ',', 'JsonText' ]);
const VALUE_NODES = new Set([ 'String', 'Number', 'True', 'False', 'Null', 'Object', 'Array' ]);

function feelIndexInArray(node) {

  // FEEL arrays are 1-based; count only value nodes, skip structural tokens
  let idx = 1;
  let child = node.parent.firstChild;
  while (child) {
    if (child === node) break;
    if (!STRUCTURAL.has(child.type.name)) idx++;
    child = child.nextSibling;
  }
  return idx;
}

function buildPathFromSyntaxNode(node, doc) {
  const segments = [];
  let current = node;

  while (current && current.type.name !== 'JsonText') {
    const name = current.type.name;
    const parentName = current.parent?.type.name;

    if (name === 'Property') {
      const propName = current.firstChild;
      if (propName && propName.type.name === 'PropertyName') {
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

function getFeelPath(view, pos, rootVariableName) {
  const tree = syntaxTree(view.state);
  const node = tree.resolveInner(pos, -1);
  const suffix = buildPathFromSyntaxNode(node, view.state.doc);
  return rootVariableName ? `${rootVariableName}${suffix}` : suffix.replace(/^\./, '');
}

function getValueNode(node) {
  if (node.type.name === 'PropertyName') {
    let sibling = node.nextSibling;
    while (sibling) {
      if (VALUE_NODES.has(sibling.type.name)) return sibling;
      sibling = sibling.nextSibling;
    }
    return null;
  }
  return VALUE_NODES.has(node.type.name) ? node : null;
}

function extractValue(valueNode, doc) {
  if (!valueNode) return null;
  const raw = doc.sliceString(valueNode.from, valueNode.to);
  if (valueNode.type.name === 'String') return raw.replace(/^"|"$/g, '');
  return raw;
}

function makeCopyButton(text, label, copiedLabel) {
  const button = document.createElement('button');
  button.className = 'vd-feel-tooltip-copy';
  button.textContent = label;

  let resetTimeout;
  button.addEventListener('click', () => {
    navigator.clipboard.writeText(text).then(() => {
      button.textContent = copiedLabel;
      button.classList.add('vd-feel-tooltip-copy--copied');
      clearTimeout(resetTimeout);
      resetTimeout = setTimeout(() => {
        button.textContent = label;
        button.classList.remove('vd-feel-tooltip-copy--copied');
      }, 1500);
    }).catch(() => {});
  });

  return button;
}

export function feelPathTooltip(rootVariableName) {
  return hoverTooltip((view, pos) => {
    const tree = syntaxTree(view.state);
    const node = tree.resolveInner(pos, -1);

    if (STRUCTURAL.has(node.type.name)) return null;

    const feelPath = getFeelPath(view, pos, rootVariableName);
    if (!feelPath) return null;

    const valueNode = getValueNode(node);
    const value = extractValue(valueNode, view.state.doc);

    return {
      pos: node.from,
      end: node.to,
      above: true,
      create() {
        const dom = document.createElement('div');
        dom.className = 'vd-feel-tooltip';

        dom.appendChild(makeCopyButton(feelPath, 'Copy path', 'Copied!'));

        if (value !== null) {
          const sep = document.createElement('span');
          sep.className = 'vd-feel-tooltip-sep';
          sep.textContent = '|';
          dom.appendChild(sep);
          dom.appendChild(makeCopyButton(value, 'Copy value', 'Copied!'));
        }

        return { dom };
      }
    };
  });
}

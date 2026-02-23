/* global document */
import { StateEffect, StateField, RangeSetBuilder } from '@codemirror/state';
import { ViewPlugin, Decoration, WidgetType, EditorView, keymap } from '@codemirror/view';
import { syntaxTree, foldable, foldEffect, unfoldEffect, foldedRanges } from '@codemirror/language';
import { getValueNode } from './jsonTreeUtils';


const STRUCTURAL_CHARS = new Set([ '{', '}', '[', ']', ',', ':' ]);

export const openMenuEffect = StateEffect.define();
export const closeMenuEffect = StateEffect.define();
export const setActiveTokenEffect = StateEffect.define();

const menuState = StateField.define({
  create() { return null; },
  update(value, tr) {
    if (tr.docChanged) return null;
    for (let effect of tr.effects) {
      if (effect.is(openMenuEffect)) return effect.value;
      if (effect.is(closeMenuEffect)) return null;
    }
    return value;
  }
});

const activeTokenState = StateField.define({
  create() { return null; },
  update(value, tr) {
    if (tr.selection || tr.docChanged) return null;
    for (let effect of tr.effects) {
      if (effect.is(setActiveTokenEffect)) return effect.value;
    }
    return value;
  },
  provide: f => EditorView.decorations.of(view => {
    const active = view.state.field(f);
    if (!active || active.kind !== 'key') return Decoration.none;

    return Decoration.set([
      Decoration.mark({ class: 'vd-active-token' }).range(active.pos, active.end)
    ]);
  })
});

class MenuButtonWidget extends WidgetType {
  constructor(pos, view, isActive) {
    super();
    this.pos = pos;
    this.view = view;
    this.isActive = isActive;
  }

  eq(other) {
    return other.pos === this.pos && other.isActive === this.isActive;
  }

  toDOM() {
    const btn = document.createElement('button');
    btn.className = `vd-menu-btn ${this.isActive ? 'vd-menu-btn--active' : ''}`;
    btn.textContent = '⋮';
    btn.setAttribute('aria-label', 'Line options');
    btn.tabIndex = -1;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = btn.getBoundingClientRect();
      this.view.dispatch({
        effects: [
          openMenuEffect.of({ anchorPos: this.pos, rect }),
          setActiveTokenEffect.of({ pos: this.pos, kind: 'btn' })
        ]
      });
    };
    return btn;
  }

  ignoreEvent() {
    return true;
  }
}

function getFoldInfo(view) {
  const { doc } = view.state;
  const folded = foldedRanges(view.state);
  const hiddenLines = new Set();

  folded.between(0, doc.length, (from, to) => {
    const startLine = doc.lineAt(from);
    const endLine = doc.lineAt(to);
    for (let ln = startLine.number + 1; ln <= endLine.number; ln++) {
      hiddenLines.add(ln);
    }
  });

  return { hiddenLines };
}

function computeButtonPositions(view, foldInfo) {
  const { doc } = view.state;
  const { hiddenLines } = foldInfo;
  const positions = [];

  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to;) {
      const line = doc.lineAt(pos);

      if (hiddenLines.has(line.number)) {
        pos = line.to + 1;
        continue;
      }

      const content = line.text.trim();
      const isStructuralOnly = [ ...content ].every(char => STRUCTURAL_CHARS.has(char));

      if (content.length > 0 && !isStructuralOnly) {
        positions.push(line.to);
      }

      pos = line.to + 1;
    }
  }

  return positions;
}

function buildMenuDecorations(view) {
  const builder = new RangeSetBuilder();
  const activeToken = view.state.field(activeTokenState);
  const foldInfo = getFoldInfo(view);
  const positions = computeButtonPositions(view, foldInfo);

  for (const buttonPos of positions) {
    const isActive = activeToken && activeToken.kind === 'btn' && activeToken.pos === buttonPos;
    builder.add(buttonPos, buttonPos, Decoration.widget({
      widget: new MenuButtonWidget(buttonPos, view, isActive),
      side: 1
    }));
  }

  return builder.finish();
}

const menuPlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = buildMenuDecorations(view);
  }

  update(update) {
    const activeTokenChanged = update.startState.field(activeTokenState) !== update.state.field(activeTokenState);
    const hasFoldChange = update.transactions.some(tr =>
      tr.effects.some(e => e.is(foldEffect) || e.is(unfoldEffect))
    );
    if (update.docChanged || update.viewportChanged || activeTokenChanged || hasFoldChange) {
      this.decorations = buildMenuDecorations(update.view);
    }
  }
}, {
  decorations: v => v.decorations
});

function buildFoldableKeyDecorations(view) {
  const builder = new RangeSetBuilder();
  const tree = syntaxTree(view.state);
  const { doc } = view.state;
  const { hiddenLines } = getFoldInfo(view);

  for (const { from, to } of view.visibleRanges) {
    tree.iterate({
      from, to,
      enter: (nodeRef) => {
        if (nodeRef.name === 'PropertyName') {
          const line = doc.lineAt(nodeRef.from);
          if (hiddenLines.has(line.number)) return;

          const valueNode = getValueNode(nodeRef.node);
          if (valueNode && (valueNode.name === 'Object' || valueNode.name === 'Array')) {
            builder.add(nodeRef.from, nodeRef.to, Decoration.mark({ class: 'vd-foldable-key' }));
          }
        }
      }
    });
  }

  return builder.finish();
}

const foldableKeyPlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = buildFoldableKeyDecorations(view);
  }

  update(update) {
    const hasFoldChange = update.transactions.some(tr =>
      tr.effects.some(e => e.is(foldEffect) || e.is(unfoldEffect))
    );
    if (update.docChanged || update.viewportChanged || hasFoldChange) {
      this.decorations = buildFoldableKeyDecorations(update.view);
    }
  }
}, {
  decorations: v => v.decorations
});

function getInteractiveTokens(view) {
  const tokens = [];
  const tree = syntaxTree(view.state);
  const { doc } = view.state;
  const foldInfo = getFoldInfo(view);

  for (let { from, to } of view.visibleRanges) {
    tree.iterate({
      from, to,
      enter: (node) => {
        if (node.name === 'PropertyName') {
          const line = doc.lineAt(node.from);
          if (!foldInfo.hiddenLines.has(line.number)) {
            tokens.push({ pos: node.from, end: node.to, kind: 'key' });
          }
        }
      }
    });
  }

  const buttonPositions = computeButtonPositions(view, foldInfo);
  for (const pos of buttonPositions) {
    tokens.push({ pos, kind: 'btn' });
  }

  return tokens.sort((a, b) => a.pos - b.pos);
}

function moveFocus(view, direction) {
  const tokens = getInteractiveTokens(view);
  if (tokens.length === 0) return false;

  const current = view.state.field(activeTokenState);
  let index = -1;

  if (current) {
    index = tokens.findIndex(t => t.pos === current.pos && t.kind === current.kind);
  }

  let nextIndex;
  if (index === -1) {
    nextIndex = direction > 0 ? 0 : tokens.length - 1;
  } else {
    nextIndex = (index + direction + tokens.length) % tokens.length;
  }

  view.dispatch({
    effects: setActiveTokenEffect.of(tokens[nextIndex])
  });
  return true;
}

function findFold(state, pos) {
  let found = null;
  foldedRanges(state).between(pos, pos + 2, (from, to) => { found = { from, to }; });
  return found;
}

function toggleFoldAtPos(view, pos) {

  // Use side=1 to prefer nodes starting at this position;
  // side=-1 at PropertyName.from boundary may resolve to a preceding node.
  let node = syntaxTree(view.state).resolveInner(pos, 1);
  if (node.name !== 'PropertyName') {
    node = syntaxTree(view.state).resolveInner(pos, -1);
  }
  if (node.name === 'PropertyName') {
    const valueNode = getValueNode(node);
    if (valueNode && (valueNode.name === 'Object' || valueNode.name === 'Array')) {
      const existingFold = findFold(view.state, valueNode.from);
      if (existingFold) {
        view.dispatch({ effects: unfoldEffect.of(existingFold) });
      } else {
        const line = view.state.doc.lineAt(valueNode.from);
        const range = foldable(view.state, line.from, line.to);
        if (range) view.dispatch({ effects: foldEffect.of(range) });
      }
      return true;
    }
  }
  return false;
}

function activateToken(view) {
  const current = view.state.field(activeTokenState);
  if (!current) {
    const { head } = view.state.selection.main;
    return toggleFoldAtPos(view, head);
  }

  if (current.kind === 'btn') {
    const coords = view.coordsAtPos(current.pos, 1);
    if (coords) {
      const rect = { left: coords.left, top: coords.top, bottom: coords.bottom, right: coords.right, width: 0, height: (coords.bottom - coords.top) };
      view.dispatch({ effects: openMenuEffect.of({ anchorPos: current.pos, rect }) });
    }
    return true;
  } else if (current.kind === 'key') {

    // Use pos+1 to land inside the token, avoiding resolveInner boundary ambiguity
    const interiorPos = current.end > current.pos + 1 ? current.pos + 1 : current.pos;
    toggleFoldAtPos(view, interiorPos);
    return true;
  }
  return false;
}

export function jsonInteractiveControls(variableName, onMenuChange) {
  const clickToFold = EditorView.domEventHandlers({
    mousedown(event, view) {
      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (pos === null) return false;
      const handled = toggleFoldAtPos(view, pos);
      if (handled) {
        const node = syntaxTree(view.state).resolveInner(pos, -1);
        if (node.name === 'PropertyName') {
          view.dispatch({
            effects: setActiveTokenEffect.of({ pos: node.from, end: node.to, kind: 'key' })
          });
        }
        event.preventDefault();
      }
      return handled;
    }
  });

  return [
    menuState,
    activeTokenState,
    menuPlugin,
    foldableKeyPlugin,
    clickToFold,
    EditorView.updateListener.of(update => {
      if (update.state.field(menuState) !== update.startState.field(menuState)) {
        onMenuChange(update.state.field(menuState));
      }
    }),
    keymap.of([
      { key: 'Tab', run: view => moveFocus(view, 1), shift: view => moveFocus(view, -1) },
      { key: 'Enter', run: activateToken },
      { key: 'Space', run: activateToken },
      { key: 'Escape', run: (view) => {
        view.dispatch({ effects: [ closeMenuEffect.of(null), setActiveTokenEffect.of(null) ] });
        view.focus();
        return true;
      } }
    ])
  ];
}

/* global document */

import { RangeSetBuilder, StateField } from '@codemirror/state';
import { ViewPlugin, Decoration, WidgetType, EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

const FEEL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 12 12"><path fill="currentcolor" d="M 3.101562 10.277344 C 2.984375 10.863281 2.765625 11.296875 2.445312 11.578125 C 2.132812 11.859375 1.6875 12 1.109375 12 L 0 12 L 0.265625 10.648438 L 1.347656 10.648438 L 2.648438 4.097656 L 1.863281 4.097656 L 2.128906 2.746094 L 2.910156 2.746094 L 3.113281 1.722656 C 3.230469 1.136719 3.445312 0.703125 3.757812 0.421875 C 4.074219 0.140625 4.523438 0 5.101562 0 L 6.210938 0 L 5.949219 1.351562 L 4.863281 1.351562 L 4.585938 2.746094 L 5.671875 2.746094 L 5.40625 4.097656 L 4.324219 4.097656 Z M 4.804688 9.445312 L 7.402344 5.886719 L 6.238281 2.746094 L 8.015625 2.746094 L 8.621094 4.925781 L 8.773438 4.925781 L 10.222656 2.746094 L 12 2.746094 L 9.417969 6.21875 L 10.5625 9.445312 L 8.785156 9.445312 L 8.179688 7.210938 L 8.03125 7.210938 L 6.582031 9.445312 Z M 4.804688 9.445312 "/></svg>';

class FEELIconWidget extends WidgetType {
  eq() {
    return true;
  }

  toDOM() {
    const span = document.createElement('span');
    span.className = 'vd-feel-icon';
    span.title = 'This value is a FEEL expression.';
    span.innerHTML = FEEL_SVG;
    return span;
  }

  ignoreEvent() {
    return true;
  }
}

function buildDecorations(view) {
  const builder = new RangeSetBuilder();

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (nodeRef) => {
        if (nodeRef.name !== 'String') return;

        const content = view.state.doc.sliceString(nodeRef.from, nodeRef.to);
        if (content.startsWith('"=')) {
          builder.add(
            nodeRef.from,
            nodeRef.from,
            Decoration.widget({
              widget: new FEELIconWidget(),
              side: -1
            })
          );
        }
      }
    });
  }

  return builder.finish();
}

export function feelExpressionIcon() {
  return ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = buildDecorations(view);
      }

      update(update) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = buildDecorations(update.view);
        }
      }
    },
    {
      decorations: v => v.decorations
    }
  );
}

/**
 * Simplified FEEL icon for primitive (non-JSON) values.
 * No syntax tree — just checks if the raw text starts with '='.
 */
export function feelPrimitiveIcon() {
  return StateField.define({
    create(state) {
      const text = state.doc.toString();
      if (!text.startsWith('=')) return Decoration.none;

      return Decoration.set([
        Decoration.widget({
          widget: new FEELIconWidget(),
          side: -1
        }).range(0)
      ]);
    },
    update(value) {
      return value;
    },
    provide: f => EditorView.decorations.from(f)
  });
}

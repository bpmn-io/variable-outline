import { EditorView, Decoration } from '@codemirror/view';
import { StateField } from '@codemirror/state';

function classifyValue(text) {
  const trimmed = text.trim();

  if (trimmed === 'null') return 'json-null';
  if (trimmed === 'true' || trimmed === 'false') return 'json-bool';
  if (trimmed !== '' && !isNaN(Number(trimmed))) return 'json-number';

  return 'json-string';
}

/**
 * Highlights non-JSON primitive values using the same CSS classes
 * as the JSON syntax theme (json-string, json-number, json-bool, json-null).
*/
export function primitiveHighlight() {
  return StateField.define({
    create(state) {
      const text = state.doc.toString();
      if (!text) return Decoration.none;

      const classname = classifyValue(text);
      return Decoration.set([
        Decoration.mark({ class: classname }).range(0, state.doc.length)
      ]);
    },
    update(value) {
      return value;
    },
    provide: f => EditorView.decorations.from(f)
  });
}

import { EditorView } from '@codemirror/view';

const baseTheme = EditorView.theme({
  '&': {
    width: '100%',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'var(--font-family-monospace)',
    fontSize: '13px',
    lineHeight: '1.6',
  },
  '& .cm-content': {
    padding: '0px',
  },
  '& .cm-line': {
    padding: '0px 4px',
  },
  '&.cm-editor.cm-focused': {
    outline: 'none',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--bio-vo-text-primary)',
    borderLeftWidth: '1.5px',
  },
  '&.cm-focused .cm-cursor': {
    visibility: 'visible',
  },
  '&.cm-editor': {
    backgroundColor: 'transparent',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
  },
  '.cm-foldGutter': {
    width: '14px',
  },
  '.cm-foldGutter .cm-gutterElement': {
    padding: '0',
    cursor: 'pointer',
    color: 'var(--cds-icon-secondary, #525252)',
    lineHeight: '1.6',
  },
  '& .cm-selectionBackground': {
    backgroundColor: 'var(--cds-highlight, #d0e2ff)',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--cds-highlight, #d0e2ff)',
  },
});

export default baseTheme;

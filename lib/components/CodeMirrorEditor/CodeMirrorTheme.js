import { EditorView } from '@codemirror/view';

const baseTheme = EditorView.theme({
  '&': {
    width: '100%',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'var(--font-mono)',
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
    borderLeftColor: 'var(--foreground)',
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
    color: 'var(--neutral-foreground-subtle)',
    lineHeight: '1.6',
  },
  '& .cm-selectionBackground': {
    backgroundColor: 'var(--accent-background-subtle)',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--accent-background-subtle)',
  },
});

export default baseTheme;

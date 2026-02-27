import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

const baseTheme = EditorView.theme({
  '&': {
    width: '100%',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: '"IBM Plex Mono", "Roboto Mono", monospace',
    fontSize: '12px',
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
    borderLeftColor: 'var(--cds-text-primary, #161616)',
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

const highlightTheme = EditorView.baseTheme({
  '& .json-property': {
    color: '#0967d3',
    fontWeight: '600',
  },
  '& .json-string': {
    color: '#22863a',
  },
  '& .json-number': {
    color: '#e65100',
  },
  '& .json-bool': {
    color: '#9333ea',
  },
  '& .json-null': {
    color: '#808080',
    fontStyle: 'italic',
  },
});

const syntaxClasses = syntaxHighlighting(
  HighlightStyle.define([
    { tag: t.propertyName, class: 'json-property' },
    { tag: t.string, class: 'json-string' },
    { tag: t.number, class: 'json-number' },
    { tag: t.bool, class: 'json-bool' },
    { tag: t.null, class: 'json-null' },
  ])
);

export default [ baseTheme, highlightTheme, syntaxClasses ];

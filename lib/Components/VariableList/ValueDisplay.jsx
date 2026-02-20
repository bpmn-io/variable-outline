// eslint-disable-next-line no-unused-vars
import React, { useRef, useEffect, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, drawSelection, keymap } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { foldGutter, foldKeymap } from '@codemirror/language';
import theme from './CodeMirrorTheme';
import { feelPathTooltip } from './feelPathTooltip';
import { foldPreview } from './foldPreview';

function entriesToObject(entries, isList) {
  if (isList) {
    return entries.map(e => entryToValue(e));
  }
  const obj = {};
  for (const e of entries) {
    obj[e.name] = entryToValue(e);
  }
  return obj;
}

function entryToValue(entry) {
  if (entry.entries && entry.entries.length > 0) {
    return entriesToObject(entry.entries, entry.isList);
  }
  if (entry.type === 'Null' || entry.info === null) return null;
  if (!entry.info) return undefined;
  const trimmed = entry.info.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== '') return num;
  return entry.info;
}

function buildDoc(info, type, entries, isList) {
  if (entries && entries.length > 0) {
    return JSON.stringify(entriesToObject(entries, isList), null, 2);
  }
  if (type === 'Null' || info === null) return 'null';
  return info != null ? String(info) : '';
}

function CodeMirrorJson({ doc, variableName }) {
  const ref = useRef(null);
  const [ view, setView ] = useState(null);

  useEffect(() => {
    if (!ref.current) return;

    const state = EditorState.create({
      doc,
      extensions: [
        json(),
        EditorState.readOnly.of(true),
        EditorView.contentAttributes.of({ tabindex: '0' }),
        EditorView.lineWrapping,
        drawSelection(),
        foldGutter(),
        foldPreview(),
        keymap.of(foldKeymap),
        theme,
        feelPathTooltip(variableName),
      ],
    });

    const editorView = new EditorView({ state, parent: ref.current });
    setView(editorView);
    return () => editorView.destroy();
  }, []);

  useEffect(() => {
    if (!view) return;
    const current = view.state.doc.toString();
    if (doc !== current) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: doc } });
    }
  }, [ view, doc ]);

  return <div ref={ ref } className="vd-codemirror" />;
}

export default function ValueDisplay({ info, type, entries, isList, variableName }) {
  const hasEntries = entries?.length > 0;
  const infoPresent = type === 'Null' || info === null || (info !== null && info !== undefined && info !== '');

  if (!infoPresent && !hasEntries) return null;

  const doc = buildDoc(info, type, entries, isList);

  return (
    <div className="vd-root">
      <CodeMirrorJson doc={ doc } variableName={ variableName } />
    </div>
  );
}


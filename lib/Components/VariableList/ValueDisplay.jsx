import { useRef, useEffect, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { foldGutter, foldKeymap } from '@codemirror/language';
import theme from './CodeMirrorTheme';
import { foldPreview } from './foldPreview';
import { jsonInteractiveControls, closeMenuEffect, setActiveTokenEffect } from './jsonInteractiveControls';
import { ContextMenu } from './ContextMenu';

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
  const [ menuState, setMenuState ] = useState(null);

  useEffect(() => {
    if (!ref.current) return;

    const state = EditorState.create({
      doc,
      extensions: [
        json(),
        EditorState.readOnly.of(true),
        EditorView.contentAttributes.of({ tabindex: '0' }),
        EditorView.lineWrapping,
        foldGutter(),
        foldPreview(),
        jsonInteractiveControls(variableName, setMenuState),
        keymap.of(foldKeymap),
        theme,
      ]
    });

    const editorView = new EditorView({
      state,
      parent: ref.current
    });

    setView(editorView);

    return () => editorView.destroy();
  }, [ doc, variableName ]);

  const handleCloseMenu = () => {
    if (view) {
      view.dispatch({
        effects: [
          closeMenuEffect.of(null),
          setActiveTokenEffect.of(null)
        ]
      });
      view.focus();
    }
    setMenuState(null);
  };

  return (
    <div ref={ ref } className="vd-codemirror">
      {menuState && view && (
        <ContextMenu
          menuState={ menuState }
          view={ view }
          rootVariableName={ variableName }
          onClose={ handleCloseMenu }
        />
      )}
    </div>
  );
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

import { useRef, useEffect, useState, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { foldGutter, foldKeymap, foldAll } from '@codemirror/language';
import theme from '../Components/CodeMirrorEditor/CodeMirrorTheme';
import { foldPreview } from '../Components/CodeMirrorEditor/foldPreview';
import { jsonInteractiveControls, closeMenuEffect, setActiveTokenEffect } from '../Components/CodeMirrorEditor/jsonInteractiveControls';
import { primitiveHighlight } from '../Components/CodeMirrorEditor/primitiveHighlight';
import { feelExpressionIcon, feelPrimitiveIcon } from '../Components/CodeMirrorEditor/feelExpressionIcon';

export default function useCodeMirror({ doc, variableName, isJson, onMenuStateChange }) {
  const ref = useRef(null);
  const [ view, setView ] = useState(null);

  useEffect(() => {
    if (!ref.current) return;

    const baseExtensions = [
      EditorState.readOnly.of(true),
      EditorView.contentAttributes.of({ tabindex: '0', 'aria-label': `Value of ${ variableName }` }),
      EditorView.lineWrapping,
      theme,
    ];

    const languageExtensions = isJson ? [
      json(),
      foldGutter(),
      foldPreview(),
      jsonInteractiveControls(variableName, onMenuStateChange),
      feelExpressionIcon(),
      keymap.of(foldKeymap),
    ] : [ primitiveHighlight(), feelPrimitiveIcon() ];

    const state = EditorState.create({
      doc,
      extensions: [ ...baseExtensions, ...languageExtensions ]
    });

    const editorView = new EditorView({
      state,
      parent: ref.current
    });

    if (isJson) {
      foldAll(editorView);
    }

    setView(editorView);

    return () => editorView.destroy();
  }, [ doc, variableName, isJson ]);

  const closeMenu = useCallback(() => {
    if (view) {
      view.dispatch({
        effects: [
          closeMenuEffect.of(null),
          setActiveTokenEffect.of(null)
        ]
      });
      view.focus();
    }
    onMenuStateChange(null);
  }, [ view ]);

  return { ref, view, closeMenu };
}

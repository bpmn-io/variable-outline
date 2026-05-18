import { useRef, useEffect, useState, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { feelLanguage } from '@bpmn-io/lang-feel';
import { foldGutter, foldKeymap, foldAll, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import theme from '../components/CodeMirrorEditor/CodeMirrorTheme';
import { foldPreview } from '../components/CodeMirrorEditor/foldPreview';
import { interactiveControls, closeMenuEffect, setActiveTokenEffect } from '../components/CodeMirrorEditor/interactiveControls';
import { feelPrimitiveIcon } from '../components/CodeMirrorEditor/feelExpressionIcon';

export default function useCodeMirror({ doc, variableName, isFeel, isStructured, onMenuStateChange }) {
  const ref = useRef(null);
  const [ view, setView ] = useState(null);

  useEffect(() => {
    if (!ref.current) return;

    const baseExtensions = [
      EditorState.readOnly.of(true),
      EditorView.contentAttributes.of({ tabindex: '0', 'aria-label': `Value of ${ variableName }` }),
      EditorView.lineWrapping,
      theme,
      feelLanguage.extension,
      syntaxHighlighting(defaultHighlightStyle),
    ];

    const modeExtensions = isStructured
      ? [
        feelPrimitiveIcon(),
        foldGutter(),
        foldPreview(),
        interactiveControls(variableName, onMenuStateChange),
        keymap.of(foldKeymap),
      ]
      : isFeel
        ? [ feelPrimitiveIcon() ]
        : [];

    const state = EditorState.create({
      doc,
      extensions: [ ...baseExtensions, ...modeExtensions ]
    });

    const editorView = new EditorView({
      state,
      parent: ref.current
    });

    if (isStructured) {
      foldAll(editorView);
    }

    setView(editorView);

    return () => {
      editorView.destroy();
    };
  }, [ variableName, isFeel, isStructured, onMenuStateChange ]);

  useEffect(() => {
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== doc) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: doc }
      });
    }
  }, [ doc, view ]);

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
  }, [ view, onMenuStateChange ]);

  return { ref, view, closeMenu };
}

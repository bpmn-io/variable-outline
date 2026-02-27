import { useRef, useEffect, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { foldGutter, foldKeymap } from '@codemirror/language';
import theme from './CodeMirrorTheme';
import { foldPreview } from './foldPreview';
import { jsonInteractiveControls, closeMenuEffect, setActiveTokenEffect } from './jsonInteractiveControls';
import { ContextMenu } from './ContextMenu';

export default function CodeMirrorEditor({ doc, variableName, isJson }) {
  const ref = useRef(null);
  const [ view, setView ] = useState(null);
  const [ menuState, setMenuState ] = useState(null);

  useEffect(() => {
    if (!ref.current) return;

    const baseExtensions = [
      EditorState.readOnly.of(true),
      EditorView.contentAttributes.of({ tabindex: '0', 'aria-label': `Value of ${ variableName }` }),
      EditorView.lineWrapping,
      theme,
    ];

    const jsonExtensions = isJson ? [
      json(),
      foldGutter(),
      foldPreview(),
      jsonInteractiveControls(variableName, setMenuState),
      keymap.of(foldKeymap),
    ] : [];

    const state = EditorState.create({
      doc,
      extensions: [ ...baseExtensions, ...jsonExtensions ]
    });

    const editorView = new EditorView({
      state,
      parent: ref.current
    });

    setView(editorView);

    return () => editorView.destroy();
  }, [ doc, variableName, isJson ]);

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

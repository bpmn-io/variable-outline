import { useState } from 'react';
import useCodeMirror from '../../hooks/useCodeMirror';
import { ContextMenu } from './ContextMenu';

export default function CodeMirrorEditor({ doc, variableName, isJson }) {
  const [ menuState, setMenuState ] = useState(null);
  const { ref, view, closeMenu } = useCodeMirror({
    doc,
    variableName,
    isJson,
    onMenuStateChange: setMenuState
  });

  return (
    <div ref={ ref } className="vd-codemirror">
      {menuState && view && (
        <ContextMenu
          menuState={ menuState }
          view={ view }
          rootVariableName={ variableName }
          onClose={ closeMenu }
        />
      )}
    </div>
  );
}

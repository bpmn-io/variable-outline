import { useState } from 'react';
import { Theme } from '@carbon/react';
import './App.css';
import { Modeler } from './Modeler/Modeler';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { BottomPanel } from './BottomPanel/BottomPanel';
import DropZone from './DropZone/DropZone';


function App() {

  const [ modeler, setModeler ] = useState(null);
  const [ content, setContent ] = useState(null);

  return (
    <>
      <Theme theme="g10" style={ { height: '100%' } }>
        <DropZone setContent={ setContent }>
          <PanelGroup autoSaveId="main" direction="vertical">
            <Panel minSize={ 25 }>
              <Modeler xml={ content } setModeler={ setModeler } modeler={ modeler } />
            </Panel>
            <PanelResizeHandle>
              <div className="HorizontalResizeHandle"></div>
            </PanelResizeHandle>
            <Panel defaultSize={ 25 }>
              {modeler && <BottomPanel injector={ modeler.get('injector') } />}
            </Panel>
          </PanelGroup>
        </DropZone>
      </Theme>
    </>
  );
}

export default App;

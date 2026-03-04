import { useState } from 'react';
import { Theme } from '@carbon/react';
import { Modeler } from './Modeler/Modeler';
import DropZone from './DropZone/DropZone';


function App() {

  const [ modeler, setModeler ] = useState(null);
  const [ content, setContent ] = useState(null);

  return (
    <Theme theme="g10" style={ { height: '100%' } }>
      <DropZone setContent={ setContent }>
        <Modeler xml={ content } setModeler={ setModeler } modeler={ modeler } />
      </DropZone>
    </Theme>
  );
}

export default App;

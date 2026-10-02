import { useState } from 'react';
import { Modeler } from './Modeler/Modeler';
import DropZone from './DropZone/DropZone';


function App() {

  const [ modeler, setModeler ] = useState(null);
  const [ content, setContent ] = useState(null);

  return (
    <DropZone setContent={ setContent }>
      <Modeler xml={ content } setModeler={ setModeler } modeler={ modeler } />
    </DropZone>
  );
}

export default App;

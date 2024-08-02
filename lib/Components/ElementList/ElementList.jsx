import { TreeView, TreeNode, Tooltip } from '@carbon/react';
import useService from '../../hooks/useService';
import { getSVGComponent } from './Icons';

import './ElementList.scss';
import { useEffect, useState } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';

export default function ElementList(props) {
  const {
    availableVariables
  } = props;

  const [ rootElements, setRootElements ] = useState([]);

  const eventBus = useService('eventBus');
  const bpmnJS = useService('bpmnjs');

  // Handle elements changed ==> list on the left
  useEffect(() => {
    function updateScopes() {
      if (!bpmnJS) {
        return;
      }

      const rootElements = bpmnJS.getDefinitions()?.get('rootElements').filter(element => {
        return is(element, 'bpmn:Process');
      });

      setRootElements(rootElements);
    }

    eventBus.on([ 'commandStack.changed', 'import.done' ], updateScopes);

    updateScopes();

    return () => {
      eventBus.off([ 'commandStack.changed', 'import.done' ], updateScopes);
    };
  }, [ eventBus, bpmnJS ]);

  if (!rootElements || !rootElements.length) {
    return null;
  }

  return <div className="bio-vo-element-list">
    <Tooltip align="bottom-start" label="Elements that create or write variables">
      <div className="bio-vo-label bio-vo-tooltip-wrapper">Elements</div>
    </Tooltip>
    <TreeView label="Elements" hideLabel>
      {rootElements.map(element => <ElementEntry key={ element.id } element={ element } availableVariables={ availableVariables } />)}
    </TreeView>
  </div>;
}

function ElementEntry(props) {
  const {
    element: bo,
    availableVariables,
    ...treeNodeProps
  } = props;

  const canvas = useService('canvas');
  const selection = useService('selection');
  const elementRegistry = useService('elementRegistry');

  const element = elementRegistry.get(bo.id);

  const handleSelect = (event) => {
    let elementToSelect = element;

    if (!elementToSelect && is(bo, 'bpmn:Process')) {

      // Diagram is a collaboration, we can select the participant
      const participant = findParticipant(bo);

      if (!participant) {
        return;
      }

      elementToSelect = elementRegistry.get(participant.id);
    }

    if (!elementToSelect || is(elementToSelect, 'bpmn:Process')) {
      return;
    }

    const multiSelect = event.shiftKey;

    if (multiSelect && selection.isSelected(elementToSelect)) {
      selection.deselect(elementToSelect);
      return;
    }

    canvas.scrollToElement(elementToSelect);
    selection.select(elementToSelect, event.shiftKey);
  };

  const selected = selection.get();

  const hasOwnVariables = availableVariables.some(variable => {
    return variable.scope.id === bo.id || variable.origin.some(o => o.id === bo.id);
  });

  const children = bo.flowElements && bo.flowElements
    .sort((a, b) => {
      return (a.name || a.id).localeCompare(b.name || b.id);
    }) // order by name
    .map(el => <ElementEntry
      key={ el.id }
      element={ el }
      availableVariables={ availableVariables } />)
    .filter(Boolean); // filter out hidden entries. Important for parents visibility

  const isSelected = selected.some(s => (s.id === bo.id || s.businessObject?.processRef?.id === bo.id));

  const shouldShow = hasOwnVariables || (children && children.length) || isSelected || is(element, 'bpmn:Process');

  const icon = getSVGComponent(element || bo);

  return <>
    {shouldShow && (
      <TreeNode
        { ...treeNodeProps }
        key={ bo.id }
        id={ bo.id }
        value={ bo.id }
        renderIcon={ icon }
        label={
          bo.name || bo.label || bo.id
        }
        onSelect={ handleSelect }
        selected={ isSelected ? [ bo.id ] : [] }
        active={ isSelected ? bo.id : null }
        isExpanded={ true }
      >
        { children }
      </TreeNode>
    )}
  </>;
}


// helper //////////////////////
function findParticipant(processBo) {
  const definition = processBo.$parent;
  const collaboration = definition?.get('rootElements')?.find(root => is(root, 'bpmn:Collaboration'));

  if (collaboration) {
    return collaboration.get('participants').find(participant => participant.processRef === processBo);
  }
}
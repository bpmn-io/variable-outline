import { beforeEach, describe, expect, it } from 'vitest';

import CamundaCloudModeler from 'camunda-bpmn-js/dist/camunda-cloud-modeler.development.js';

import { bootstrapBpmnJS, inject } from 'bpmn-js/test/helper';

import diagramXML from './diagram.xml?raw';
import { render } from '@testing-library/react';
import ElementList from '../ElementList';
import { InjectorContext } from '../../../Context/InjectorContex';
import { act } from 'react';

function bootstrapModeler(diagram, options) {
  return bootstrapBpmnJS(CamundaCloudModeler, diagram, options);
}


beforeEach(bootstrapModeler(diagramXML));

let wrapper;
beforeEach(inject(async (injector) => {
  wrapper = ({ children }) => <InjectorContext.Provider value={ injector }>{children}</InjectorContext.Provider>;
}));

it('should show list of Elements', inject(async (variableResolver) => {

  // given
  const allVariables = await variableResolver.getVariables();
  const processVariables = allVariables['Process_1'];

  // when
  const { container } = render(<ElementList availableVariables={ processVariables } />, { wrapper });

  const labels = getLabels(container);

  // then
  expect(labels).to.have.length(2);
  expect(labels).to.eql([ 'Process 1', 'Task 1' ]);
}));


it('should always show root element', inject(async () => {

  // when
  const { container } = render(<ElementList availableVariables={ [] } />, { wrapper });

  const labels = getLabels(container);

  // then
  expect(labels).to.have.length(1);
  expect(labels).to.eql([ 'Process 1' ]);
}));


describe('selection', () => {

  it('should show selected element', inject(async (variableResolver, selection, elementRegistry) => {

    // given
    const task2 = elementRegistry.get('Task_2');
    selection.select(task2);

    const allVariables = await variableResolver.getVariables();
    const processVariables = allVariables['Process_1'];

    // when
    const { container } = render(<ElementList availableVariables={ processVariables } />, { wrapper });

    const labels = getLabels(container);

    // then
    expect(labels).to.have.length(3);
    expect(labels).to.eql([ 'Process 1', 'Task 1', 'Task 2' ]);
  }));


  it('should select elements', inject(async (variableResolver, selection) => {

    // given
    const allVariables = await variableResolver.getVariables();
    const processVariables = allVariables['Process_1'];

    const { container } = render(<ElementList availableVariables={ processVariables } />, { wrapper });
    const TaskLabel = container.querySelectorAll('.cds--tree-node__label')[1];

    // assume
    expect(selection.get()).to.have.length(0);

    // when
    await act(() => {
      TaskLabel.click();
    });

    // then
    expect(selection.get()).to.have.length(1);
  }));


  it('should scroll to element', inject(async (variableResolver, selection, canvas) => {

    // given
    const allVariables = await variableResolver.getVariables();
    const processVariables = allVariables['Process_1'];
    canvas.scroll({ dx: 10000, dy: 0 });

    const { container } = render(<ElementList availableVariables={ processVariables } />, { wrapper });
    const TaskLabel = container.querySelectorAll('.cds--tree-node__label')[1];

    // assume
    const initalViewbox = canvas.viewbox();
    expect(initalViewbox.x).to.be.closeTo(-10000, 100);

    // when
    await act(() => {
      TaskLabel.click();
    });

    // then
    const finalViewbox = canvas.viewbox();
    expect(finalViewbox.x).to.be.closeTo(0, 100);
  }));


  // TODO: find a stable way to test shift key
  it.skip('should select multiple elements');

});

// helper

function getLabels(container) {
  const nodes = container.querySelectorAll('.cds--tree-node__label');

  return Array.from(nodes).map(node => node.textContent);
}
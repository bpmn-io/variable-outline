import { beforeEach, describe, expect, it } from 'vitest';

import CamundaCloudModeler from 'camunda-bpmn-js/dist/camunda-cloud-modeler.development.js';

import { bootstrapBpmnJS, inject } from 'bpmn-js/test/helper';

import diagramXML from './diagram.xml?raw';
import { getVariables } from '../useVariables';

function bootstrapModeler(diagram, options) {
  return bootstrapBpmnJS(CamundaCloudModeler, diagram, options);
}

describe('#getVariables', () => {

  beforeEach(bootstrapModeler(diagramXML));

  it('should provide variables', inject(async (variableResolver, selection) => {

    // given
    const filter = {
      search: '',
      filterType: 'all',
      selectedElements: []
    };

    // when
    const { rawVariables, availableVariables, filteredVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(rawVariables).to.have.length(4); // All variables
    expect(filteredVariables).to.have.length(4); // Variables filtered by search
    expect(availableVariables).to.have.length(2); // Variables available for selection

    expect(availableVariables.map(v => v.name)).not.to.include('localVariable');
  }));


  it('should filter for search terms', inject(async (variableResolver, selection) => {

    // given
    const filter = {
      search: 'localVariable',
      filterType: 'all',
      selectedElements: []
    };

    // when
    const { rawVariables, availableVariables, filteredVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(rawVariables).to.have.length(4); // All variables
    expect(filteredVariables).to.have.length(2); // variables filtered by search
    expect(availableVariables).to.have.length(0); // no variable available for selection
  }));


  it('should filter for selection', inject(async (elementRegistry, variableResolver, selection) => {

    // given
    const task = elementRegistry.get('Task_1');
    selection.select(task);

    const filter = {
      search: '',
      filterType: 'all',
      selectedElements: []
    };

    // when
    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(availableVariables).to.have.length(3);
    expect(availableVariables.map(v => v.name)).to.include('localVariable');
  }));


  it('should filter for selected elements', inject(async (variableResolver, selection) => {

    // given
    const filter = {
      search: '',
      filterType: 'all',
      selectedElements: [ 'Task_1' ]
    };

    // when
    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(availableVariables).to.have.length(1);
    expect(availableVariables.map(v => v.name)).to.include('Task1Variable');
  }));


  it('should filter for multi-select', inject(async (variableResolver, selection) => {

    // given
    const filter = {
      search: '',
      filterType: 'all',
      selectedElements: [ 'Task_1', 'Task_2' ]
    };

    // when
    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(availableVariables).to.have.length(2);
    expect(availableVariables.map(v => v.name)).to.include('Task1Variable');
    expect(availableVariables.map(v => v.name)).to.include('Task2Variable');
  }));
});

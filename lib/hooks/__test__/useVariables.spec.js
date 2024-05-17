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
      filterType: 'all'
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
      filterType: 'all'
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
      filterType: 'all'
    };

    // when
    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(availableVariables).to.have.length(3);
    expect(availableVariables.map(v => v.name)).to.include('localVariable');
  }));


  it('should filter for origin', inject(async (elementRegistry, variableResolver, selection) => {

    // given
    const task = elementRegistry.get('Task_1');
    selection.select(task);

    const filter = {
      search: '',
      filterType: 'origin'
    };

    // when
    const { availableVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(availableVariables).to.have.length(2);
    expect(availableVariables.map(v => v.name)).to.include('localVariable');
    expect(availableVariables.map(v => v.name)).not.to.include('Task2Variable');
  }));


  it('should filter for multi-select', inject(async (elementRegistry, variableResolver, selection) => {

    // given
    const task1 = elementRegistry.get('Task_1');
    const task2 = elementRegistry.get('Task_2');
    selection.select([ task1, task2 ]);

    const filter = {
      search: '',
      filterType: 'origin'
    };

    // when
    const { rawVariables, availableVariables } = await getVariables({ variableResolver, selection, filter });

    // then
    expect(rawVariables).to.have.length(4); // All variables
    expect(availableVariables).to.have.length(4);
    expect(availableVariables.map(v => v.name)).to.include('localVariable');
    expect(availableVariables.map(v => v.name)).to.include('Task1Variable');
  }));

});

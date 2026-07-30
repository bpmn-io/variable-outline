import { beforeEach, describe, expect, it } from 'vitest';

// the source entry, not the pre-bundled dist: the dist ships its own copy of
// bpmn-js-properties-panel, so it would resolve against a panel older than the
// one this package is developed against
import CamundaCloudModeler from 'camunda-bpmn-js/lib/camunda-cloud/Modeler';

import { bootstrapBpmnJS, inject } from 'bpmn-js/test/helper';

import diagramXML from './definition-path.xml?raw';
import { getDefinitionPath } from '../definitionPath';


// pins the derived paths to what the properties panel actually resolves them to,
// so a change to either side fails here instead of silently revealing nothing
describe('definitionPath - properties panel resolution', () => {

  beforeEach(bootstrapBpmnJS(CamundaCloudModeler, diagramXML));


  it('should resolve an output mapping target', inject((elementRegistry, propertiesPanel) => {

    // given
    const element = elementRegistry.get('MappingTask');

    // when
    const entryId = propertiesPanel.getEntryId(element, getDefinitionPath(element, 'orderId'));

    // then
    expect(entryId).to.eql('MappingTask-output-0-target');
  }));


  it('should resolve an input mapping target', inject((elementRegistry, propertiesPanel) => {

    // given
    const element = elementRegistry.get('MappingTask');

    // when
    const entryId = propertiesPanel.getEntryId(element, getDefinitionPath(element, 'localInput'));

    // then
    expect(entryId).to.eql('MappingTask-input-0-target');
  }));


  it('should resolve a script result variable', inject((elementRegistry, propertiesPanel) => {

    // given
    const element = elementRegistry.get('ScriptTask');

    // when
    const entryId = propertiesPanel.getEntryId(element, getDefinitionPath(element, 'scriptResult'));

    // then
    expect(entryId).to.eql('resultVariable');
  }));


  it('should resolve a called decision result variable', inject((elementRegistry, propertiesPanel) => {

    // given
    const element = elementRegistry.get('DecisionTask');

    // when
    const entryId = propertiesPanel.getEntryId(element, getDefinitionPath(element, 'decisionResult'));

    // then
    expect(entryId).to.eql('resultVariable');
  }));


  it('should resolve an example output property', inject((elementRegistry, propertiesPanel) => {

    // given
    const element = elementRegistry.get('ExampleDataTask');

    // when
    const entryId = propertiesPanel.getEntryId(element, getDefinitionPath(element, 'exampleValue'));

    // then
    expect(entryId).to.eql('ExampleDataTask-extensionProperty-0-value');
  }));

});

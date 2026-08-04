import { describe, it, expect } from 'vitest';

import { getDefinitionPath } from '../definitionPath';


describe('definitionPath', () => {

  describe('io mapping', () => {

    it('should point at the output mapping target', () => {

      // given
      const bo = businessObject('Task_1', ioMapping({ outputs: [ 'foo', 'bar' ] }));

      // when
      const path = getDefinitionPath(bo, 'bar');

      // then
      expect(path).toEqual([ 'extensionElements', 'values', 0, 'outputParameters', 1, 'target' ]);
    });


    it('should point at the input mapping target when only an input matches', () => {

      // given
      const bo = businessObject('Task_1', ioMapping({ inputs: [ 'localVar' ] }));

      // when
      const path = getDefinitionPath(bo, 'localVar');

      // then
      expect(path).toEqual([ 'extensionElements', 'values', 0, 'inputParameters', 0, 'target' ]);
    });


    it('should prefer the output mapping over the input mapping', () => {

      // given
      const bo = businessObject('Task_1', ioMapping({ outputs: [ 'x' ], inputs: [ 'x' ] }));

      // when
      const path = getDefinitionPath(bo, 'x');

      // then
      expect(path).toEqual([ 'extensionElements', 'values', 0, 'outputParameters', 0, 'target' ]);
    });


    it('should return null when no mapping row matches', () => {

      // given
      const bo = businessObject('Task_1', ioMapping({ outputs: [ 'foo' ] }));

      // when
      const path = getDefinitionPath(bo, 'missing');

      // then
      expect(path).toBe(null);
    });

  });


  describe('result variable', () => {

    it('should point at the script result variable', () => {

      // given
      const bo = businessObject('Task_1', script('scriptResult'));

      // when
      const path = getDefinitionPath(bo, 'scriptResult');

      // then
      expect(path).toEqual([ 'extensionElements', 'values', 0, 'resultVariable' ]);
    });


    it('should point at the called decision result variable', () => {

      // given
      const bo = businessObject('Task_1', calledDecision('decisionResult'));

      // when
      const path = getDefinitionPath(bo, 'decisionResult');

      // then
      expect(path).toEqual([ 'extensionElements', 'values', 0, 'resultVariable' ]);
    });


    it('should return null when the result variable does not match', () => {

      // given
      const bo = businessObject('Task_1', script('scriptResult'));

      // when
      const path = getDefinitionPath(bo, 'other');

      // then
      expect(path).toBe(null);
    });

  });


  describe('example output data', () => {

    it('should point at the example output property value', () => {

      // given
      const bo = businessObject('Task_1', zeebeProperties({ expenseAmount: 650 }));

      // when
      const path = getDefinitionPath(bo, 'expenseAmount');

      // then
      expect(path).toEqual([ 'extensionElements', 'values', 0, 'properties', 0, 'value' ]);
    });


    it('should return null when the example output does not declare the variable', () => {

      // given
      const bo = businessObject('Task_1', zeebeProperties({ expenseAmount: 650 }));

      // when
      const path = getDefinitionPath(bo, 'other');

      // then
      expect(path).toBe(null);
    });


    it('should return null for a malformed example output', () => {

      // given
      const bo = businessObject('Task_1', zeebeProperties('{ not json'));

      // when
      const path = getDefinitionPath(bo, 'expenseAmount');

      // then
      expect(path).toBe(null);
    });

  });


  describe('element resolution', () => {

    it('should resolve the business object of a diagram element', () => {

      // given
      const bo = businessObject('Task_1', ioMapping({ outputs: [ 'foo' ] }));

      // when
      const path = getDefinitionPath({ id: 'Task_1', businessObject: bo }, 'foo');

      // then
      expect(path).toEqual([ 'extensionElements', 'values', 0, 'outputParameters', 0, 'target' ]);
    });

  });


  describe('path indices', () => {

    it('should index the extension element by its position', () => {

      // given
      const bo = businessObject('Task_1', taskDefinition(), ioMapping({ outputs: [ 'foo' ] }));

      // when
      const path = getDefinitionPath(bo, 'foo');

      // then
      expect(path).toEqual([ 'extensionElements', 'values', 1, 'outputParameters', 0, 'target' ]);
    });


    it('should index the example output property by its position', () => {

      // given
      const bo = businessObject('Task_1', zeebeProperties({ expenseAmount: 650 }, { leading: 'property' }));

      // when
      const path = getDefinitionPath(bo, 'expenseAmount');

      // then
      expect(path).toEqual([ 'extensionElements', 'values', 0, 'properties', 1, 'value' ]);
    });

  });


  describe('no definition', () => {

    it('should return null without extension elements', () => {

      // given
      const bo = businessObject('Task_1');

      // when
      const path = getDefinitionPath(bo, 'foo');

      // then
      expect(path).toBe(null);
    });


    it('should return null without a variable name', () => {

      // given
      const bo = businessObject('Task_1', ioMapping({ outputs: [ 'foo' ] }));

      // when
      const path = getDefinitionPath(bo, undefined);

      // then
      expect(path).toBe(null);
    });

  });

});


// helpers /////////////////////////

function parameter(target) {
  return { get: key => key === 'target' ? target : undefined };
}

function ioMapping({ outputs = [], inputs = [] }) {
  return {
    $type: 'zeebe:IoMapping',
    get(key) {
      if (key === 'outputParameters') return outputs.map(parameter);
      if (key === 'inputParameters') return inputs.map(parameter);
      return undefined;
    }
  };
}

function taskDefinition() {
  return {
    $type: 'zeebe:TaskDefinition',
    get: key => key === 'type' ? 'worker' : undefined
  };
}

function script(resultVariable) {
  return {
    $type: 'zeebe:Script',
    get: key => key === 'resultVariable' ? resultVariable : undefined
  };
}

function calledDecision(resultVariable) {
  return {
    $type: 'zeebe:CalledDecision',
    get: key => key === 'resultVariable' ? resultVariable : undefined
  };
}

function property(name, value) {
  return {
    get(key) {
      if (key === 'name') return name;
      if (key === 'value') return value;
      return undefined;
    }
  };
}

function zeebeProperties(exampleOutput, ...leadingProperties) {
  const value = typeof exampleOutput === 'string' ? exampleOutput : JSON.stringify(exampleOutput);

  const properties = [
    ...leadingProperties.map(leading => property('other', JSON.stringify(leading))),
    property('camundaModeler:exampleOutputJson', value)
  ];

  return {
    $type: 'zeebe:Properties',
    get: key => key === 'properties' ? properties : undefined
  };
}

function businessObject(id, ...extensions) {
  const values = extensions.filter(Boolean);

  const extensionElements = values.length
    ? { get: key => key === 'values' ? values : undefined }
    : null;

  return {
    id,
    get: key => key === 'extensionElements' ? extensionElements : undefined
  };
}

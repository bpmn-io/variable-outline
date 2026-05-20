import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import VariableRow from '../VariableRow';
import { InjectorContext } from '../../../context/InjectorContext';


describe('VariableRow', () => {

  describe('Used by section', () => {

    it('should not render "Used by" section when usedBy is undefined', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer Task', $type: 'bpmn:Task' }
        ],
        usedBy: undefined
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.queryByText('Used by')).not.to.exist;
    });

    it('should not render "Used by" section when usedBy contains only strings', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer Task', $type: 'bpmn:Task' }
        ],
        usedBy: [ 'targetVar', 'anotherVar' ]
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.queryByText('Used by')).not.to.exist;
    });

    it('should render "Used by" section with single reader element', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer Task', $type: 'bpmn:Task' }
        ],
        usedBy: [
          { id: 'Task_2', name: 'Reader Task', $type: 'bpmn:Task' }
        ]
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.getByText('Used by')).to.exist;
    });

    it('should render "Used by" section with multiple reader elements', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer Task', $type: 'bpmn:Task' }
        ],
        usedBy: [
          { id: 'Task_2', name: 'Reader Task 1', $type: 'bpmn:Task' },
          { id: 'Task_3', name: 'Reader Task 2', $type: 'bpmn:Task' }
        ]
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.getByText('Used by 2 elements')).to.exist;
    });

    it('should filter out strings and render only element readers', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer Task', $type: 'bpmn:Task' }
        ],
        usedBy: [
          'targetVar',
          { id: 'Task_2', name: 'Reader Task', $type: 'bpmn:Task' },
          'anotherVar'
        ]
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.getByText('Used by')).to.exist;
      expect(screen.getAllByRole('button', { name: /Reader Task/ })).to.have.lengthOf(1);
    });

  });

});


// helpers /////////////////////////

function renderVariableRow(variable) {
  const mockInjector = {
    get: (service) => {
      const services = {
        selection: { get: () => [] },
        canvas: { scrollToElement: () => {} },
        elementRegistry: { get: () => null }
      };
      return services[service];
    }
  };

  return render(
    <InjectorContext.Provider value={ mockInjector }>
      <VariableRow
        variable={ variable }
        isSelectedOrigin={ false }
        expanded={ true }
        onToggle={ () => {} }
      />
    </InjectorContext.Provider>
  );
}

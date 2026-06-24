import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import VariableRow from '../VariableRow';
import { InjectorContext } from '../../../context/InjectorContext';


describe('VariableRow', () => {

  describe('variants', () => {

    it('should render per-variant "Written by" sections when variable has multiple variants', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' },
          { id: 'Task_2', name: 'Writer B', $type: 'bpmn:Task' }
        ],
        variants: [
          {
            origin: [ { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' } ],
            type: 'String',
            info: 'hello'
          },
          {
            origin: [ { id: 'Task_2', name: 'Writer B', $type: 'bpmn:Task' } ],
            type: 'Number',
            info: '42'
          }
        ]
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.getAllByText('Written by')).to.have.lengthOf(2);
    });

    it('should not render merged "Value" section when variants are present', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' },
          { id: 'Task_2', name: 'Writer B', $type: 'bpmn:Task' }
        ],
        type: 'String',
        info: 'merged',
        variants: [
          {
            origin: [ { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' } ],
            type: 'String',
            info: 'hello'
          },
          {
            origin: [ { id: 'Task_2', name: 'Writer B', $type: 'bpmn:Task' } ],
            type: 'Number',
            info: '42'
          }
        ]
      };

      // when
      renderVariableRow(variable);

      // then
      const tooltips = document.querySelectorAll('.bio-vo-tooltip-wrapper');
      expect(tooltips).to.have.lengthOf(0);
    });

    it('should fall back to merged display when variants array has one entry', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [ { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' } ],
        type: 'String',
        info: 'hello',
        variants: [
          {
            origin: [ { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' } ],
            type: 'String',
            info: 'hello'
          }
        ]
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.getByText('Written by')).to.exist;
      expect(screen.getByText('Value')).to.exist;
    });

    it('should still render "Used by" section when variants are present', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' },
          { id: 'Task_2', name: 'Writer B', $type: 'bpmn:Task' }
        ],
        usedBy: [
          { id: 'Task_3', name: 'Reader', $type: 'bpmn:Task' }
        ],
        variants: [
          {
            origin: [ { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' } ],
            type: 'String',
            info: 'hello'
          },
          {
            origin: [ { id: 'Task_2', name: 'Writer B', $type: 'bpmn:Task' } ],
            type: 'Number',
            info: '42'
          }
        ]
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.getByText('Used by')).to.exist;
    });

    it('should render "Value" sections per variant when variants have type/info', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' },
          { id: 'Task_2', name: 'Writer B', $type: 'bpmn:Task' }
        ],
        variants: [
          {
            origin: [ { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' } ],
            type: 'String',
            info: 'hello'
          },
          {
            origin: [ { id: 'Task_2', name: 'Writer B', $type: 'bpmn:Task' } ],
            type: 'Number',
            info: '42'
          }
        ]
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.getAllByText('Value')).to.have.lengthOf(2);
    });

  });

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

  describe('hover highlighting', () => {

    it('should highlight all writers when hovering "Written by N elements"', () => {

      // given
      const writers = [
        { id: 'Task_1', name: 'Writer 1', $type: 'bpmn:Task' },
        { id: 'Task_2', name: 'Writer 2', $type: 'bpmn:Task' }
      ];
      const variable = { name: 'myVar', origin: writers };
      const addMarker = vi.fn();
      renderVariableRow(variable, { addMarker });

      // when
      fireEvent.mouseEnter(screen.getByText('Written by 2 elements').closest('button'));

      // then
      const highlightedElements = addMarker.mock.calls.map(([ el ]) => el.id);
      expect(highlightedElements).toEqual([ 'Task_1', 'Task_2' ]);
    });

    it('should clear highlights for all writers on mouse leave', () => {

      // given
      const writers = [
        { id: 'Task_1', name: 'Writer 1', $type: 'bpmn:Task' },
        { id: 'Task_2', name: 'Writer 2', $type: 'bpmn:Task' }
      ];
      const variable = { name: 'myVar', origin: writers };
      const removeMarker = vi.fn();
      renderVariableRow(variable, { removeMarker });

      // when
      fireEvent.mouseLeave(screen.getByText('Written by 2 elements').closest('button'));

      // then
      const unhighlightedElements = removeMarker.mock.calls.map(([ el ]) => el.id);
      expect(unhighlightedElements).toEqual([ 'Task_1', 'Task_2' ]);
    });

    it('should highlight all readers when hovering "Used by N elements"', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [ { id: 'Task_1', name: 'Writer', $type: 'bpmn:Task' } ],
        usedBy: [
          { id: 'Task_2', name: 'Reader 1', $type: 'bpmn:Task' },
          { id: 'Task_3', name: 'Reader 2', $type: 'bpmn:Task' }
        ]
      };
      const addMarker = vi.fn();
      renderVariableRow(variable, { addMarker });

      // when
      fireEvent.mouseEnter(screen.getByText('Used by 2 elements').closest('button'));

      // then
      const highlightedElements = addMarker.mock.calls.map(([ el ]) => el.id);
      expect(highlightedElements).toEqual([ 'Task_2', 'Task_3' ]);
    });

  });

});


// helpers /////////////////////////

function renderVariableRow(variable, { addMarker = vi.fn(), removeMarker = vi.fn() } = {}) {
  const knownIds = [
    ...variable.origin,
    ...(variable.usedBy || []).filter(el => el && el.id)
  ].map(el => el.id);

  const mockInjector = {
    get: (service) => {
      const services = {
        selection: { get: () => [] },
        canvas: {
          scrollToElement: () => {},
          addMarker,
          removeMarker
        },
        elementRegistry: { get: (id) => knownIds.includes(id) ? { id } : null }
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

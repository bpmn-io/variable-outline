import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import VariableRow from '../VariableRow';
import { FilterContext } from '../../../context/FilterContext';
import { InjectorContext } from '../../../context/InjectorContext';


describe('VariableRow', () => {

  describe('variants', () => {

    it('should render one "writes" row per variant', () => {

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
      expect(screen.getAllByRole('button', { name: /writes/ })).to.have.lengthOf(2);
      expect(screen.getByRole('button', { name: 'Writer A' })).to.exist;
      expect(screen.getByRole('button', { name: 'Writer B' })).to.exist;
    });

    it('should show a one-line value preview per collapsed variant', () => {

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
            type: 'Context',
            entries: [
              { name: 'status' },
              { name: 'timestamp' },
              { name: 'items' }
            ]
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
      expect(screen.getByText('{ status, timestamp, … }')).to.exist;
      expect(screen.getByText('42')).to.exist;
    });

    it('should reveal only the expanded variant value', async () => {

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
      renderVariableRow(variable);

      const [ firstToggle ] = screen.getAllByRole('button', { name: /writes/ });

      // when
      fireEvent.click(firstToggle);

      // then
      expect(firstToggle.getAttribute('aria-expanded')).to.eql('true');
      expect(await screen.findByText('hello')).to.exist;
      expect(screen.getAllByText('42')).to.have.lengthOf(1);
    });

    it('should render single-writer variable through the same "writes" row', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [ { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' } ],
        type: 'String',
        info: 'hello'
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.getByRole('button', { name: /writes/ })).to.exist;
      expect(screen.queryByText('Written by')).not.to.exist;
      expect(screen.queryByText('Value')).not.to.exist;
    });

    it('should navigate on writer click without toggling the variant', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [ { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' } ],
        type: 'String',
        info: 'hello'
      };
      const select = vi.fn();
      renderVariableRow(variable, { select });

      // when
      fireEvent.click(screen.getByRole('button', { name: 'Writer A' }));

      // then
      expect(select).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /writes/ }).getAttribute('aria-expanded')).to.eql('false');
    });

    it('should ignore variants without origin', () => {

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
            type: 'Number'
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
      expect(screen.getAllByRole('button', { name: /writes/ })).to.have.lengthOf(2);
    });

    it('should fall back to one merged "writes" row when no variant has an origin', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [ { id: 'Task_1', name: 'Writer A', $type: 'bpmn:Task' } ],
        type: 'String',
        info: 'hello',
        variants: [
          { type: 'String' },
          { type: 'Number' }
        ]
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.getAllByRole('button', { name: /writes/ })).to.have.lengthOf(1);
      expect(screen.getByRole('button', { name: 'Writer A' })).to.exist;
    });

    it('should render multi-writer merged variable as "N elements" row', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer 1', $type: 'bpmn:Task' },
          { id: 'Task_2', name: 'Writer 2', $type: 'bpmn:Task' }
        ],
        type: 'String',
        info: 'merged'
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.getByText('2 elements')).to.exist;
      expect(screen.getAllByRole('button', { name: /writes/ })).to.have.lengthOf(1);
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

    it('should render readers inline when they fit', () => {

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
      expect(screen.getByText('Used by')).to.exist;
      expect(screen.getByRole('button', { name: 'Reader Task 1' })).to.exist;
      expect(screen.getByRole('button', { name: 'Reader Task 2' })).to.exist;
      expect(screen.queryByText(/and \d+ more/)).not.to.exist;
    });

    it('should overflow into "and N more"', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer Task', $type: 'bpmn:Task' }
        ],
        usedBy: [
          { id: 'Task_2', name: 'Reader Task 1', $type: 'bpmn:Task' },
          { id: 'Task_3', name: 'Reader Task 2', $type: 'bpmn:Task' },
          { id: 'Task_4', name: 'Reader Task 3', $type: 'bpmn:Task' },
          { id: 'Task_5', name: 'Reader Task 4', $type: 'bpmn:Task' }
        ]
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.getByRole('button', { name: 'Reader Task 1' })).to.exist;
      expect(screen.getByRole('button', { name: 'Reader Task 2' })).to.exist;
      expect(screen.queryByRole('button', { name: 'Reader Task 3' })).not.to.exist;
      expect(screen.getByRole('button', { name: 'and 2 more' })).to.exist;
    });

    it('should expand to the full reader list', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [
          { id: 'Task_1', name: 'Writer Task', $type: 'bpmn:Task' }
        ],
        usedBy: [
          { id: 'Task_2', name: 'Reader Task 1', $type: 'bpmn:Task' },
          { id: 'Task_3', name: 'Reader Task 2', $type: 'bpmn:Task' },
          { id: 'Task_4', name: 'Reader Task 3', $type: 'bpmn:Task' },
          { id: 'Task_5', name: 'Reader Task 4', $type: 'bpmn:Task' }
        ]
      };
      renderVariableRow(variable);

      // when
      fireEvent.click(screen.getByRole('button', { name: 'and 2 more' }));

      // then
      expect(screen.getByRole('button', { name: 'Reader Task 3' })).to.exist;
      expect(screen.getByRole('button', { name: 'Reader Task 4' })).to.exist;
      expect(screen.queryByRole('button', { name: /and \d+ more/ })).not.to.exist;
    });

    it('should navigate on reader click without toggling the list', () => {

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
      const select = vi.fn();
      renderVariableRow(variable, { select });

      // when
      fireEvent.click(screen.getByRole('button', { name: 'Reader Task 1' }));

      // then
      expect(select).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Used by' }).getAttribute('aria-expanded')).to.eql('false');
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

  describe('selection tags', () => {

    it('should tag variable written by the selection', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [ { id: 'Task_1', name: 'Writer Task', $type: 'bpmn:Task' } ]
      };

      // when
      renderVariableRow(variable, { isSelectedOrigin: true, selectionName: 'Writer Task' });

      // then
      expect(screen.getByText('written')).to.exist;
      expect(screen.queryByText('read')).not.to.exist;
    });

    it('should tag variable read by the selection', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [ { id: 'Task_1', name: 'Writer Task', $type: 'bpmn:Task' } ],
        usedBy: [ { id: 'Task_2', name: 'Reader Task', $type: 'bpmn:Task' } ]
      };

      // when
      renderVariableRow(variable, { isSelectedReader: true, selectionName: 'Reader Task' });

      // then
      expect(screen.getByText('read')).to.exist;
      expect(screen.queryByText('written')).not.to.exist;
    });

    it('should tag variable both read and written by the selection', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [ { id: 'Task_1', name: 'Task', $type: 'bpmn:Task' } ],
        usedBy: [ { id: 'Task_1', name: 'Task', $type: 'bpmn:Task' } ]
      };

      // when
      renderVariableRow(variable, { isSelectedOrigin: true, isSelectedReader: true });

      // then
      expect(screen.getByText('written')).to.exist;
      expect(screen.getByText('read')).to.exist;
    });

    it('should hide tags while filtering by selection', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [ { id: 'Task_1', name: 'Writer Task', $type: 'bpmn:Task' } ]
      };

      // when
      renderVariableRow(variable, { isSelectedOrigin: true, isSelectedReader: true, writtenOnly: true });

      // then
      expect(screen.queryByText('written')).not.to.exist;
      expect(screen.queryByText('read')).not.to.exist;
    });

    it('should not tag unrelated variable', () => {

      // given
      const variable = {
        name: 'myVar',
        origin: [ { id: 'Task_1', name: 'Writer Task', $type: 'bpmn:Task' } ]
      };

      // when
      renderVariableRow(variable);

      // then
      expect(screen.queryByText('written')).not.to.exist;
      expect(screen.queryByText('read')).not.to.exist;
    });

  });

  describe('hover highlighting', () => {

    it('should highlight all writers when hovering "N elements"', () => {

      // given
      const writers = [
        { id: 'Task_1', name: 'Writer 1', $type: 'bpmn:Task' },
        { id: 'Task_2', name: 'Writer 2', $type: 'bpmn:Task' }
      ];
      const variable = { name: 'myVar', origin: writers, type: 'String' };
      const addMarker = vi.fn();
      renderVariableRow(variable, { addMarker });

      // when
      fireEvent.mouseEnter(screen.getByText('2 elements'));

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
      const variable = { name: 'myVar', origin: writers, type: 'String' };
      const removeMarker = vi.fn();
      renderVariableRow(variable, { removeMarker });

      // when
      fireEvent.mouseLeave(screen.getByText('2 elements'));

      // then
      const unhighlightedElements = removeMarker.mock.calls.map(([ el ]) => el.id);
      expect(unhighlightedElements).toEqual([ 'Task_1', 'Task_2' ]);
    });

    it('should highlight all readers when hovering "Used by"', () => {

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
      fireEvent.mouseEnter(screen.getByRole('button', { name: 'Used by' }));

      // then
      const highlightedElements = addMarker.mock.calls.map(([ el ]) => el.id);
      expect(highlightedElements).toEqual([ 'Task_2', 'Task_3' ]);
    });

  });

});


// helpers /////////////////////////

function renderVariableRow(variable, {
  addMarker = vi.fn(),
  removeMarker = vi.fn(),
  select = vi.fn(),
  isSelectedOrigin = false,
  isSelectedReader = false,
  selectionName = null,
  writtenOnly = false
} = {}) {
  const knownIds = [
    ...(variable.origin || []),
    ...(variable.usedBy || []).filter(el => el && el.id)
  ].map(el => el.id);

  const mockInjector = {
    get: (service) => {
      const services = {
        selection: { get: () => [], select },
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

  const filter = {
    search: '',
    setSearch: () => {},
    writtenOnly,
    toggleWrittenOnly: () => {},
    selectedElementIds: []
  };

  return render(
    <InjectorContext.Provider value={ mockInjector }>
      <FilterContext.Provider value={ filter }>
        <VariableRow
          variable={ variable }
          isSelectedOrigin={ isSelectedOrigin }
          isSelectedReader={ isSelectedReader }
          selectionName={ selectionName }
          expanded={ true }
          onToggle={ () => {} }
        />
      </FilterContext.Provider>
    </InjectorContext.Provider>
  );
}

import { useState } from 'react';

import { expect, describe, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { FilterContext } from '../../Context/FilterContext';
import { InjectorContext } from '../../Context/InjectorContext';
import useElementFilter from '../useElementFilter';


describe('useElementFilter', () => {

  describe('given variables with origins', () => {

    it('should extract elements from variable origins', () => {

      // given
      const variables = [
        {
          name: 'foo',
          origin: [
            { id: 'Task_1', name: 'My Task' }
          ]
        }
      ];

      const elementRegistry = createElementRegistry({
        Task_1: { id: 'Task_1', businessObject: { name: 'My Task' } }
      });

      // when
      const { result } = createHook(variables, { elementRegistry });

      // then
      expect(result.current.elements).to.have.length(1);
      expect(result.current.elements[0]).to.include({ id: 'Task_1', name: 'My Task', variableCount: 1 });
    });


    it('should count multiple variables from the same origin', () => {

      // given
      const variables = [
        { name: 'foo', origin: [ { id: 'Task_1', name: 'Task A' } ] },
        { name: 'bar', origin: [ { id: 'Task_1', name: 'Task A' } ] }
      ];

      const elementRegistry = createElementRegistry({
        Task_1: { id: 'Task_1', businessObject: { name: 'Task A' } }
      });

      // when
      const { result } = createHook(variables, { elementRegistry });

      // then
      expect(result.current.elements).to.have.length(1);
      expect(result.current.elements[0].variableCount).to.eql(2);
    });


    it('should extract elements from multiple origins', () => {

      // given
      const variables = [
        {
          name: 'foo',
          origin: [
            { id: 'Task_1', name: 'Task A' },
            { id: 'Task_2', name: 'Task B' }
          ]
        }
      ];

      const elementRegistry = createElementRegistry({
        Task_1: { id: 'Task_1', businessObject: { name: 'Task A' } },
        Task_2: { id: 'Task_2', businessObject: { name: 'Task B' } }
      });

      // when
      const { result } = createHook(variables, { elementRegistry });

      // then
      expect(result.current.elements).to.have.length(2);
    });


    it('should sort elements by name', () => {

      // given
      const variables = [
        { name: 'foo', origin: [ { id: 'Task_2', name: 'Bravo' } ] },
        { name: 'bar', origin: [ { id: 'Task_1', name: 'Alpha' } ] }
      ];

      const elementRegistry = createElementRegistry({
        Task_1: { id: 'Task_1', businessObject: { name: 'Alpha' } },
        Task_2: { id: 'Task_2', businessObject: { name: 'Bravo' } }
      });

      // when
      const { result } = createHook(variables, { elementRegistry });

      // then
      expect(result.current.elements[0].name).to.eql('Alpha');
      expect(result.current.elements[1].name).to.eql('Bravo');
    });


    it('should use element id as fallback name', () => {

      // given
      const variables = [
        { name: 'foo', origin: [ { id: 'Task_1' } ] }
      ];

      const elementRegistry = createElementRegistry({
        Task_1: { id: 'Task_1', businessObject: {} }
      });

      // when
      const { result } = createHook(variables, { elementRegistry });

      // then
      expect(result.current.elements[0].name).to.eql('Task_1');
    });
  });


  describe('given variables without origins', () => {

    it('should return empty list', () => {

      // given
      const variables = [
        { name: 'foo' },
        { name: 'bar', origin: null },
        { name: 'baz', origin: [] }
      ];

      // when
      const { result } = createHook(variables);

      // then
      expect(result.current.elements).to.have.length(0);
    });
  });


  describe('given selected elements', () => {

    it('should include selected elements not present in variable origins', () => {

      // given
      const variables = [];

      const elementRegistry = createElementRegistry({
        Task_1: { id: 'Task_1', businessObject: { name: 'Extra Task' } }
      });

      const filter = { selectedElements: [ 'Task_1' ] };

      // when
      const { result } = createHook(variables, { filter, elementRegistry });

      // then
      expect(result.current.elements).to.have.length(1);
      expect(result.current.elements[0]).to.include({ id: 'Task_1', name: 'Extra Task', variableCount: 0 });
    });


    it('should not duplicate elements already in variable origins', () => {

      // given
      const variables = [
        { name: 'foo', origin: [ { id: 'Task_1', name: 'My Task' } ] }
      ];

      const elementRegistry = createElementRegistry({
        Task_1: { id: 'Task_1', businessObject: { name: 'My Task' } }
      });

      const filter = { selectedElements: [ 'Task_1' ] };

      // when
      const { result } = createHook(variables, { filter, elementRegistry });

      // then
      expect(result.current.elements).to.have.length(1);
    });


    it('should skip selected elements not found in element registry', () => {

      // given
      const variables = [];

      const elementRegistry = createElementRegistry({});

      const filter = { selectedElements: [ 'Unknown_1' ] };

      // when
      const { result } = createHook(variables, { filter, elementRegistry });

      // then
      expect(result.current.elements).to.have.length(0);
    });


    it('should return current selected elements from filter', () => {

      // given
      const filter = { selectedElements: [ 'Task_1' ] };

      // when
      const { result } = createHook([], { filter });

      // then
      expect(result.current.selectedElements).to.eql([ 'Task_1' ]);
    });
  });


  describe('given no selected elements', () => {

    it('should return empty array', () => {

      // when
      const { result } = createHook([]);

      // then
      expect(result.current.selectedElements).to.have.length(0);
    });


    it('should return "All elements" as label', () => {

      // when
      const { result } = createHook([]);

      // then
      expect(result.current.label).to.eql('All elements');
    });
  });


  describe('given one selected element', () => {

    it('should return element name as label', () => {

      // given
      const variables = [
        { name: 'foo', origin: [ { id: 'Task_1', name: 'My Task' } ] }
      ];

      const elementRegistry = createElementRegistry({
        Task_1: { id: 'Task_1', businessObject: { name: 'My Task' } }
      });

      const filter = { selectedElements: [ 'Task_1' ] };

      // when
      const { result } = createHook(variables, { filter, elementRegistry });

      // then
      expect(result.current.label).to.eql('My Task');
    });


    it('should return element id as fallback label', () => {

      // given
      const filter = { selectedElements: [ 'Unknown_1' ] };

      // when
      const { result } = createHook([], { filter });

      // then
      expect(result.current.label).to.eql('Unknown_1');
    });
  });


  describe('given multiple selected elements', () => {

    it('should return count as label', () => {

      // given
      const variables = [
        { name: 'foo', origin: [ { id: 'Task_1', name: 'A' }, { id: 'Task_2', name: 'B' } ] }
      ];

      const elementRegistry = createElementRegistry({
        Task_1: { id: 'Task_1', businessObject: { name: 'A' } },
        Task_2: { id: 'Task_2', businessObject: { name: 'B' } }
      });

      const filter = { selectedElements: [ 'Task_1', 'Task_2' ] };

      // when
      const { result } = createHook(variables, { filter, elementRegistry });

      // then
      expect(result.current.label).to.eql('2 elements');
    });
  });


  describe('given handleToggleElement is called', () => {

    it('should add element to selection', () => {

      // given
      const { result } = createHook([]);

      // when
      act(() => {
        result.current.handleToggleElement('Task_1');
      });

      // then
      expect(result.current.selectedElements).to.include('Task_1');
    });


    it('should remove element from selection', () => {

      // given
      const variables = [
        { name: 'foo', origin: [ { id: 'Task_1', name: 'A' } ] }
      ];

      const elementRegistry = createElementRegistry({
        Task_1: { id: 'Task_1', businessObject: { name: 'A' } }
      });

      const filter = { selectedElements: [ 'Task_1' ] };

      const { result } = createHook(variables, { filter, elementRegistry });

      // when
      act(() => {
        result.current.handleToggleElement('Task_1');
      });

      // then
      expect(result.current.selectedElements).to.not.include('Task_1');
    });


    it('should toggle multiple elements independently', () => {

      // given
      const { result } = createHook([]);

      // when
      act(() => {
        result.current.handleToggleElement('Task_1');
      });
      act(() => {
        result.current.handleToggleElement('Task_2');
      });

      // then
      expect(result.current.selectedElements).to.include('Task_1');
      expect(result.current.selectedElements).to.include('Task_2');
    });
  });


  describe('given handleClearAll is called', () => {

    it('should clear all selected elements', () => {

      // given
      const filter = { selectedElements: [ 'Task_1', 'Task_2' ] };

      const { result } = createHook([], { filter });

      // when
      act(() => {
        result.current.handleClearAll();
      });

      // then
      expect(result.current.selectedElements).to.have.length(0);
    });


    it('should reset label to "All elements"', () => {

      // given
      const filter = { selectedElements: [ 'Task_1', 'Task_2' ] };

      const { result } = createHook([], { filter });

      // when
      act(() => {
        result.current.handleClearAll();
      });

      // then
      expect(result.current.label).to.eql('All elements');
    });
  });
});


// helpers /////////////////////////

function createHook(variables, { filter: initialFilter, elementRegistry } = {}) {
  const defaultFilter = {
    search: '',
    filterType: 'all',
    selectedElements: [],
    writtenOnly: false,
    ...initialFilter
  };

  const registry = elementRegistry || createElementRegistry({});

  const injector = {
    get(name) {
      if (name === 'elementRegistry') return registry;
    }
  };

  function Wrapper({ children }) {
    const [ filter, setFilter ] = useState(defaultFilter);

    return (
      <InjectorContext.Provider value={ injector }>
        <FilterContext.Provider value={ [ filter, setFilter ] }>
          { children }
        </FilterContext.Provider>
      </InjectorContext.Provider>
    );
  }

  return renderHook(() => useElementFilter(variables), { wrapper: Wrapper });
}

function createElementRegistry(entries) {
  return {
    get(id) {
      return entries[id] || null;
    }
  };
}

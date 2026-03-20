import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { render, fireEvent, waitFor, act } from '@testing-library/react';
import CamundaCloudModeler from 'camunda-bpmn-js/dist/camunda-cloud-modeler.development.js';
import { bootstrapBpmnJS, inject } from 'bpmn-js/test/helper';

import diagramXML from '../../../hooks/__test__/diagram.xml?raw';
import { FilterProvider } from '../../../context/FilterContext';
import { InjectorContext } from '../../../context/InjectorContext';
import useFilter from '../../../hooks/useFilter';
import Search from '../Search';


describe('lib/components/Search', function() {

  beforeEach(bootstrapModeler(diagramXML));

  it('should render filter input', inject(function(injector) {

    // given
    const { container } = render(<Search />, { wrapper: createWrapper(injector) });

    // then
    const searchInput = container.querySelector('input');
    expect(searchInput).to.exist;

  }));


  it('should set filter term', inject(async (injector) => {

    // given
    const filterRef = { current: null };

    const { container } = render(
      <SearchWithFilter filterRef={ filterRef } />,
      { wrapper: createWrapper(injector) }
    );

    // when
    const searchInput = container.querySelector('input');

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'MySearch' } });
    });

    // then
    await waitFor(() => {
      expect(filterRef.current.search).to.eql('MySearch');
    });
  }));

});


describe('lib/components/Search - tracking', function() {

  const mockTracking = { track: vi.fn() };

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [ {
      bpmnJSTracking: [ 'value', mockTracking ]
    } ]
  }));

  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    vi.useRealTimers();
    mockTracking.track.mockClear();
  });


  it('should track search after debounce delay', inject(function(injector) {

    // given
    const { container } = render(<Search />, { wrapper: createWrapper(injector) });
    const searchInput = container.querySelector('input');

    // when
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'foo' } });
    });

    // then
    expect(mockTracking.track).not.toHaveBeenCalled();

    // when
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // then
    expect(mockTracking.track).toHaveBeenCalledOnce();
    expect(mockTracking.track).toHaveBeenCalledWith({
      name: 'variableOutline:searched',
      data: undefined
    });
  }));


  it('should collapse rapid keystrokes into single event', inject(function(injector) {

    // given
    const { container } = render(<Search />, { wrapper: createWrapper(injector) });
    const searchInput = container.querySelector('input');

    // when
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'f' } });
      fireEvent.change(searchInput, { target: { value: 'fo' } });
      fireEvent.change(searchInput, { target: { value: 'foo' } });
      vi.advanceTimersByTime(300);
    });

    // then
    expect(mockTracking.track).toHaveBeenCalledOnce();
    expect(mockTracking.track).toHaveBeenCalledWith({
      name: 'variableOutline:searched',
      data: undefined
    });
  }));


  it('should NOT track when search is cleared', inject(function(injector) {

    // given
    const { container } = render(<Search />, { wrapper: createWrapper(injector) });
    const searchInput = container.querySelector('input');

    act(() => {
      fireEvent.change(searchInput, { target: { value: 'foo' } });
      vi.advanceTimersByTime(300);
    });

    mockTracking.track.mockClear();

    // when
    act(() => {
      fireEvent.change(searchInput, { target: { value: '' } });
      vi.advanceTimersByTime(300);
    });

    // then
    expect(mockTracking.track).not.toHaveBeenCalled();
  }));


  it('should NOT include search term in tracking data', inject(function(injector) {

    // given
    const { container } = render(<Search />, { wrapper: createWrapper(injector) });
    const searchInput = container.querySelector('input');

    // when
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'sensitive-query' } });
      vi.advanceTimersByTime(300);
    });

    // then
    expect(mockTracking.track).toHaveBeenCalledWith({
      name: 'variableOutline:searched',
      data: undefined
    });
  }));


  it('should not crash when tracking service is absent', function() {

    // given
    const injector = createMockInjector(null);

    const { container } = render(<Search />, {
      wrapper: createWrapper(injector)
    });

    const searchInput = container.querySelector('input');

    // when / then
    expect(() => {
      act(() => {
        fireEvent.change(searchInput, { target: { value: 'test' } });
        vi.advanceTimersByTime(300);
      });
    }).not.toThrow();
  });

});


// helpers /////////////////////////

function SearchWithFilter({ filterRef }) {
  const filter = useFilter();
  filterRef.current = filter;

  return <Search />;
}

function bootstrapModeler(diagram, options) {
  return bootstrapBpmnJS(CamundaCloudModeler, diagram, options);
}

function createMockInjector(trackingService) {
  const mockEventBus = { on() {}, off() {} };

  return {
    get: (name, strict) => {
      if (name === 'bpmnJSTracking') {
        return trackingService;
      }

      if (name === 'eventBus') {
        return mockEventBus;
      }

      if (strict !== false) {
        throw new Error(`No provider for "${ name }"!`);
      }

      return null;
    }
  };
}

function createWrapper(injector) {
  return function TestWrapper({ children }) {
    return (
      <InjectorContext.Provider value={ injector }>
        <FilterProvider>
          { children }
        </FilterProvider>
      </InjectorContext.Provider>
    );
  };
}

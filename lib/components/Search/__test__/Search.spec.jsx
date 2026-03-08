import { beforeEach, describe, expect, it } from 'vitest';

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

  it('should render search input', inject(function(injector) {

    // given
    const { container } = render(<Search />, { wrapper: createWrapper(injector) });

    // then
    const searchInput = container.querySelector('input');
    expect(searchInput).to.exist;

  }));


  it('should set search term', inject(async (injector) => {

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


// helpers /////////////////////////

function SearchWithFilter({ filterRef }) {
  const filter = useFilter();
  filterRef.current = filter;

  return <Search />;
}

function bootstrapModeler(diagram, options) {
  return bootstrapBpmnJS(CamundaCloudModeler, diagram, options);
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

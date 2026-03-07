import { expect, it, vi } from 'vitest';

import { render, fireEvent } from '@testing-library/react';
import { act, useState } from 'react';
import { FilterContext } from '../../../context/FilterContext';
import Search from '../Search';


const DEFAULT_FILTER = {
  search: '',
  selectedElements: [],
  writtenOnly: false
};

let setSpy = vi.fn();
let setFilter;

describe('lib/components/Search', function() {

  it('should render search input', function() {

    // given
    const { container } = render(<Search />, { wrapper: createWrapper() });

    // then
    const searchInput = container.querySelector('input');
    expect(searchInput).to.exist;

  });


  it('should set search term', async () => {

    // given
    const { container } = render(<Search />, { wrapper: createWrapper() });

    // when
    const searchInput = container.querySelector('input');

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'MySearch' } });
    });

    // then
    expect(setSpy).lastCalledWith({
      search: 'MySearch',
      selectedElements: [],
      writtenOnly: false
    });
  });

  it('should react to external changes', async () => {

    // given
    const { container } = render(<Search />, { wrapper: createWrapper() });

    // when
    await act(async () => {
      setFilter({
        search: 'MySearch',
        selectedElements: [],
      });
    });

    // then
    expect(container.querySelector('input').value).to.eql('MySearch');
  });

});


// helpers /////////////////////////

function createWrapper() {

  return function TestWrapper({ children }) {
    const [ filter, _setFilter ] = useState(DEFAULT_FILTER);

    setFilter = _setFilter;

    return <FilterContext.Provider value={ [ filter, e => {
      setSpy(e);
      setFilter(e);
    } ] }>{children}</FilterContext.Provider>;
  };

}

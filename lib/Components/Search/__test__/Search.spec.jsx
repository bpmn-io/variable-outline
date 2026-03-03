import { expect, it, vi } from 'vitest';

import { render, fireEvent } from '@testing-library/react';
import { act, useState } from 'react';
import { FilterContext } from '../../../Context/FilterContext';
import Search from '../Search';


const DEFAULT_FILTER = {
  search: '',
  filterType: 'all',
  selectedElements: [],
  writtenOnly: false
};

let setSpy = vi.fn();
let setFilter;

it('should render search input', function() {

  // given
  const { container } = render(<Search />, { wrapper });

  // then
  const searchInput = container.querySelector('input');
  expect(searchInput).to.exist;

});


it('should set search term', async () => {

  // given
  const { container } = render(<Search />, { wrapper });

  // when
  const searchInput = container.querySelector('input');

  await act(async () => {
    fireEvent.change(searchInput, { target: { value: 'MySearch' } });
  });

  // then
  expect(setSpy).lastCalledWith({
    search: 'MySearch',
    filterType: 'all',
    selectedElements: [],
    writtenOnly: false
  });
});

it('should react to external changes', async () => {

  // given
  const { container } = render(<Search />, { wrapper });

  // when
  await act(async () => {
    setFilter({
      search: 'MySearch',
      filterType: 'all',
      selectedElements: [],
    });
  });

  // then
  expect(container.querySelector('input').value).to.eql('MySearch');
});


// helpers /////////////////////////

function wrapper({ children }) {
  const [ filter, _setFilter ] = useState(DEFAULT_FILTER);

  setFilter = _setFilter;

  return <FilterContext.Provider value={ [ filter, e => {
    setSpy(e);
    setFilter(e);
  } ] }>{children}</FilterContext.Provider>;
}

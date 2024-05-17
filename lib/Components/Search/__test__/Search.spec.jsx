import { expect, it, vi } from 'vitest';
import { userEvent } from '@vitest/browser/context';

import { render } from '@testing-library/react';
import { act, useState } from 'react';
import { FilterContext } from '../../../Context/FilterContext';
import Search from '../Search';


const DEFAULT_FILTER = {
  search: '',
  filterType: 'all'
};

let setSpy = vi.fn();
let setFilter;

const wrapper = ({ children }) => {
  const [ filter, _setFilter ] = useState(DEFAULT_FILTER);

  setFilter = _setFilter;

  return <FilterContext.Provider value={ [ filter, e => {
    setSpy(e);
    setFilter(e);
  } ] }>{children}</FilterContext.Provider>;
};


it('should render search and checkbox', function() {

  // given
  const { container } = render(<Search />, { wrapper });

  // then
  expect(container.querySelector('input[type="inline"]')).to.exist;
  expect(container.querySelector('input[type="checkbox"]')).to.exist;
});


it('should set search term', async () => {

  // given
  const { container } = render(<Search />, { wrapper });

  // when
  const searchInput = container.querySelector('input[type="inline"]');

  await act(async () => {
    await userEvent.fill(searchInput, 'MySearch');
  });

  // then
  expect(setSpy).lastCalledWith({
    search: 'MySearch',
    filterType: 'all'
  });
});


it('should set filter type', async () => {

  // given
  const { container } = render(<Search />, { wrapper });

  // when
  const writtenOnly = container.querySelector('input[type="checkbox"]');

  await act(async () => {
    await userEvent.click(writtenOnly);
  });

  // then
  expect(setSpy).lastCalledWith({
    search: '',
    filterType: 'origin'
  });

});


it('should react to external changes', async () => {

  // given
  const { container } = render(<Search />, { wrapper });

  // when
  await act(async () => {
    setFilter({
      search: 'MySearch',
      filterType: 'origin'
    });
  });

  // then
  expect(container.querySelector('input[type="inline"]').value).to.eql('MySearch');
  expect(container.querySelector('input[type="checkbox"]').checked).to.be.true;
});

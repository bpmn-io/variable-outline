import { expect, it, vi } from 'vitest';

import Variable from '../Variable';
import { FilterContext } from '../../../Context/FilterContext';
import { render } from '@testing-library/react';
import { act } from 'react';

let setSpy = vi.fn();

const wrapper = ({ children }) => <FilterContext.Provider value={ [ {}, setSpy ] }>{children}</FilterContext.Provider>;


it('should set filter', async () => {

  // given
  const { container } = render(<Variable variable={ { name: 'MyVariable' } } />, { wrapper });
  const button = container.querySelector('button');

  // assume
  expect(button.innerText).to.eql('MyVariable');

  // when
  await act(async () => {
    button.click();
  });

  // then
  expect(setSpy).lastCalledWith({
    search: 'MyVariable'
  });

});
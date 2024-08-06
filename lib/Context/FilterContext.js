import { createContext } from 'react';

export const FilterContext = createContext([
  {
    search: '',
    filterType: 'all'
  },
  () => {}
]);
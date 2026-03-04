import { createContext } from 'react';

export const FilterContext = createContext([
  {
    search: '',
    selectedElements: [],
    writtenOnly: false
  },
  () => {}
]);
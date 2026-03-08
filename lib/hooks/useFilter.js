import { useContext } from 'react';
import { FilterContext } from '../context/FilterContext';

export default function useFilter() {
  return useContext(FilterContext);
}

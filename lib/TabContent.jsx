
import Variables from './Components/VariableList';

import './style.scss';
import EmptySearch from './Components/EmptySearch';

import { useVariables } from './hooks/useVariables';
import Search from './Components/Search';
import FilterBar from './Components/FilterBar';
import useCanvasSync from './hooks/useCanvasSync';

export default function(props) {

  const { rawVariables, availableVariables } = useVariables();
  useCanvasSync();

  return <div className="bio-vo-tab-content">
    <Search />
    <FilterBar variables={ rawVariables } />
    {availableVariables.length > 0 ?
      <Variables { ...props } variables={ availableVariables } /> :
      <EmptySearch rawVariables={ rawVariables } />
    }
  </div>;
}

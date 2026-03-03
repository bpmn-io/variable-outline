
import Variables from './Components/VariableList';
import FilterBar from './Components/FilterBar/FilterBar';

import './style.scss';
import EmptySearch from './Components/EmptySearch';

import { useVariables } from './hooks/useVariables';
import Search from './Components/Search';

export default function(props) {

  const { rawVariables, availableVariables } = useVariables();

  return <div className="bio-vo-tab-content">
    <Search />
    <FilterBar variables={ rawVariables } />
    {availableVariables.length > 0 ?
      <Variables { ...props } variables={ availableVariables } /> :
      <EmptySearch rawVariables={ rawVariables } />
    }
  </div>;
}

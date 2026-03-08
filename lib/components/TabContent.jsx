
import ScopeList from './ScopeList';
import FilterBar from './FilterBar';

import '../style.scss';
import EmptyState from './EmptyState';

import { useVariables } from '../hooks/useVariables';
import Search from './Search';

export default function TabContent(props) {
  const { rawVariables, availableVariables } = useVariables();

  return <div className="bio-vo-tab-content">
    <Search />
    <FilterBar />
    {availableVariables.length > 0 ?
      <ScopeList { ...props } variables={ availableVariables } /> :
      <EmptyState rawVariables={ rawVariables } />
    }
  </div>;
}

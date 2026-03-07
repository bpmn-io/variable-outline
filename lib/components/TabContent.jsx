
import ScopeList from './ScopeList';
import FilterBar from './FilterBar';

import '../style.scss';
import EmptyState from './EmptyState';

import { useVariables } from '../hooks/useVariables';
import Search from './Search';
import useCanvasSync from '../hooks/useCanvasSync';

export default function TabContent(props) {
  const { rawVariables, availableVariables } = useVariables();
  useCanvasSync();

  return <div className="bio-vo-tab-content">
    <Search />
    <FilterBar />
    {availableVariables.length > 0 ?
      <ScopeList { ...props } variables={ availableVariables } /> :
      <EmptyState rawVariables={ rawVariables } />
    }
  </div>;
}

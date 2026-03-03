import ElementFilter from './ElementFilter';
import WrittenOnlyToggle from './WrittenOnlyToggle';
import CollapseAllButton from './CollapseAllButton';

import './FilterBar.scss';

export default function FilterBar({ variables }) {
  return (
    <div className="bio-vo-filter-bar">
      <ElementFilter variables={ variables } />
      <div className="bio-vo-filter-bar-actions">
        <WrittenOnlyToggle />
        <CollapseAllButton />
      </div>
    </div>
  );
}

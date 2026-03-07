import WrittenOnlyToggle from './WrittenOnlyToggle';
import CollapseAllButton from './CollapseAllButton';

import './FilterBar.scss';

export default function FilterBar() {
  return (
    <div className="bio-vo-filter-bar">
      <div className="bio-vo-filter-bar-actions">
        <WrittenOnlyToggle />
      </div>
      <CollapseAllButton />
    </div>
  );
}

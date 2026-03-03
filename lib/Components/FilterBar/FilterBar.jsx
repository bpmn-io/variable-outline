import WrittenOnlyToggle from './WrittenOnlyToggle';

import './FilterBar.scss';

export default function FilterBar({ variables }) {
  return (
    <div className="bio-vo-filter-bar">
      <div className="bio-vo-filter-bar-actions">
        <WrittenOnlyToggle />
      </div>
    </div>
  );
}

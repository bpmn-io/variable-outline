
import ElementFilter from './ElementFilter';
import WrittenOnlyToggle from './WrittenOnlyToggle';

import './FilterBar.scss';

export default function FilterBar({ variables }) {
  return (
    <div className="bio-vo-filter-bar">
      <ElementFilter variables={ variables } />
      <WrittenOnlyToggle />
    </div>
  );
}

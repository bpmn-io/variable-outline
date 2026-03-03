import ElementFilter from './ElementFilter';

import './FilterBar.scss';

export default function FilterBar({ variables }) {
  return (
    <div className="bio-vo-filter-bar">
      <ElementFilter variables={ variables } />
      <div className="bio-vo-filter-bar-actions">
      </div>
    </div>
  );
}

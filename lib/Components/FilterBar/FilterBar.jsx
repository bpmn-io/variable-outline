// eslint-disable-next-line no-unused-vars
import React from 'react';

import ElementFilter from './ElementFilter';
import TypeFilter from './TypeFilter';
import WrittenOnlyToggle from './WrittenOnlyToggle';

import './FilterBar.scss';

export default function FilterBar({ variables }) {
  return (
    <div className="bio-vo-filter-bar">
      <ElementFilter variables={ variables } />
      <TypeFilter variables={ variables } />
      <WrittenOnlyToggle />
    </div>
  );
}

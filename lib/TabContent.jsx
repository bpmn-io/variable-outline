// eslint-disable-next-line no-unused-vars
import React from 'react';

import Variables from './Components/VariableTable';

import './style.scss';
import EmptySearch from './Components/EmptySearch';

import ElementList from './Components/ElementList';
import { useVariables } from './hooks/useVariables';
import Search from './Components/Search';

export default function(props) {

  const { rawVariables, filteredVariables, availableVariables } = useVariables();

  return <div className="bio-vo-tab-content">
    <Search />
    <div className="bio-vo-tab-row">
      <div className="bio-vo-tab-coloumn element-list">
        <ElementList
          availableVariables={ filteredVariables }
        />
      </div>
      <div className="bio-vo-tab-coloumn">
        {availableVariables.length > 0 ?
          <Variables { ...props } variables={ availableVariables } /> :
          <EmptySearch rawVariables={ rawVariables } />
        }
      </div>
    </div>
  </div>;
}

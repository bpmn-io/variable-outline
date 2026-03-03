// eslint-disable-next-line no-unused-vars
import React from 'react';

import './style.scss';
import EmptySearch from './Components/EmptySearch';

import VariableList from './Components/VariableList';
import { useVariables } from './hooks/useVariables';
import Search from './Components/Search';

export default function(props) {

  const { rawVariables, availableVariables } = useVariables();

  return <div className="bio-vo-tab-content">
    <Search />
    {availableVariables.length > 0 ?
      <VariableList { ...props } variables={ availableVariables } /> :
      <EmptySearch rawVariables={ rawVariables } />
    }
  </div>;
}

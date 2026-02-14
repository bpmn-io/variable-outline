import { useState } from 'react';

import TabContent from './TabContent';
import { InjectorContext } from './Context/InjectorContext';
import { FilterContext } from './Context/FilterContext';

/**
 *
 * @param {Object} props
 * @param {*} props.injector
 * @returns {import('react').ReactElement}
 */
export default function(props) {

  const {
    injector
  } = props;

  const search = useState({
    search: '',
    filterType: 'all',
    selectedElements: [],
    writtenOnly: false
  });

  return (
    <InjectorContext.Provider value={ injector }>
      <FilterContext.Provider value={ search }>
        <TabContent />
      </FilterContext.Provider>
    </InjectorContext.Provider>
  );
}
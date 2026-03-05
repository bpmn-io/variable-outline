import { useState } from 'react';

import TabContent from './TabContent';
import { InjectorContext } from './Context/InjectorContext';
import { FilterContext } from './Context/FilterContext';
import { ScopeExpandProvider } from './Context/ScopeExpandContext';

/**
 *
 * @param {Object} props
 * @param {*} props.injector
 * @returns {import('react').ReactElement}
 */
export default function VariableOutline(props) {

  const {
    injector
  } = props;

  const search = useState({
    search: '',
    selectedElements: [],
    writtenOnly: false
  });

  return (
    <InjectorContext.Provider value={ injector }>
      <FilterContext.Provider value={ search }>
        <ScopeExpandProvider>
          <TabContent />
        </ScopeExpandProvider>
      </FilterContext.Provider>
    </InjectorContext.Provider>
  );
}
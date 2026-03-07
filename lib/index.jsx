import { useState } from 'react';

import TabContent from './components/TabContent';
import { InjectorContext } from './context/InjectorContext';
import { FilterContext } from './context/FilterContext';
import { ScopeExpandProvider } from './context/ScopeExpandContext';

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
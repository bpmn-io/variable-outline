import TabContent from './components/TabContent';
import { InjectorContext } from './context/InjectorContext';
import { FilterProvider } from './context/FilterContext';
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

  return (
    <InjectorContext.Provider value={ injector }>
      <FilterProvider>
        <ScopeExpandProvider>
          <TabContent />
        </ScopeExpandProvider>
      </FilterProvider>
    </InjectorContext.Provider>
  );
}

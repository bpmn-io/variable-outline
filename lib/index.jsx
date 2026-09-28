import { C4Provider, TooltipProvider } from '@camunda/design-system';

import TabContent from './components/TabContent';
import { InjectorContext } from './context/InjectorContext';
import { FilterProvider } from './context/FilterContext';
import { ScopeExpandProvider } from './context/ScopeExpandContext';

/**
 *
 * @param {Object} props
 * @param {*} props.injector
 * @param {string} [props.learnMoreUrl]
 * @returns {import('react').ReactElement}
 */
export default function VariableOutline(props) {

  const {
    injector,
    learnMoreUrl
  } = props;

  return (
    <C4Provider>
      <TooltipProvider>
        <InjectorContext.Provider value={ injector }>
          <FilterProvider>
            <ScopeExpandProvider>
              <TabContent learnMoreUrl={ learnMoreUrl } />
            </ScopeExpandProvider>
          </FilterProvider>
        </InjectorContext.Provider>
      </TooltipProvider>
    </C4Provider>
  );
}

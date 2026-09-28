import { EmptyState as DSEmptyState, Link } from '@camunda/design-system';
import { Braces, SearchX } from '@camunda/design-system/icons';

import './EmptyState.scss';

export default function EmptyState({ rawVariables, learnMoreUrl }) {

  const TITLE = rawVariables.length ? 'No matching variables' : 'No process variables';
  const DESCRIPTION = rawVariables.length ? 'Check your query or select a different element.' : 'Add variables to your process through mappings, forms or example data.';
  const Icon = rawVariables.length ? SearchX : Braces;

  return (
    <DSEmptyState
      className="bio-vo-empty-state"
      size="sm"
      heading={ TITLE }
      headingLevel={ 3 }
      description={ DESCRIPTION }
      icon={ <Icon aria-hidden="true" /> }
      action={ learnMoreUrl && (
        <Link
          href={ learnMoreUrl }
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </Link>
      ) }
    />
  );
}

import { Link } from '@carbon/react';
import { ValueVariableAlt } from '@carbon/icons-react';

import './EmptyState.scss';

export default function EmptyState({ rawVariables, learnMoreUrl }) {

  const TITLE = rawVariables.length ? 'No matching variables' : 'No process variables';
  const DESCRIPTION = rawVariables.length ? 'Check your query or select a different element.' : 'Add variables to your process through mappings, forms or example data.';

  return (
    <div className="bio-vo-empty-state">
      <div className="bio-vo-empty-state__icon-container" aria-hidden="true">
        <ValueVariableAlt size={ 24 } />
      </div>
      <h3 className="bio-vo-empty-state__title">{TITLE}</h3>
      <p className="bio-vo-empty-state__description">
        {DESCRIPTION}
      </p>
      {learnMoreUrl && (
        <Link
          href={ learnMoreUrl }
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </Link>
      )}
    </div>
  );
}

import { Link } from '@carbon/react';

import './EmptyState.scss';
import EmptyStateIcon from '../BpmnIcon/svg/bpmn-empty-state.svg?react';

export default function EmptyState({ rawVariables, learnMoreUrl }) {

  const TITLE = rawVariables.length ? 'No matching variables' : 'No process variables';
  const DESCRIPTION = rawVariables.length ? 'Check your query or select a different element.' : 'Add variables to your process through mappings, forms or example data.';

  return (
    <div className="bio-vo-empty-state">
      <EmptyStateIcon className="bio-vo-empty-state__icon" aria-hidden="true" focusable="false" />
      <h3 className="bio-vo-empty-state__title">{TITLE}</h3>
      <p className="bio-vo-empty-state__description">
        {DESCRIPTION}
      </p>
      {learnMoreUrl && (
        <Link
          href={ learnMoreUrl }
          target="_blank"
          rel="noopener noreferrer"
          className="bio-vo-empty-state__link"
        >
          Learn more
        </Link>
      )}
    </div>
  );
}

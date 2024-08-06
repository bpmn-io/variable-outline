// eslint-disable-next-line no-unused-vars
import React from 'react';

import './EmptySearch.scss';

export default function({ rawVariables }) {

  const TITLE = rawVariables.length ? 'No matching Variables' : 'No Process Variables';
  const DESCRIPTION = rawVariables.length ? 'Check your query or select a different scope.' : 'Add Variables to your process through mappings, forms or example data.';

  return (
    <div className="bio-vo-empty-search" style={ {
      margin: '30px'
    } }>
      <h3>{TITLE}</h3>
      <p>
        {DESCRIPTION}
      </p>
    </div>
  );
}
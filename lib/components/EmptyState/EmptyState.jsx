import './EmptyState.scss';

export default function EmptyState({ rawVariables }) {

  const TITLE = rawVariables.length ? 'No matching Variables' : 'No Process Variables';
  const DESCRIPTION = rawVariables.length ? 'Check your query or select a different scope.' : 'Add Variables to your process through mappings, forms or example data.';

  return (
    <div className="bio-vo-empty-search">
      <h3>{TITLE}</h3>
      <p>
        {DESCRIPTION}
      </p>
    </div>
  );
}

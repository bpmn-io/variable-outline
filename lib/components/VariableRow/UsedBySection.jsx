import { Fragment, useState } from 'react';
import { ChevronRight } from '@carbon/icons-react';

import ElementEntry from './ElementEntry';
import useElementHighlight from '../../hooks/useElementHighlight';

const INLINE_READERS = 2;

export default function UsedBySection({ readers }) {
  const [ open, setOpen ] = useState(false);

  const { highlight, clearHighlight } = useElementHighlight(readers);

  const inlineReaders = readers.slice(0, INLINE_READERS);
  const moreCount = readers.length - inlineReaders.length;

  const toggle = () => setOpen(open => !open);

  const handleLineClick = event => {

    // element links and the toggles handle their own clicks
    if (event.target.closest('button')) {
      return;
    }

    toggle();
  };

  return (
    <div className="variable-used-by">
      <div className="variable-used-by-line" onClick={ handleLineClick }>
        <ChevronRight
          aria-hidden="true"
          className={ `variable-variant-chevron${open ? ' variable-variant-chevron--expanded' : ''}` }
        />
        <button
          className="variable-used-by-toggle"
          type="button"
          onClick={ toggle }
          aria-expanded={ open }
          onMouseEnter={ highlight }
          onMouseLeave={ clearHighlight }
        >
          Used by
        </button>
        { !open && (
          <span className="variable-used-by-inline">
            { inlineReaders.map((reader, index) => (
              <Fragment key={ reader.id }>
                <ElementEntry element={ reader } inline />
                { index < inlineReaders.length - 1 && ', ' }
              </Fragment>
            )) }
          </span>
        ) }
        { !open && moreCount > 0 && (
          <button
            className="variable-more-link"
            type="button"
            onClick={ toggle }
          >
            { `and ${moreCount} more` }
          </button>
        ) }
      </div>
      { open && (
        <div className="variable-used-by-list">
          { readers.map(reader => (
            <ElementEntry key={ reader.id } element={ reader } />
          )) }
        </div>
      ) }
    </div>
  );
}

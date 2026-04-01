import { Copy, Checkmark } from '@carbon/icons-react';
import { IconButton } from '@carbon/react';
import useClipboardCopy from '../hooks/useClipboardCopy';
import useTracking from '../hooks/useTracking';

export default function CopyButton({ text }) {
  const { copied, copy } = useClipboardCopy(text);
  const track = useTracking();

  const handleClick = (event) => {
    copy(event);
    track('variableNameCopy');
  };

  return (
    <IconButton
      kind="ghost"
      size="sm"
      label="Copy variable name"
      aria-label="Copy variable name"
      align="left"
      className={ `variable-copy-button${ copied ? ' variable-copy-button--copied' : '' }` }
      onClick={ handleClick }
    >
      <span aria-live="polite" className="visually-hidden">
        { copied ? 'Copied to clipboard!' : '' }
      </span>

      { copied
        ? <Checkmark className="variable-copy-icon" />
        : <Copy className="variable-copy-icon" />
      }
    </IconButton>
  );
}

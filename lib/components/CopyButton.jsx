import { IconButton } from '@camunda/design-system';
import { Check, Copy } from '@camunda/design-system/icons';

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
    <span className={ `variable-copy-button${ copied ? ' variable-copy-button--copied' : '' }` }>
      <span aria-live="polite" className="sr-only">
        { copied ? 'Copied to clipboard!' : '' }
      </span>

      <IconButton
        variant="ghost"
        size="sm"
        label="Copy variable name"
        tooltipSide="left"
        icon={ copied ? Check : Copy }
        onClick={ handleClick }
      />
    </span>
  );
}

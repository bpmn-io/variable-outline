import { Toggle, Tooltip } from '@carbon/react';
import useFilter from '../../hooks/useFilter';

export default function WrittenOnlyToggle() {
  const { writtenOnly, toggleWrittenOnly } = useFilter();

  const handleToggle = () => {
    toggleWrittenOnly();
  };

  return (
    <Tooltip
      label="Only show variables written by the currently selected element."
      align="bottom"
      autoAlign
    >
      <div className="bio-vo-written-only-toggle">
        <Toggle
          id="written-only-toggle"
          size="sm"
          labelText="Written by selection"
          hideLabel
          toggled={ writtenOnly }
          onToggle={ handleToggle }
          aria-label="Written by current selection"
        />
      </div>
    </Tooltip>
  );

}

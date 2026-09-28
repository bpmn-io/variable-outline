import { Switch, Text } from '@camunda/design-system';

import Tooltip from '../Tooltip';
import useFilter from '../../hooks/useFilter';

export default function WrittenOnlyToggle() {
  const { writtenOnly, toggleWrittenOnly } = useFilter();

  return (
    <div className="bio-vo-written-only-toggle">
      <Switch
        id="written-only-toggle"
        size="sm"
        checked={ writtenOnly }
        onCheckedChange={ toggleWrittenOnly }
      />
      <Tooltip label="Only show variables written by the currently selected element.">
        <Text
          as="label"
          variant="label-md"
          htmlFor="written-only-toggle"
          className="bio-vo-has-tooltip"
        >
          Written by selection
        </Text>
      </Tooltip>
    </div>
  );

}

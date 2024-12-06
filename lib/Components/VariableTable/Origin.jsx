import { Tag } from '@carbon/react';
import Element from './Element';

import './Origin.scss';

export default function Origin(props) {
  const { origins } = props;

  const firstTwoOrigins = origins.slice(0, 2);
  const additionalOrigins = origins.length - 2;

  return <div className="bio-vo-origin">
    {
      firstTwoOrigins
        .map((origin, index) => <>
          { index ? ' | ' : null } <Element key={ origin.id } element={ origin } />
        </>)
    }
    {additionalOrigins > 0 && <Tag type="gray">{`+${additionalOrigins}`}</Tag>}
  </div>;

}
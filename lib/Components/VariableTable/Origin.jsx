import { Tag } from '@carbon/react';
import Element from './Element';

import './Origin.scss';

export default function Origin(props) {
  const { origins } = props;

  const [ firstOrigin, secondOrigin ] = origins.slice(0, 2);
  const additionalOrigins = origins.length - 2;

  return <div className="bio-vo-origin">
    {
      <Element element={ firstOrigin } />
    }
    {
      secondOrigin ? <>
        { ' | ' }
        <Element element={ secondOrigin } />
      </> : null
    }
    {additionalOrigins > 0 && <Tag type="gray">{`+${additionalOrigins}`}</Tag>}
  </div>;

}
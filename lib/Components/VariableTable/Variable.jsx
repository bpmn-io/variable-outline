import { useContext } from 'react';
import { FilterContext } from '../../Context/FilterContext';


const Variable = (props) => {

  const [ filter, setFilter ] = useContext(FilterContext);

  const {
    variable
  } = props;

  const handleClick = () => {
    setFilter({
      ...filter,
      search: variable.name
    });
  };

  return <button
    onClick={ handleClick }
    className="bio-vo-text-button"
  >
    {variable.name}
  </button>;
};

export default Variable;
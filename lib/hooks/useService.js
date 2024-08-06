import { useContext } from 'react';
import { InjectorContext } from '../Context/InjectorContex';


export default function useService(service, optional) {

  const injector = useContext(InjectorContext);

  return injector.get(service, optional);
}
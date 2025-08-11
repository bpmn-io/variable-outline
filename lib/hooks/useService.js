import { useContext } from 'react';
import { InjectorContext } from '../Context/InjectorContext';


export default function useService(service, optional) {

  const injector = useContext(InjectorContext);

  return injector.get(service, optional);
}
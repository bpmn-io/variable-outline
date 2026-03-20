import { useContext } from 'react';
import { InjectorContext } from '../context/InjectorContext';


export default function useService(service, strict = true) {

  const injector = useContext(InjectorContext);

  return injector.get(service, strict);
}
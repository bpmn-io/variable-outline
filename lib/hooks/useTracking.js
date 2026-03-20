import { useCallback } from 'react';
import useService from './useService';

const NAMESPACE = 'variableOutline';


export default function useTracking() {
  const bpmnJSTracking = useService('bpmnJSTracking', false);

  return useCallback((name, data) => {
    if (bpmnJSTracking) {
      bpmnJSTracking.track({ name: `${NAMESPACE}:${name}`, data });
    }
  }, [ bpmnJSTracking ]);
}

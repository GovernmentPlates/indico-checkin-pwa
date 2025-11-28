import {useContext} from 'react';
import {DebugWindowContext} from '../context/DebugWindowProvider';

/**
 * Hook to access the debug window context
 * @returns {Object} The debug window controls
 */
export const useDebugWindow = () => {
  return useContext(DebugWindowContext);
};

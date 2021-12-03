import { useContext } from 'react';
import SocketIoContext from './SocketIoContext';

const useSocketIo = () => {
  const context = useContext(SocketIoContext);

  if (context === undefined) {
    throw new Error('useSocketIo must be within SocketIoProvider');
  }
  return context.socket;
};

export default useSocketIo;

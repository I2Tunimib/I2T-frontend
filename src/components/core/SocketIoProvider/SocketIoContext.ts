import { createContext } from 'react';
import { Socket } from 'socket.io-client';

export type SocketIoContextProps = {
  socket: Socket
}

const SocketIoContext = createContext<SocketIoContextProps | undefined>(undefined);

export default SocketIoContext;

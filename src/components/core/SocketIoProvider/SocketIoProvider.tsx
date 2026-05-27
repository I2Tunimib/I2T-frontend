import { FC, useEffect, useState, useContext } from "react";
import io, { Socket } from "socket.io-client";
import SocketIoContext from "./SocketIoContext";

const SocketIoProvider: FC<{}> = ({ children }) => {
  const [state, setState] = useState<Socket>();

  useEffect(() => {
    const backend =
      import.meta.env.VITE_BACKEND_API_URL ||
      import.meta.env.VITE_BACKEND_DOMAIN ||
      "http://localhost:3003";
    // ensure no trailing slash
    const base = backend.replace(/\/+$/, "");
    const socket = io(base, {
      transports: ["websocket", "polling"],
      upgrade: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    setState(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketIoContext.Provider value={{ socket: state as Socket }}>
      {children}
    </SocketIoContext.Provider>
  );
};

export default SocketIoProvider;

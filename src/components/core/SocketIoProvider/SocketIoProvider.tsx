import { FC, useEffect, useState, useContext } from "react";
import io, { Socket } from "socket.io-client";
import SocketIoContext from "./SocketIoContext";
import { useDebugSettings } from "../DebugMenu/debugSettings";

const SocketIoProvider: FC<{}> = ({ children }) => {
  const [state, setState] = useState<Socket>();
  const { disableWebsockets } = useDebugSettings();

  useEffect(() => {
    const backend =
      import.meta.env.VITE_BACKEND_DOMAIN ||
      import.meta.env.VITE_BACKEND_API_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:3003";
    // ensure no trailing slash
    const base = backend.replace(/\/+$/, "");
    const socket = io(base, {
      // Connect over HTTP polling first and upgrade to websocket only if the probe succeeds,
      // so networks that block or hang websocket connections stay on polling
      transports: disableWebsockets ? ["polling"] : ["polling", "websocket"],
      upgrade: !disableWebsockets,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
    });
    setState(socket);

    return () => {
      socket.disconnect();
    };
  }, [disableWebsockets]);

  return (
    <SocketIoContext.Provider value={{ socket: state as Socket }}>
      {children}
    </SocketIoContext.Provider>
  );
};

export default SocketIoProvider;

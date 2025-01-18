import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BACKEND_BASE_URL}`, {
  transports: ["websocket", "polling"],
}); // Backend URL
export default socket;

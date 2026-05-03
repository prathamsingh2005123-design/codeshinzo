import { io } from "socket.io-client";

const socket = io("https://codeshinzo-backend.onrender.com", {
  withCredentials: true,
});

socket.on("connect", () => {
  // Connected
});

export default socket;
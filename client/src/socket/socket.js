import { io } from "socket.io-client";

const socket = io("https://realtime-collab-coding.onrender.com/");

export default socket;
import { io } from "socket.io-client";

const socket = io("https://collabaratory-platform.onrender.com");

export default socket;
import { io } from "socket.io-client";

const socket = io("https://collabaratory-platform-2.onrender.com/");

export default socket;
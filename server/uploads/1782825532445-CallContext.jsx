import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect
} from "react";
import socket from "../socket/socket";

const CallContext = createContext(null);

export const CallProvider = ({ roomId, children }) => {
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const cameraTrack = useRef(null);
  const screenStreamRef = useRef(null);

  const [remoteStream, setRemoteStream] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [currentSharerId, setCurrentSharerId] = useState(null);

  const ensurePeerConnection = useCallback(() => {
    if (peerConnection.current) return peerConnection.current;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current = pc;
    return pc;
  }, [roomId]);

  // Starts the camera + peer connection. Safe to call multiple times.
  const startCall = useCallback(async () => {
    if (callStarted || localStream.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStream.current = stream;
      cameraTrack.current = stream.getVideoTracks()[0];

      const pc = ensurePeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      setCallStarted(true);
      socket.emit("user-ready", roomId);
    } catch (error) {
      console.log(error);
    }
  }, [callStarted, ensurePeerConnection, roomId]);

  const endCall = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((t) => t.stop());
      localStream.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    cameraTrack.current = null;
    setRemoteStream(null);
    setCallStarted(false);
    setIsScreenSharing(false);
  }, []);

  // --- signaling ---
  useEffect(() => {
    const onUserReady = async () => {
      // another participant became ready — only respond if we have a call going
      if (!localStream.current) return;
      try {
        const pc = ensurePeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("video-offer", { roomId, offer });
      } catch (error) {
        console.log(error);
      }
    };

    const onVideoOffer = async (offer) => {
      try {
        // someone is calling us — make sure our camera/peer connection exists
        if (!localStream.current) await startCall();
        const pc = ensurePeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("video-answer", { roomId, answer });
      } catch (error) {
        console.log(error);
      }
    };

    const onVideoAnswer = async (answer) => {
      try {
        const pc = peerConnection.current;
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (error) {
        console.log(error);
      }
    };

    const onIceCandidate = async (candidate) => {
      try {
        const pc = peerConnection.current;
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.log(error);
      }
    };

    const onScreenShareStarted = ({ userId }) => setCurrentSharerId(userId);
    const onScreenShareStopped = () => setCurrentSharerId(null);

    socket.on("user-ready", onUserReady);
    socket.on("video-offer", onVideoOffer);
    socket.on("video-answer", onVideoAnswer);
    socket.on("ice-candidate", onIceCandidate);
    socket.on("screen-share-started", onScreenShareStarted);
    socket.on("screen-share-stopped", onScreenShareStopped);

    return () => {
      socket.off("user-ready", onUserReady);
      socket.off("video-offer", onVideoOffer);
      socket.off("video-answer", onVideoAnswer);
      socket.off("ice-candidate", onIceCandidate);
      socket.off("screen-share-started", onScreenShareStarted);
      socket.off("screen-share-stopped", onScreenShareStopped);
    };
  }, [roomId, ensurePeerConnection, startCall]);

  // --- screen share ---
  const startScreenShare = useCallback(async () => {
    if (currentSharerId && currentSharerId !== socket.id) {
      alert("Another user is already sharing the screen.");
      return;
    }

    try {
      if (!localStream.current) await startCall();

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      const screenTrack = stream.getVideoTracks()[0];
      screenStreamRef.current = stream;

      const pc = peerConnection.current;
      const sender = pc
        ?.getSenders()
        .find((s) => s.track && s.track.kind === "video");

      if (sender) sender.replaceTrack(screenTrack);

      setIsScreenSharing(true);
      socket.emit("screen-share-started", { roomId, userId: socket.id });

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSharerId, roomId, startCall]);

  const stopScreenShare = useCallback(() => {
    const pc = peerConnection.current;
    const sender = pc
      ?.getSenders()
      .find((s) => s.track && s.track.kind === "video");

    if (sender && cameraTrack.current) {
      sender.replaceTrack(cameraTrack.current);
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    setIsScreenSharing(false);
    socket.emit("screen-share-stopped", { roomId, userId: socket.id });
  }, [roomId]);

  useEffect(() => {
    return () => {
      endCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    localStream,
    remoteStream,
    callStarted,
    startCall,
    endCall,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    currentSharerId,
    mySocketId: socket.id
  };

  return (
    <CallContext.Provider value={value}>{children}</CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);

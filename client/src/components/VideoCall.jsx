import { useEffect, useRef } from "react";
import socket from "../socket/socket";

const VideoCall = ({ roomId, onEndCall }) => {
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);

  const peerConnection = useRef(null);
  const localStream = useRef(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });

        localStream.current = stream;

        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }

        peerConnection.current =
          new RTCPeerConnection({
            iceServers: [
              {
                urls:
                  "stun:stun.l.google.com:19302"
              }
            ]
          });

        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(
            track,
            stream
          );
        });

        peerConnection.current.ontrack = (
          event
        ) => {
          if (remoteVideo.current) {
            remoteVideo.current.srcObject =
              event.streams[0];
          }
        };

        peerConnection.current.onicecandidate = (
          event
        ) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              roomId,
              candidate: event.candidate
            });
          }
        };

        socket.emit("user-ready", roomId);

      } catch (error) {
        console.log(error);
      }
    };

    startVideo();

    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId]);

  // Create Offer
  useEffect(() => {
    socket.on(
      "user-ready",
      async () => {
        try {
          const offer =
            await peerConnection.current.createOffer();

          await peerConnection.current.setLocalDescription(
            offer
          );

          socket.emit("video-offer", {
            roomId,
            offer
          });
        } catch (error) {
          console.log(error);
        }
      }
    );

    return () => {
      socket.off("user-ready");
    };
  }, [roomId]);

  // Receive Offer
  useEffect(() => {
    socket.on(
      "video-offer",
      async (offer) => {
        try {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(
              offer
            )
          );

          const answer =
            await peerConnection.current.createAnswer();

          await peerConnection.current.setLocalDescription(
            answer
          );

          socket.emit("video-answer", {
            roomId,
            answer
          });
        } catch (error) {
          console.log(error);
        }
      }
    );

    return () => {
      socket.off("video-offer");
    };
  }, [roomId]);

  // Receive Answer
  useEffect(() => {
    socket.on(
      "video-answer",
      async (answer) => {
        try {
          await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(
              answer
            )
          );
        } catch (error) {
          console.log(error);
        }
      }
    );

    return () => {
      socket.off("video-answer");
    };
  }, []);

  // ICE Candidates
  useEffect(() => {
    socket.on(
      "ice-candidate",
      async (candidate) => {
        try {
          if (
            peerConnection.current &&
            candidate
          ) {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );
          }
        } catch (error) {
          console.log(error);
        }
      }
    );

    return () => {
      socket.off("ice-candidate");
    };
  }, []);
const endCall = () => {
if (localStream.current) {

  localStream.current.getTracks().forEach((track) => {

    track.stop();

    console.log(
      track.kind,
      track.readyState
    );

  });

  localStream.current = null;
}

  if (myVideo.current) {
    myVideo.current.srcObject = null;
  }

  if (remoteVideo.current) {
    remoteVideo.current.srcObject = null;
  }

  if (peerConnection.current) {
    peerConnection.current.close();
    peerConnection.current = null;
  }

  socket.off("user-ready");
  socket.off("video-offer");
  socket.off("video-answer");
  socket.off("ice-candidate");

  if (onEndCall) {
    onEndCall();
  }

};

  return (
    <div
      style={{
        border: "1px solid gray",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "20px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <h3 style={{ margin: 0 }}>Video Call</h3>
        <button
          onClick={endCall}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px 16px",
            cursor: "pointer"
          }}
        >
          End Call
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "flex-start"
        }}
      >
        <div style={{ flex: 1, minWidth: 160 }}>
          <h4>My Camera</h4>

          <video
            ref={myVideo}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              border: "1px solid black",
              borderRadius: "10px",
              height: "180px",
              objectFit: "cover"
            }}
          />
        </div>

        <div style={{ flex: 1.4, minWidth: 180 }}>
          <h4>Remote User</h4>

          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            style={{
              width: "100%",
              border: "1px solid black",
              borderRadius: "10px",
              background: "black",
              height: "180px",
              objectFit: "cover",
              maxHeight: "220px"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
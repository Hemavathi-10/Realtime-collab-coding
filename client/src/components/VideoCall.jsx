import { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext";

const VideoCall = ({ onEndCall }) => {
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
    localStream,
    localStreamState,
    remoteStream,
    callStarted,
    startCall,
    endCall,
    isScreenSharing,
    screenStream,
    startScreenShare,
    stopScreenShare,
    currentSharerId,
    mySocketId
  } = useCall();

  const isLockedByOther = !!currentSharerId && currentSharerId !== mySocketId;

  // Start the call when this panel opens.
  useEffect(() => {
    if (!callStarted) startCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ONE effect syncs BOTH video elements every time any relevant state changes.
  // Keeping them together means a screen-share start (which changes isScreenSharing
  // and screenStream) re-syncs the remote video at the same time as the local one,
  // so neither box ever gets left behind in a stale/null state.
  useEffect(() => {
    // ── My Camera / My Screen ──────────────────────────────────────────────
    const myNode = myVideoRef.current;
    if (myNode) {
      const src = isScreenSharing && screenStream
        ? screenStream
        : localStream.current ?? null;

      if (myNode.srcObject !== src) {
        myNode.srcObject = src;
      }
      if (src) myNode.play().catch(() => {});
    }

    // ── Remote User ────────────────────────────────────────────────────────
    const remoteNode = remoteVideoRef.current;
    if (remoteNode) {
      if (remoteNode.srcObject !== remoteStream) {
        remoteNode.srcObject = remoteStream ?? null;
      }
      if (remoteStream) remoteNode.play().catch(() => {});
    }
  }, [
    localStreamState,   // fires when camera stream first becomes available
    isScreenSharing,    // fires when screen share starts / stops
    screenStream,       // fires when screen stream object changes
    remoteStream,       // fires when remote peer's stream arrives / changes
    localStream         // ref object (stable), included for completeness
  ]);

  const handleEndCall = () => {
    if (isScreenSharing) stopScreenShare();
    endCall();
    if (onEndCall) onEndCall();
  };

  const handleShareToggle = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px"
        }}
      >
        <h3 style={{ margin: 0 }}>Video Call</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleShareToggle}
            disabled={isLockedByOther}
            title={isLockedByOther ? "Someone else is already sharing" : ""}
            style={{
              background: isLockedByOther
                ? "#9ca3af"
                : isScreenSharing
                ? "#f59e0b"
                : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: isLockedByOther ? "not-allowed" : "pointer"
            }}
          >
            {isScreenSharing ? "Stop Sharing" : "Share Screen"}
          </button>

          <button
            onClick={handleEndCall}
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
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        {/* My Camera / My Screen */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <h4 style={{ margin: "0 0 6px 0" }}>
            {isScreenSharing ? "My Screen" : "My Camera"}
          </h4>
          <video
            ref={myVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              border: "1px solid black",
              borderRadius: "10px",
              height: "180px",
              objectFit: isScreenSharing ? "contain" : "cover",
              background: "black"
            }}
          />
        </div>

        {/* Remote User */}
        <div style={{ flex: 1.4, minWidth: 180 }}>
          <h4 style={{ margin: "0 0 6px 0" }}>Remote User</h4>
          <video
            ref={remoteVideoRef}
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

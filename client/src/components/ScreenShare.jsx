import { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext";

const ScreenShare = () => {
  const previewVideo = useRef(null);

  const {
    isScreenSharing,
    screenStream,
    startScreenShare,
    stopScreenShare,
    currentSharerId,
    mySocketId
  } = useCall();

  const isLockedByOther =
    !!currentSharerId && currentSharerId !== mySocketId;

  const handleShare = async () => {
    await startScreenShare();
  };

  const handleStop = () => {
    stopScreenShare();
  };

  // bind the actual screen capture stream to the preview <video> tag
  useEffect(() => {
    if (previewVideo.current) {
      previewVideo.current.srcObject = screenStream || null;
    }
  }, [screenStream]);

  return (
    <div
      style={{
        border: "1px solid gray",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h3 style={{ margin: 0 }}>Screen Sharing</h3>

        {!isScreenSharing ? (
          <button
            onClick={handleShare}
            disabled={isLockedByOther}
            style={{
              background: isLockedByOther ? "#9ca3af" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: isLockedByOther ? "not-allowed" : "pointer"
            }}
            title={
              isLockedByOther ? "Someone else is already sharing" : ""
            }
          >
            Share Screen
          </button>
        ) : (
          <button
            onClick={handleStop}
            style={{
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: "pointer"
            }}
          >
            Stop Sharing
          </button>
        )}
      </div>

      {isScreenSharing ? (
        <video
          ref={previewVideo}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            minHeight: "260px",
            objectFit: "contain",
            borderRadius: "10px",
            background: "black"
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            minHeight: "260px",
            borderRadius: "10px",
            background: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontSize: "14px",
            textAlign: "center",
            padding: "10px"
          }}
        >
          {isLockedByOther
            ? "Another user is currently sharing their screen"
            : "Click Share Screen to broadcast your screen to the room"}
        </div>
      )}
    </div>
  );
};

export default ScreenShare;

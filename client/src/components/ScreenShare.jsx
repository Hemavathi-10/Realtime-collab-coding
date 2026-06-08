import { useRef } from "react";

const ScreenShare = () => {
  const screenVideo = useRef(null);

  const startShare = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });

      if (screenVideo.current) {
        screenVideo.current.srcObject = stream;

        screenVideo.current.onloadedmetadata = () => {
          screenVideo.current.play();
        };
      }

    } catch (error) {
      console.log(error);
    }
  };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Screen Sharing</h3>
        <button
          onClick={startShare}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px 16px",
            cursor: "pointer"
          }}
        >
          Share Screen
        </button>
      </div>

      <video
        ref={screenVideo}
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
    </div>
  );
};

export default ScreenShare;
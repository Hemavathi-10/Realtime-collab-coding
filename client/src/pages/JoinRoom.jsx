import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!roomId.trim()) {
      alert("Please enter a Room ID");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      await axios.get(
        `http://localhost:5000/api/rooms/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate(`/room/${roomId}`);

    } catch (error) {
      alert("Room does not exist");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleJoin();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "20px"
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "60px 50px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "450px",
          backdropFilter: "blur(10px)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#333",
              margin: "0 0 15px 0"
            }}
          >
            🚀 Join Room
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: "15px",
              margin: 0
            }}
          >
            Enter a room ID to join an existing collaboration
          </p>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "10px"
            }}
          >
            Room ID
          </label>
          <input
            type="text"
            placeholder="Enter Room ID (e.g., ROOM-1234)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "10px",
              fontSize: "15px",
              fontFamily: "'Courier New', monospace",
              boxSizing: "border-box",
              transition: "border-color 0.3s, box-shadow 0.3s",
              outline: "none",
              opacity: loading ? 0.6 : 1
            }}
            onFocus={(e) => {
              if (!loading) {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: loading ? "#bbb" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
          }}
        >
          {loading ? "Joining..." : "Join Room"}
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
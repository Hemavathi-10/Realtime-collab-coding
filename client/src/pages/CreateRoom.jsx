import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const create = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://realtime-collab-coding.onrender.com/api/rooms/create",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate(`/room/${res.data.roomId}`);
    };

    create();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "60px 50px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          textAlign: "center",
          backdropFilter: "blur(10px)"
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            margin: "0 auto 30px",
            border: "4px solid #667eea",
            borderTop: "4px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}
        />
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#333",
            margin: "0 0 15px 0"
          }}
        >
          Creating Room...
        </h2>
        <p
          style={{
            color: "#666",
            fontSize: "14px"
          }}
        >
          Setting up your collaboration space
        </p>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default CreateRoom;
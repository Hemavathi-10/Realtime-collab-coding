import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket/socket";
import CodeEditor from "../components/CodeEditor";
import Whiteboard from "../components/Whiteboard";
import VideoCall from "../components/VideoCall";
import FileShare from "../components/FileShare";
import { CallProvider } from "../context/CallContext";

import {
  FaUsers,
  FaCopy,
  FaFile,
  FaComments,
  FaWindowMinimize,
  FaWindowMaximize,
  FaTimes,
  FaPaperPlane
} from "react-icons/fa";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import "../styles/Room.css";

const RoomInner = ({ roomId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTool, setActiveTool] = useState(null);
  const panelDragRef = useRef({ x: 0, y: 0 });
  const [panelPos, setPanelPos] = useState({ x: null, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [toast, setToast] = useState("");
  const [reaction, setReaction] = useState(null);
  const [showReactions, setShowReactions] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (activeTool) {
      setPanelPos({ x: null, y: 80 });
      setMinimized(false);
      setMaximized(false);
    }
  }, [activeTool]);

  const handleEndCall = () => {
    console.log("CALL ENDED");
    setActiveTool(null);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID Copied!");
  };

  useEffect(() => {
    const username = localStorage.getItem("name");

    if (!username) return;

    socket.emit("join-room", {
      roomId,
      username
    });
  }, [roomId]);

  // Participants
  useEffect(() => {
    socket.on("participants-update", (users) => {
      setParticipants(users);

      const lastUser = users[users.length - 1];

      if (lastUser) {
        setToast(`${lastUser.username} joined the room`);

        setTimeout(() => {
          setToast("");
        }, 3000);
      }
    });

    return () => {
      socket.off("participants-update");
    };
  }, []);

  // Receive Messages
  useEffect(() => {
    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      const myName = localStorage.getItem("name");

      if (msg.username !== myName) {
        setToast(`${msg.username} sent a message`);

        setTimeout(() => {
          setToast("");
        }, 3000);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  // Load Room Data
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `https://collabaratory-platform-2.onrender.com//api/rooms/data/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data.messages) {
          setMessages(res.data.messages);
        }

        if (res.data.activities) {
          setActivities(res.data.activities);
        }
      } catch (error) {
        console.log("Failed to load room data");
      }
    };

    loadRoomData();
  }, [roomId]);

  useEffect(() => {
    function onMove(e) {
      if (!dragging) return;
      const nx = e.clientX - panelDragRef.current.x;
      const ny = e.clientY - panelDragRef.current.y;
      const clampedX = Math.max(8, Math.min(nx, window.innerWidth - 100));
      const clampedY = Math.max(8, Math.min(ny, window.innerHeight - 60));
      setPanelPos({ x: clampedX, y: clampedY });
    }
    function onUp() {
      setDragging(false);
    }
    if (dragging) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  useEffect(() => {
    socket.on("receive-reaction", (data) => {
      setReaction(`${data.username} ${data.emoji}`);

      setTimeout(() => {
        setReaction(null);
      }, 2000);
    });

    return () => {
      socket.off("receive-reaction");
    };
  }, []);

  // Send Message
  const sendMessage = async () => {
    if (!message.trim()) return;

    const username = localStorage.getItem("name");

    socket.emit("send-message", {
      roomId,
      message,
      username
    });

    try {
      const token = localStorage.getItem("token");

      // Save Message
      await axios.post(
        "https://collabaratory-platform-2.onrender.com//api/rooms/save-message",
        {
          roomId,
          username,
          message
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Save Activity
      await axios.post(
        "https://collabaratory-platform-2.onrender.com//api/rooms/save-activity",
        {
          roomId,
          text: `${username} sent a message`
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setActivities((prev) => [
        ...prev,
        {
          text: `${username} sent a message`
        }
      ]);
    } catch (error) {
      console.log("Message save failed");
    }

    setMessage("");
  };

  const leaveRoom = () => {
    navigate("/");
  };

  return (
    <div className="room-container">
      {/* HEADER */}
      <div className="room-header">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div>
            <h2 style={{ margin: "0 0 5px 0", color: "#e6e6e6" }}>Room ID</h2>
            <code
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                color: "#67e8f9",
                fontFamily: "'Courier New', monospace"
              }}
            >
              {roomId}
            </code>
          </div>
          <div
            style={{
              height: "40px",
              width: "1px",
              background: "rgba(255, 255, 255, 0.2)"
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#e6e6e6"
            }}
          >
            <FaUsers size={18} />
            <span style={{ fontWeight: "600" }}>
              {participants.length} Online
            </span>
          </div>
        </div>

        <div className="header-buttons" style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={copyRoomId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <FaCopy /> Copy
          </button>

          <button
            onClick={leaveRoom}
            style={{
              padding: "10px 16px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#ef4444";
            }}
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* MAIN 3 COLUMN LAYOUT */}
      <div className="main-layout">
        {/* LEFT SIDE */}
        <div className="editor-panel">
          <CodeEditor roomId={roomId} />
        </div>

        {/* CENTER */}
        <div className="whiteboard-panel">
          <Whiteboard roomId={roomId} />
        </div>
      </div>

      <div className="bottom-toolbar">
        <button
          onClick={() =>
            setActiveTool(activeTool === "video" ? null : "video")
          }
        >
          📹
        </button>

        <button
          onClick={() =>
            setActiveTool(activeTool === "file" ? null : "file")
          }
        >
          📁
        </button>

        <button
          onClick={() =>
            setActiveTool(activeTool === "chat" ? null : "chat")
          }
        >
          💬
        </button>
        <button onClick={() => setShowReactions(!showReactions)}>😀</button>
      </div>

      {activeTool && (
        <div
          className="floating-panel"
          style={{
            left: panelPos.x !== null ? panelPos.x : undefined,
            top: panelPos.y !== null ? panelPos.y : 80,
            right: panelPos.x === null ? 20 : undefined,
            width: maximized ? "calc(100vw - 40px)" : 380,
            height: minimized ? 56 : maximized ? "calc(100vh - 40px)" : 450
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className="floating-header"
            onMouseDown={(e) => {
              e.preventDefault();
              setDragging(true);
              const startX = e.clientX;
              const startY = e.clientY;
              const px =
                panelPos.x !== null ? panelPos.x : window.innerWidth - 420;
              const py = panelPos.y !== null ? panelPos.y : 80;
              panelDragRef.current.x = startX - px;
              panelDragRef.current.y = startY - py;
              if (panelPos.x === null) setPanelPos({ x: px, y: py });
            }}
          >
            <div className="floating-title">{activeTool?.toUpperCase()}</div>
            <div className="floating-controls">
              <button
                className="ctrl-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setMinimized((v) => !v);
                }}
                title="Minimize"
              >
                <FaWindowMinimize />
              </button>
              <button
                className="ctrl-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setMaximized((v) => !v);
                  if (!maximized) setMinimized(false);
                }}
                title="Maximize"
              >
                <FaWindowMaximize />
              </button>
              <button
                className="ctrl-btn close-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTool(null);
                }}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {activeTool === "video" && <VideoCall onEndCall={handleEndCall} />}

          {activeTool === "file" && <FileShare roomId={roomId} />}

          {activeTool === "chat" && (
            <>
              <div className="chat-box">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`chat-msg ${
                      localStorage.getItem("name") === m.username
                        ? "self"
                        : ""
                    }`}
                  >
                    <div className="chat-msg-author">{m.username}</div>
                    <div className="chat-msg-text">{m.message}</div>
                  </div>
                ))}
              </div>

              <div className="chat-input chat-input-pill">
                <input
                  placeholder="Send a message"
                  value={message}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  className="send-btn"
                  onClick={sendMessage}
                  aria-label="Send"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
      {reaction && <div className="reaction-float">{reaction}</div>}
      {showReactions && (
        <div className="reaction-picker">
          {["😀", "😍", "❤️", "👍", "🎉", "👏", "😂", "😮", "🔥", "🚀"].map(
            (emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  socket.emit("send-reaction", {
                    roomId,
                    emoji,
                    username: localStorage.getItem("name")
                  });

                  setShowReactions(false);
                }}
              >
                {emoji}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

const Room = () => {
  const { roomId } = useParams();

  // CallProvider is mounted here, OUTSIDE the floating windows, so the
  // camera/peer connection survives switching between the Video and
  // File windows instead of being torn down on unmount.
  return (
    <CallProvider roomId={roomId}>
      <RoomInner roomId={roomId} />
    </CallProvider>
  );
};

export default Room;

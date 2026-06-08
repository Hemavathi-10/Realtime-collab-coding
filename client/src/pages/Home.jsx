import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const username = localStorage.getItem("name") || "User";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px"
        }}
      >
        <button
          onClick={logout}
          style={{
            padding: "10px 24px",
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "2px solid white",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "white";
            e.target.style.color = "#667eea";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
            e.target.style.color = "white";
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          textAlign: "center",
          color: "white",
          marginBottom: "50px"
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "700",
            margin: "0 0 20px 0",
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
          }}
        >
          Collaborative Platform
        </h1>
        <p
          style={{
            fontSize: "18px",
            margin: "0 0 10px 0",
            opacity: "0.95"
          }}
        >
          Real-time collaboration for teams
        </p>
      </div>

      {/* Welcome Card */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "60px 50px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          maxWidth: "500px",
          width: "100%",
          backdropFilter: "blur(10px)"
        }}
      >
        <div style={{ marginBottom: "50px" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#333",
              margin: "0 0 15px 0"
            }}
          >
            Welcome, {username}! 👋
          </h2>
          <p
            style={{
              color: "#666",
              fontSize: "15px",
              margin: 0
            }}
          >
            Choose an option to get started with your collaboration session
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexDirection: "column"
          }}
        >
          <button
            onClick={() => navigate("/create")}
            style={{
              padding: "16px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 6px 25px rgba(102, 126, 234, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
            }}
          >
            ✨ Create New Room
          </button>

          <button
            onClick={() => navigate("/join")}
            style={{
              padding: "16px 24px",
              background: "white",
              color: "#667eea",
              border: "2px solid #667eea",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#667eea";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "white";
              e.target.style.color = "#667eea";
            }}
          >
            🚀 Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
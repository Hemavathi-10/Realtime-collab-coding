import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("email", res.data.user.email);

      alert("Registration successful");
      navigate("/");
    } catch (err) {
      if (err?.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

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
          width: "100%",
          maxWidth: "420px",
          backdropFilter: "blur(10px)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#333",
              margin: "0 0 10px 0"
            }}
          >
            Create Account
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: "14px",
              margin: 0
            }}
          >
            Register and join your collaborative workspace
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px"
            }}
          >
            Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "10px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.3s, box-shadow 0.3s",
              outline: "none"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#667eea";
              e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px"
            }}
          >
            Email
          </label>
          <input
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "10px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.3s, box-shadow 0.3s",
              outline: "none"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#667eea";
              e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px"
            }}
          >
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "2px solid #e0e0e0",
              borderRadius: "10px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.3s, box-shadow 0.3s",
              outline: "none"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#667eea";
              e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <button
          onClick={handleRegister}
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
          {loading ? "Registering..." : "Register"}
        </button>

        <div
          style={{
            marginTop: "18px",
            textAlign: "center",
            color: "#555",
            fontSize: "14px"
          }}
        >
          Already have an account?{' '}
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              cursor: "pointer",
              fontWeight: 700,
              textDecoration: "underline",
              padding: 0
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;

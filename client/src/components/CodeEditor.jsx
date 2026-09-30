import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import socket from "../socket/socket";
import axios from "axios";

const CodeEditor = ({ roomId }) => {
  const [code, setCode] = useState("// Start coding here");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  

  // Socket sync
  useEffect(() => {
    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off("code-update");
    };
  }, []);

  // Load saved code from MongoDB
  useEffect(() => {
    const loadCode = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `https://realtime-collab-coding.onrender.com//api/rooms/data/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data.code) {
          setCode(res.data.code);
        }
      } catch (error) {
        console.log("Load code failed");
      }
    };

    loadCode();
  }, [roomId]);

  const handleChange = async (value) => {
    setCode(value);

    socket.emit("code-change", {
      roomId,
      code: value
    });

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://realtime-collab-coding.onrender.com//api/rooms/save-code",
        {
          roomId,
          code: value
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.log("Code save failed");
    }
  };
  
const runCode = async () => {
  try {

    const res = await axios.post(
      "https://realtime-collab-coding.onrender.com//api/code/run",
      {
        code
      }
    );

    setOutput(res.data.output);

  } catch (error) {

    setOutput("Execution Error");

  }
};

return (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      height: "700px"
    }}
  >
    <div style={{ marginBottom: "10px" }}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
      </select>

      <button
        onClick={runCode}
        style={{
          marginLeft: "10px"
        }}
      >
        Run Code
      </button>
    </div>

    <div style={{ flex: 1 }}>
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleChange}
        theme="vs-dark"
      />
    </div>

    <div
      style={{
        marginTop: "10px",
        border: "1px solid #444",
        background: "#111",
        color: "white",
        padding: "10px",
        height: "120px",
        overflowY: "auto"
      }}
    >
      <h4>Output</h4>

      <pre>{output}</pre>
    </div>
  </div>
);
};

export default CodeEditor;
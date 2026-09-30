import React, { useState, useEffect } from "react";
import { Stage, Layer, Line, Rect, Circle, Text } from "react-konva";
import socket from "../socket/socket";
import axios from "axios";

const Whiteboard = ({ roomId }) => {
  const [elements, setElements] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [currentShape, setCurrentShape] = useState(null);

  useEffect(() => {
    socket.on("whiteboard-sync", (newLines) => {
      setElements(newLines || []);
    });

    return () => socket.off("whiteboard-sync");
  }, []);

  useEffect(() => {
    const loadWhiteboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://realtime-collab-coding.onrender.com//api/rooms/data/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.whiteboard) setElements(res.data.whiteboard);
      } catch (err) {
        console.log("Load whiteboard failed");
      }
    };
    loadWhiteboard();
  }, [roomId]);

  const saveWhiteboard = async (updatedElements) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://realtime-collab-coding.onrender.com//api/rooms/save-whiteboard",
        { roomId, lines: updatedElements },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log("Whiteboard save failed");
    }
  };

  const updateRemote = (updatedElements) => {
    socket.emit("whiteboard-update", { roomId, lines: updatedElements });
  };

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if (tool === "text") {
      const text = window.prompt("Enter text for the whiteboard:");
      if (!text) return;
      const updated = [
        ...elements,
        { type: "text", x: pos.x, y: pos.y, text, fontSize: 20, fill: color || "#000" }
      ];
      setElements(updated);
      updateRemote(updated);
      saveWhiteboard(updated);
      return;
    }

    if (tool === "rectangle" || tool === "circle") {
      setIsDrawing(true);
      setCurrentShape({ type: tool, x: pos.x, y: pos.y, width: 0, height: 0, stroke: color, strokeWidth, fill: "transparent" });
      return;
    }

    setIsDrawing(true);
    const strokeColor = tool === "eraser" ? "#ffffff" : color;
    const size = tool === "eraser" ? 12 : strokeWidth;
    const updated = [
      ...elements,
      { type: "line", points: [pos.x, pos.y], stroke: strokeColor, strokeWidth: size, tension: 0.5, lineCap: "round" }
    ];
    setElements(updated);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (tool === "rectangle" || tool === "circle") {
      if (!currentShape) return;
      const updatedShape = { ...currentShape, width: point.x - currentShape.x, height: point.y - currentShape.y };
      setCurrentShape(updatedShape);
      return;
    }

    const last = elements[elements.length - 1];
    if (!last || last.type !== "line") return;
    const updatedLine = { ...last, points: last.points.concat([point.x, point.y]) };
    const updatedElements = elements.slice(0, -1).concat(updatedLine);
    setElements(updatedElements);
    updateRemote(updatedElements);
  };

  const handleMouseUp = () => {
    if (tool === "rectangle" || tool === "circle") {
      if (!currentShape) {
        setIsDrawing(false);
        return;
      }
      const updated = [...elements, currentShape];
      setElements(updated);
      setCurrentShape(null);
      setIsDrawing(false);
      updateRemote(updated);
      saveWhiteboard(updated);
      return;
    }

    setIsDrawing(false);
    saveWhiteboard(elements);
  };

  const clearBoard = async () => {
    setElements([]);
    updateRemote([]);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://realtime-collab-coding.onrender.com//api/rooms/save-whiteboard",
        { roomId, lines: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log("Whiteboard clear save failed");
    }
  };

  const tools = [
    { value: "pencil", label: "Draw" },
    { value: "text", label: "Text" },
    { value: "rectangle", label: "Rectangle" },
    { value: "circle", label: "Circle" },
    { value: "eraser", label: "Eraser" }
  ];

  const toolbarStyle = { display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" };
const buttonBaseStyle = {
  padding: "0.6rem 0.95rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  background: "#f5f5f5",
  color: "#000",        // ADD THIS
  fontWeight: "600",    // ADD THIS
  cursor: "pointer",
  minWidth: "90px",
  textAlign: "center"
};
const activeButtonStyle = {
  ...buttonBaseStyle,
  background: "#007bff",
  color: "#fff",
  borderColor: "#0056b3"
};
  return (
    <div style={{ maxWidth: "760px" }}>
      <div style={toolbarStyle}>
        {tools.map((t) => (
          <button key={t.value} type="button" onClick={() => setTool(t.value)} style={tool === t.value ? activeButtonStyle : buttonBaseStyle}>
            {t.label}
          </button>
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label htmlFor="colorPicker" style={{ fontWeight: 500 }}>Color</label>
          <input id="colorPicker" type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: "2.6rem", height: "2.6rem", border: "none", padding: 0, background: "none" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label htmlFor="strokeWidth" style={{ fontWeight: 500 }}>Size</label>
          <select id="strokeWidth" value={strokeWidth} onChange={(e) => setStrokeWidth(parseInt(e.target.value, 10))} style={{ padding: "0.45rem 0.65rem", borderRadius: "8px", border: "1px solid #ccc" }}>
            <option value={2}>Thin</option>
            <option value={4}>Medium</option>
            <option value={8}>Thick</option>
          </select>
        </div>

        <button type="button" onClick={clearBoard} style={{ ...buttonBaseStyle, background: "#dc3545", color: "white", borderColor: "#c82333" }}>
          Clear Board
        </button>
      </div>

      <div style={{ border: "1px solid #ccc", borderRadius: "12px", padding: "0.5rem", background: "white" }}>
        <Stage width={720} height={520} style={{ backgroundColor: "#fff" }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <Layer>
            {/* shapes first */}
            {elements.map((el, i) => {
              if (el.type === "line") return <Line key={`line-${i}`} points={el.points} stroke={el.stroke || "#000"} strokeWidth={el.strokeWidth} tension={el.tension} lineCap={el.lineCap} />;
              if (el.type === "rectangle") return <Rect key={`rect-${i}`} x={el.x} y={el.y} width={el.width} height={el.height} stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill || "transparent"} />;
              if (el.type === "circle") {
                const radius = Math.sqrt(Math.pow(el.width, 2) + Math.pow(el.height, 2)) / 2;
                return <Circle key={`circle-${i}`} x={el.x + el.width / 2} y={el.y + el.height / 2} radius={Math.abs(radius)} stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill || "transparent"} />;
              }
              return null;
            })}

            {/* text on top */}
            {elements.map((el, i) => el.type === "text" ? <Text key={`text-${i}`} x={el.x} y={el.y} text={el.text} fontSize={el.fontSize || 18} fill={el.fill || "#000"} listening={false} /> : null)}

            {/* preview current shape */}
            {currentShape && currentShape.type === "rectangle" && <Rect x={currentShape.x} y={currentShape.y} width={currentShape.width} height={currentShape.height} stroke={currentShape.stroke} strokeWidth={currentShape.strokeWidth} dash={[6, 4]} fill={currentShape.fill || "transparent"} />}
            {currentShape && currentShape.type === "circle" && <Circle x={currentShape.x + currentShape.width / 2} y={currentShape.y + currentShape.height / 2} radius={Math.sqrt(Math.pow(currentShape.width, 2) + Math.pow(currentShape.height, 2)) / 2} stroke={currentShape.stroke} strokeWidth={currentShape.strokeWidth} dash={[6, 4]} fill={currentShape.fill || "transparent"} />}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Whiteboard;

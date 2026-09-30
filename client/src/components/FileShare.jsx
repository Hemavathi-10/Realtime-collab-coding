import { useState, useEffect } from "react";
import axios from "axios";


const FileShare = ({ roomId }) => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const res = await axios.get(
          `https://collabaratory-platform.onrender.com/api/files/${roomId}`
        );

        setFiles(res.data);
      } catch (error) {
        console.log("Failed to load files");
      }
    };

    loadFiles();
  }, [roomId]);

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("roomId", roomId);
    formData.append(
      "uploadedBy",
      localStorage.getItem("name")
    );

    try {
      const res = await axios.post(
        "https://collabaratory-platform.onrender.com/api/files/upload",
        formData
      );

      const token = localStorage.getItem("token");

await axios.post(
  "https://collabaratory-platform.onrender.com/api/rooms/save-activity",
  {
    roomId,
    text: `${localStorage.getItem("name")} uploaded ${file.name}`
  },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

      alert("Uploaded Successfully");

      setFiles((prev) => [
        ...prev,
        res.data
      ]);

      setFile(null);

    } catch (error) {
      console.log(error);
      alert("Upload Failed");
    }
  };

const deleteFile = async (id, fileName) => {
  try {

    await axios.delete(
      `https://collabaratory-platform.onrender.com/api/files/${id}`
    );

    const token = localStorage.getItem("token");

    await axios.post(
      "https://collabaratory-platform.onrender.com/api/rooms/save-activity",
      {
        roomId,
        text: `${localStorage.getItem("name")} deleted ${fileName}`
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setFiles((prev) =>
      prev.filter((file) => file._id !== id)
    );

  } catch (error) {
    console.log(error);
  }
};

const clearSelectedFile = () => {
  setFile(null);

  const fileInput =
    document.getElementById("fileInput");

  if (fileInput) {
    fileInput.value = "";
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
      <h3 style={{ margin: 0 }}>File Sharing</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          id="fileInput"
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={uploadFile}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: "pointer"
            }}
          >
            Upload
          </button>
          <button
            onClick={clearSelectedFile}
            style={{
              background: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: "pointer"
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <hr />

      <h4>Shared Files</h4>

      {files.length === 0 ? (
        <p>No files uploaded yet</p>
      ) : (
        files.map((file) => (
          <div
            key={file._id}
            style={{
              marginBottom: "8px"
            }}
          >
            <a
  href={`https://collabaratory-platform.onrender.com/uploads/${file.fileUrl}`}
  target="_blank"
  rel="noreferrer"
>
  {file.fileName}
</a>

{" "}

<a
  href={`https://collabaratory-platform.onrender.com/uploads/${file.fileUrl}`}
  download
>
  <button>
    Download
  </button>
</a>

           {" - "}
{file.uploadedBy}

<button
  style={{
    marginLeft: "10px"
  }}
  onClick={() =>
  deleteFile(
    file._id,
    file.fileName
  )
}
>
  Delete
</button>
          </div>
        ))
      )}
    </div>
  );
};

export default FileShare;
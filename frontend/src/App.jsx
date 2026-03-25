import { useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

function App() {
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState("light");
  const [active, setActive] = useState("upload");
  const [loading, setLoading] = useState(false);

  // 🔥 NEW (PREDICTION STATES)
  const [inputValues, setInputValues] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);

  // =========================
  // 📁 UPLOAD
  // =========================
  const uploadFile = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        alert("Please select a file");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      setLoading(true);

      const res = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData
      );

      const response = res.data;

      if (!response || typeof response !== "object") {
        alert("Invalid server response");
        setLoading(false);
        return;
      }

      if (response.error) {
        alert(typeof response.error === "string" ? response.error : "Something went wrong");
        setLoading(false);
        return;
      }

      setData(response);
      setActive("charts");
      setLoading(false);

    } catch (err) {
      console.error(err);
      alert("Upload failed");
      setLoading(false);
    }
  };

  // =========================
  // 🤖 TRAIN MODEL
  // =========================
  const runML = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://127.0.0.1:8000/train");
      const response = res.data;

      if (!response || typeof response !== "object") {
        alert("Invalid response");
        setLoading(false);
        return;
      }

      if (response.error) {
        alert(typeof response.error === "string" ? response.error : "Something went wrong");
        setLoading(false);
        return;
      }

      alert(`Model Score: ${response.score}`);
      setLoading(false);

    } catch (err) {
      console.error(err);
      alert("ML failed");
      setLoading(false);
    }
  };

  // =========================
  // 🤖 PREDICTION
  // =========================
  const handleInputChange = (col, value) => {
    setInputValues({
      ...inputValues,
      [col]: Number(value)
    });
  };

  const runPrediction = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://127.0.0.1:8000/predict",
        inputValues
      );

      const response = res.data;

      if (!response || typeof response !== "object") {
        alert("Invalid response");
        setLoading(false);
        return;
      }

      if (response.error) {
        alert(typeof response.error === "string" ? response.error : "Prediction failed");
        setLoading(false);
        return;
      }

      setPredictionResult(response.prediction);
      setLoading(false);

    } catch (err) {
      console.error(err);
      alert("Prediction failed");
      setLoading(false);
    }
  };

  const dark = theme === "dark";

  const styles = {
    app: {
      display: "flex",
      minHeight: "100vh",
      background: dark
        ? "linear-gradient(135deg, #020617, #0f172a)"
        : "linear-gradient(135deg, #eef2ff, #f8fafc)",
      fontFamily: "Inter, sans-serif"
    },

    sidebar: {
      width: "240px",
      padding: "25px",
      background: dark ? "#020617" : "#ffffffcc",
      backdropFilter: "blur(20px)",
      borderRight: "1px solid #ddd"
    },

    menu: (key) => ({
      padding: "14px",
      borderRadius: "12px",
      marginBottom: "12px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "0.3s",
      background:
        active === key
          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
          : "transparent",
      color: active === key ? "#fff" : dark ? "#ccc" : "#000"
    }),

    main: {
      flex: 1,
      padding: "40px"
    },

    card: {
      background: dark
        ? "rgba(255,255,255,0.05)"
        : "rgba(255,255,255,0.6)",
      backdropFilter: "blur(20px)",
      padding: "30px",
      borderRadius: "20px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      maxWidth: "900px",
      margin: "auto"
    },

    row: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "15px",
      marginTop: "20px",
      flexWrap: "wrap"
    },

    input: {
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #ccc"
    },

    button: {
      padding: "12px 20px",
      borderRadius: "12px",
      border: "none",
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      color: "#fff",
      cursor: "pointer",
      fontWeight: "600"
    }
  };

  return (
    <div style={styles.app}>
      
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>🚀 AI Cleaner</h2>

        <div style={styles.menu("upload")} onClick={() => setActive("upload")}>
          📁 Upload
        </div>

        <div style={styles.menu("charts")} onClick={() => setActive("charts")}>
          📊 Charts
        </div>

        <div style={styles.menu("insights")} onClick={() => setActive("insights")}>
          🧠 Insights
        </div>

        <button
          style={{ marginTop: "20px" }}
          onClick={() => setTheme(dark ? "light" : "dark")}
        >
          {dark ? "☀ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h1 style={{ textAlign: "center" }}>
          AI Data Cleaner Dashboard
        </h1>

        {loading && <p style={{ textAlign: "center" }}>⏳ Processing...</p>}

        {/* UPLOAD */}
        {active === "upload" && (
          <div style={styles.card}>
            <h2>📁 Upload Data</h2>

            <div style={styles.row}>
              <input type="file" onChange={uploadFile} />

              <a href="http://127.0.0.1:8000/download">
                <button style={styles.button}>⬇ Download</button>
              </a>

              <button style={styles.button} onClick={runML}>
                🤖 Train Model
              </button>
            </div>
          </div>
        )}

        {/* CHARTS */}
        {active === "charts" && data && (
          <div style={styles.card}>
            <h2>📊 Charts</h2>

            {(data.numeric_columns || []).map((col, i) => (
              <div key={i}>
                <h4>{col}</h4>

                <BarChart width={700} height={250}
                  data={(data.data || []).map((r, idx) => ({
                    ...r,
                    index: idx
                  }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey={col} fill="#6366f1" />
                </BarChart>
              </div>
            ))}
          </div>
        )}

        {/* INSIGHTS + PREDICTION */}
        {active === "insights" && data && (
          <div style={styles.card}>
            <h2>🧠 Insights</h2>

            {(data.insights || []).map((i, idx) => (
              <p key={idx}>{i}</p>
            ))}

            <h3>📊 Quality</h3>
            <p>Score: {data?.quality?.score ?? 0}/100</p>
            <p>Missing: {data?.quality?.missing_percent ?? 0}%</p>

            {/* 🔥 LIVE PREDICTION */}
            <hr style={{ margin: "20px 0" }} />

            <h3>🤖 Live Prediction</h3>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {(data?.numeric_columns || []).map((col, i) => (
                <input
                  key={i}
                  placeholder={col}
                  style={styles.input}
                  onChange={(e) => handleInputChange(col, e.target.value)}
                />
              ))}
            </div>

            <button
              style={{ ...styles.button, marginTop: "15px" }}
              onClick={runPrediction}
            >
              Predict
            </button>

            {predictionResult !== null && (
              <h3 style={{ marginTop: "15px" }}>
                🎯 Result: {predictionResult}
              </h3>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
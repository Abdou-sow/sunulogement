import React, { useRef, useState, useEffect } from "react";

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [lastCapture, setLastCapture] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");

  const startStream = (mode) => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      .then((s) => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
        setError(null);
      })
      .catch((err) => {
        setError("Accès caméra refusé : " + (err.message || "vérifiez les permissions du navigateur."));
      });
  };

  useEffect(() => {
    startStream("environment");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const switchCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startStream(next);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setLastCapture(canvas.toDataURL("image/jpeg", 0.92));
  };

  const confirmCapture = () => {
    if (!lastCapture) return;
    onCapture({
      dataUrl: lastCapture,
      name: `Photo_${new Date().toLocaleString("fr-FR").replace(/[/:]/g, "-")}`,
      timestamp: new Date().toLocaleString("fr-FR"),
    });
    setLastCapture(null);
  };

  const handleClose = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#1a1a2e", borderRadius: 14, padding: 24, width: "95%", maxWidth: 640, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>📷 Appareil photo</h3>
          <button onClick={handleClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        {error ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
            <p style={{ color: "#f44336", fontSize: 14, lineHeight: 1.6 }}>{error}</p>
            <p style={{ color: "#aaa", fontSize: 12, marginTop: 8 }}>
              Autorisez l'accès à la caméra dans les paramètres de votre navigateur.
            </p>
            <button
              onClick={handleClose}
              style={{ marginTop: 16, padding: "8px 20px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
            >
              Fermer
            </button>
          </div>
        ) : !lastCapture ? (
          <>
            <div style={{ position: "relative", background: "#000", borderRadius: 10, overflow: "hidden" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", display: "block", maxHeight: 420, objectFit: "cover" }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginTop: 20 }}>
              <button
                onClick={switchCamera}
                title="Retourner la caméra"
                style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}
              >
                🔄
              </button>
              <button
                onClick={capture}
                title="Prendre une photo"
                style={{
                  width: 70, height: 70, borderRadius: "50%",
                  background: "#fff", border: "5px solid #1976d2",
                  cursor: "pointer", fontSize: 30, lineHeight: 1,
                  boxShadow: "0 0 0 3px rgba(25,118,210,0.3)",
                }}
              >
                📸
              </button>
              <div style={{ width: 44 }} />
            </div>
            <p style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 12 }}>
              Cliquez sur 📸 pour capturer
            </p>
          </>
        ) : (
          <>
            <img
              src={lastCapture}
              alt="Aperçu"
              style={{ width: "100%", borderRadius: 10, display: "block", maxHeight: 420, objectFit: "contain", background: "#000" }}
            />
            <div style={{ display: "flex", gap: 12, marginTop: 18, justifyContent: "center" }}>
              <button
                onClick={() => setLastCapture(null)}
                style={{ padding: "10px 24px", background: "#555", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
              >
                🔄 Reprendre
              </button>
              <button
                onClick={confirmCapture}
                style={{ padding: "10px 24px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}
              >
                ✅ Utiliser cette photo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

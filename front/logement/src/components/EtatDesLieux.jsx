import React, { useState, useRef, useEffect, useCallback } from "react";
import CameraCapture from "./CameraCapture";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ---------- constantes ----------
const ETATS = ["Neuf", "Bon état", "État moyen", "Dégradé"];

const ELEMENTS_PAR_DEFAUT = [
  { id: "sol", label: "Sol" },
  { id: "murs", label: "Murs" },
  { id: "plafond", label: "Plafond" },
  { id: "equipements", label: "Équipements" },
];

const creerElement = () => ({
  etat: "Bon état",
  commentaire: "",
  photos: [], // { dataUrl, name, timestamp }
});

const creerPiece = (nom = "") => ({
  id: Date.now() + Math.random(),
  nom,
  sol: creerElement(),
  murs: creerElement(),
  plafond: creerElement(),
  equipements: creerElement(),
});

// ---------- SignatureCanvas ----------
function SignatureCanvas({ label, signataire, onSave, locked }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [saved, setSaved] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    if (locked || saved) return;
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
  };

  const draw = (e) => {
    if (!drawing.current || locked || saved) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  };

  const endDraw = () => { drawing.current = false; };

  const clear = () => {
    if (locked || saved) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    const now = new Date();
    onSave({ dataUrl, signataire, date: now.toLocaleString("fr-FR") });
    setSaved(true);
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, background: saved ? "#f0fff4" : "#fafafa" }}>
      <p style={{ margin: "0 0 6px", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: "0 0 8px", fontSize: 13, color: "#555" }}>
        {signataire} — {saved ? "✅ Signé" : "En attente de signature"}
      </p>
      <canvas
        ref={canvasRef}
        width={380}
        height={130}
        style={{
          border: "1px solid #ccc",
          borderRadius: 6,
          cursor: locked || saved ? "not-allowed" : "crosshair",
          background: "#fff",
          touchAction: "none",
          display: "block",
        }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      {!saved && !locked && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            onClick={clear}
            style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}
          >
            Effacer
          </button>
          <button
            type="button"
            onClick={save}
            style={{ padding: "6px 12px", borderRadius: 4, border: "none", background: "#1976d2", color: "#fff", cursor: "pointer", fontSize: 13 }}
          >
            Confirmer la signature
          </button>
        </div>
      )}
      {saved && (
        <p style={{ fontSize: 12, color: "#4CAF50", marginTop: 6 }}>
          Lu et approuvé — signé le {new Date().toLocaleString("fr-FR")}
        </p>
      )}
    </div>
  );
}

// ---------- composant principal ----------
export default function EtatDesLieux({ locataire, logement, user, onArchive, onClose }) {
  const [pieces, setPieces] = useState([creerPiece("Salon")]);
  const [nouvellePiece, setNouvellePiece] = useState("");
  const [signatureLocataire, setSignatureLocataire] = useState(null);
  const [signatureBailleur, setSignatureBailleur] = useState(null);
  const [locked, setLocked] = useState(false);
  const [historique, setHistorique] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [cameraConfig, setCameraConfig] = useState(null); // { pieceId, elementKey }
  const autoSaveRef = useRef(null);

  // --- Auto-save toutes les 30 secondes ---
  const doAutoSave = useCallback(() => {
    if (locked) return;
    setSaving(true);
    const snap = {
      pieces,
      ts: new Date().toISOString(),
    };
    localStorage.setItem("edl_autosave", JSON.stringify(snap));
    setLastSaved(new Date().toLocaleTimeString("fr-FR"));
    setHistorique((h) => [
      { action: "Auto-sauvegarde", date: new Date().toLocaleString("fr-FR") },
      ...h.slice(0, 19),
    ]);
    setTimeout(() => setSaving(false), 400);
  }, [pieces, locked]);

  useEffect(() => {
    autoSaveRef.current = setInterval(doAutoSave, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [doAutoSave]);

  // --- Mettre à jour un champ d'un élément ---
  const updateElement = (pieceId, elementKey, field, value) => {
    if (locked) return;
    setPieces((prev) =>
      prev.map((p) =>
        p.id === pieceId
          ? { ...p, [elementKey]: { ...p[elementKey], [field]: value } }
          : p
      )
    );
    setHistorique((h) => [
      {
        action: `Modification ${elementKey} de la pièce`,
        date: new Date().toLocaleString("fr-FR"),
      },
      ...h.slice(0, 19),
    ]);
  };

  // --- Upload photos ---
  const handlePhotos = (pieceId, elementKey, files) => {
    if (locked) return;
    const piece = pieces.find((p) => p.id === pieceId);
    const pieceName = piece?.nom || "Pièce";
    const readers = Array.from(files).map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) =>
            resolve({
              dataUrl: e.target.result,
              name: `${pieceName} - ${elementKey} - ${file.name}`,
              timestamp: new Date().toLocaleString("fr-FR"),
            });
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((newPhotos) => {
      setPieces((prev) =>
        prev.map((p) =>
          p.id === pieceId
            ? {
                ...p,
                [elementKey]: {
                  ...p[elementKey],
                  photos: [...p[elementKey].photos, ...newPhotos],
                },
              }
            : p
        )
      );
    });
  };

  const handleCameraCapture = (photo) => {
    if (!cameraConfig) return;
    const { pieceId, elementKey } = cameraConfig;
    setPieces((prev) =>
      prev.map((p) =>
        p.id === pieceId
          ? { ...p, [elementKey]: { ...p[elementKey], photos: [...p[elementKey].photos, photo] } }
          : p
      )
    );
    setCameraConfig(null);
  };

  const removePhoto = (pieceId, elementKey, photoIdx) => {
    if (locked) return;
    setPieces((prev) =>
      prev.map((p) =>
        p.id === pieceId
          ? {
              ...p,
              [elementKey]: {
                ...p[elementKey],
                photos: p[elementKey].photos.filter((_, i) => i !== photoIdx),
              },
            }
          : p
      )
    );
  };

  const ajouterPiece = () => {
    if (!nouvellePiece.trim()) return;
    setPieces((prev) => [...prev, creerPiece(nouvellePiece.trim())]);
    setNouvellePiece("");
  };

  const supprimerPiece = (id) => {
    if (locked) return;
    setPieces((prev) => prev.filter((p) => p.id !== id));
  };

  // --- Validation avant signature ---
  const validerChamps = () => {
    for (const p of pieces) {
      if (!p.nom.trim()) return "Toutes les pièces doivent avoir un nom.";
    }
    return null;
  };

  // --- Verrouillage après double signature ---
  useEffect(() => {
    if (signatureLocataire && signatureBailleur && !locked) {
      setLocked(true);
      setHistorique((h) => [
        { action: "Document verrouillé après signatures", date: new Date().toLocaleString("fr-FR") },
        ...h,
      ]);
    }
  }, [signatureLocataire, signatureBailleur, locked]);

  // --- Génération PDF ---
  const genererPDF = async () => {
    const err = validerChamps();
    if (err) { alert(err); return; }
    if (!signatureLocataire || !signatureBailleur) {
      alert("Les deux signatures sont requises avant de générer le PDF.");
      return;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    // En-tête
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ÉTAT DES LIEUX", pageW / 2, 12, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Établi le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
      pageW / 2,
      20,
      { align: "center" }
    );
    y = 36;

    // Infos logement / locataire
    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: y,
      head: [["Logement", "Locataire"]],
      body: [
        [
          `${logement?.titre || "-"}\n${logement?.localisation || "-"}\nPrix : ${logement?.prix || "-"} €/mois`,
          `${locataire?.nom || ""} ${locataire?.prenom || ""}\n${locataire?.email || "-"}\n${locataire?.telephone || "-"}`,
        ],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [25, 118, 210] },
      margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 8;

    // Détail pièces
    for (const piece of pieces) {
      // Vérifier espace restant
      if (y > 250) { doc.addPage(); y = margin; }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(25, 118, 210);
      doc.text(`▶ ${piece.nom}`, margin, y);
      y += 4;

      const rows = ELEMENTS_PAR_DEFAUT.map((el) => {
        const elem = piece[el.id];
        return [el.label, elem.etat, elem.commentaire || "-"];
      });

      autoTable(doc, {
        startY: y,
        head: [["Élément", "État", "Commentaire"]],
        body: rows,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [236, 239, 241] , textColor: [0, 0, 0] },
        columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 28 }, 2: { cellWidth: "auto" } },
        margin: { left: margin, right: margin },
      });
      y = doc.lastAutoTable.finalY + 4;

      // Photos de la pièce
      const toutesPhotos = ELEMENTS_PAR_DEFAUT.flatMap((el) =>
        piece[el.id].photos.map((ph) => ({ ...ph, element: el.label }))
      );
      for (const ph of toutesPhotos) {
        if (y > 230) { doc.addPage(); y = margin; }
        try {
          doc.addImage(ph.dataUrl, "JPEG", margin, y, 60, 45);
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.setFont("helvetica", "normal");
          doc.text(`${ph.element} — ${ph.timestamp}`, margin + 62, y + 6);
          doc.text(ph.name, margin + 62, y + 12);
          y += 50;
        } catch (_) {}
      }
      y += 4;
    }

    // Signatures
    if (y > 210) { doc.addPage(); y = margin; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Signatures", margin, y);
    y += 6;

    const drawSig = (sig, label, x) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(label, x, y);
      doc.text(sig.signataire || "", x, y + 5);
      doc.text(`Lu et approuvé — ${sig.date}`, x, y + 10);
      try {
        doc.addImage(sig.dataUrl, "PNG", x, y + 13, 70, 25);
      } catch (_) {}
    };

    drawSig(signatureLocataire, "Le locataire :", margin);
    drawSig(signatureBailleur, "Le bailleur :", pageW / 2 + 5);

    // Mention légale
    y += 46;
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(
      "Document généré automatiquement — valeur probatoire soumise aux dispositions de la loi n°89-462 du 6 juillet 1989.",
      pageW / 2,
      y,
      { align: "center" }
    );

    const pdfBlob = doc.output("blob");
    const nomFichier = `Etat des lieux - ${logement?.titre || "Logement"} - ${locataire?.nom || ""} ${locataire?.prenom || ""}`.trim();

    // Archivage dans la DB via FormData
    if (onArchive) {
      const fd = new FormData();
      fd.append("etatDesLieux", new File([pdfBlob], `${nomFichier}.pdf`, { type: "application/pdf" }));
      await onArchive(fd, nomFichier);
    }

    // Téléchargement direct
    doc.save(`${nomFichier}.pdf`);
  };

  // ==================== RENDU ====================
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto", padding: "0 0 40px" }}>
      {/* En-tête */}
      <div style={{ background: "linear-gradient(135deg,#1976d2,#42a5f5)", color: "#fff", padding: "18px 24px", borderRadius: "10px 10px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>📋 État des lieux</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>
            {logement?.titre || "Logement"} — {locataire?.nom} {locataire?.prenom}
          </p>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, opacity: 0.8 }}>
          {saving ? "💾 Sauvegarde…" : lastSaved ? `✅ Sauvegardé à ${lastSaved}` : ""}
          {locked && <div style={{ color: "#ffeb3b", fontWeight: 700, marginTop: 4 }}>🔒 Document verrouillé</div>}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "20px 24px" }}>

        {/* Ajouter pièce */}
        {!locked && (
          <div style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "center" }}>
            <input
              value={nouvellePiece}
              onChange={(e) => setNouvellePiece(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), ajouterPiece())}
              placeholder="Nom de la pièce (ex : Chambre 1)"
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14 }}
            />
            <button
              type="button"
              onClick={ajouterPiece}
              style={{ padding: "8px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}
            >
              + Ajouter pièce
            </button>
          </div>
        )}

        {/* Liste des pièces */}
        {pieces.map((piece) => (
          <PieceSection
            key={piece.id}
            piece={piece}
            locked={locked}
            onUpdate={updateElement}
            onPhotos={handlePhotos}
            onRemovePhoto={removePhoto}
            onCamera={(elementKey) => setCameraConfig({ pieceId: piece.id, elementKey })}
            onDelete={() => supprimerPiece(piece.id)}
            onRename={(nom) =>
              !locked &&
              setPieces((prev) =>
                prev.map((p) => (p.id === piece.id ? { ...p, nom } : p))
              )
            }
          />
        ))}

        {cameraConfig && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setCameraConfig(null)}
          />
        )}

        {/* Signatures */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ borderBottom: "2px solid #e3f2fd", paddingBottom: 8, color: "#1976d2" }}>✍️ Signatures électroniques</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <SignatureCanvas
              label="Signature du locataire"
              signataire={`${locataire?.nom || ""} ${locataire?.prenom || ""}`.trim() || "Locataire"}
              onSave={setSignatureLocataire}
              locked={locked}
            />
            <SignatureCanvas
              label="Signature du bailleur"
              signataire={user?.name || user?.nom || "Bailleur"}
              onSave={setSignatureBailleur}
              locked={locked}
            />
          </div>
        </div>

        {/* Historique */}
        {historique.length > 0 && (
          <details style={{ marginTop: 24 }}>
            <summary style={{ cursor: "pointer", fontSize: 13, color: "#888" }}>
              📜 Historique des modifications ({historique.length})
            </summary>
            <div style={{ maxHeight: 160, overflowY: "auto", marginTop: 8, padding: 10, background: "#f9f9f9", borderRadius: 6, fontSize: 12 }}>
              {historique.map((h, i) => (
                <div key={i} style={{ borderBottom: "1px solid #eee", padding: "3px 0" }}>
                  <strong>{h.action}</strong> — {h.date}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={doAutoSave}
            disabled={locked}
            style={{ padding: "9px 18px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: locked ? "not-allowed" : "pointer", fontSize: 14 }}
          >
            💾 Sauvegarder
          </button>
          <button
            type="button"
            onClick={genererPDF}
            style={{ padding: "9px 22px", borderRadius: 6, border: "none", background: "#4CAF50", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          >
            📄 Générer & Archiver le PDF
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "9px 18px", borderRadius: 6, border: "1px solid #ddd", background: "#eee", cursor: "pointer", fontSize: 14 }}
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- PieceSection ----------
function PieceSection({ piece, locked, onUpdate, onPhotos, onRemovePhoto, onCamera, onDelete, onRename }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, marginBottom: 16, overflow: "hidden" }}>
      {/* Header pièce */}
      <div
        style={{ background: "#e3f2fd", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{open ? "▼" : "▶"}</span>
          {locked ? (
            <strong style={{ fontSize: 15 }}>{piece.nom}</strong>
          ) : (
            <input
              value={piece.nom}
              onChange={(e) => { e.stopPropagation(); onRename(e.target.value); }}
              onClick={(e) => e.stopPropagation()}
              style={{ fontWeight: 700, fontSize: 15, border: "none", background: "transparent", outline: "none", width: 200 }}
            />
          )}
        </div>
        {!locked && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}
          >
            Supprimer
          </button>
        )}
      </div>

      {open && (
        <div style={{ padding: "12px 16px" }}>
          {ELEMENTS_PAR_DEFAUT.map((el) => (
            <ElementSection
              key={el.id}
              label={el.label}
              data={piece[el.id]}
              locked={locked}
              onUpdate={(field, val) => onUpdate(piece.id, el.id, field, val)}
              onPhotos={(files) => onPhotos(piece.id, el.id, files)}
              onRemovePhoto={(idx) => onRemovePhoto(piece.id, el.id, idx)}
              onCamera={() => onCamera(el.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- ElementSection ----------
function ElementSection({ label, data, locked, onUpdate, onPhotos, onRemovePhoto, onCamera }) {
  const fileRef = useRef(null);

  return (
    <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #f0f0f0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <strong style={{ width: 90, flexShrink: 0, color: "#555" }}>{label}</strong>
        <select
          value={data.etat}
          onChange={(e) => onUpdate("etat", e.target.value)}
          disabled={locked}
          style={{ padding: "5px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, background: locked ? "#f5f5f5" : "#fff" }}
        >
          {ETATS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <input
          value={data.commentaire}
          onChange={(e) => onUpdate("commentaire", e.target.value)}
          disabled={locked}
          placeholder="Commentaire (optionnel)"
          style={{ flex: 1, minWidth: 160, padding: "5px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, background: locked ? "#f5f5f5" : "#fff" }}
        />
        {!locked && (
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{ padding: "5px 12px", border: "1px solid #1976d2", color: "#1976d2", background: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}
            >
              🖼️ Galerie
            </button>
            <button
              type="button"
              onClick={onCamera}
              style={{ padding: "5px 12px", border: "1px solid #4CAF50", color: "#4CAF50", background: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}
            >
              📷 Caméra
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => { onPhotos(e.target.files); e.target.value = ""; }}
            />
          </>
        )}
      </div>

      {/* Prévisualisation photos */}
      {data.photos.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10, paddingLeft: 106 }}>
          {data.photos.map((ph, i) => (
            <div key={i} style={{ position: "relative", textAlign: "center" }}>
              <img
                src={ph.dataUrl}
                alt={ph.name}
                style={{ width: 90, height: 68, objectFit: "cover", borderRadius: 4, border: "1px solid #ddd" }}
              />
              <div style={{ fontSize: 9, color: "#888", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ph.timestamp}
              </div>
              {!locked && (
                <button
                  type="button"
                  onClick={() => onRemovePhoto(i)}
                  style={{ position: "absolute", top: 2, right: 2, background: "rgba(244,67,54,0.85)", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 11, cursor: "pointer", lineHeight: "18px", padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

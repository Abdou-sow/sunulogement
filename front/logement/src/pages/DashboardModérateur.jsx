import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import {
  getAllProprietaires,
  autoriserProprietaire,
  refuserProprietaire,
} from "../services/logements";

export default function DashboardModérateur() {
  const { user, logout } = useUser();
  const [proprietaires, setProprietaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllProprietaires()
      .then(setProprietaires)
      .catch((err) => console.error("Erreur chargement :", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAutoriser = async (id) => {
    try {
      await autoriserProprietaire(id);
      setProprietaires((prev) =>
        prev.map((p) => (p._id === id ? { ...p, autorise: true } : p))
      );
    } catch {
      alert("Erreur lors de l'autorisation");
    }
  };

  const handleRefuser = async (id) => {
    try {
      await refuserProprietaire(id);
      setProprietaires((prev) =>
        prev.map((p) => (p._id === id ? { ...p, autorise: false } : p))
      );
    } catch {
      alert("Erreur lors du refus");
    }
  };

  const filtered = proprietaires.filter((p) => {
    const term = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(term) ||
      (p.email || "").toLowerCase().includes(term)
    );
  });

  const autorises = filtered.filter((p) => p.autorise);
  const nonAutorises = filtered.filter((p) => !p.autorise);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* Header */}
      <div style={{ background: "#1a237e", color: "#fff", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>🛡️ Espace Modérateur</h1>
          <p style={{ margin: "2px 0 0", opacity: 0.8, fontSize: 14 }}>
            {user?.name} — {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          style={{ background: "#ef5350", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
        >
          Déconnexion
        </button>
      </div>

      <div style={{ padding: "2rem", maxWidth: 1100, margin: "auto" }}>
        {/* Statistiques rapides */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          <StatCard label="Total propriétaires" value={proprietaires.length} color="#1a237e" />
          <StatCard label="Autorisés" value={autorises.length} color="#2e7d32" />
          <StatCard label="En attente / refusés" value={nonAutorises.length} color="#c62828" />
        </div>

        {/* Barre de recherche */}
        <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>👤 Gestion des propriétaires</h2>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 14px", border: "1px solid #ddd", borderRadius: 6, width: 280, fontSize: 14 }}
            />
          </div>

          {loading ? (
            <p style={{ color: "#888", textAlign: "center", padding: 24 }}>Chargement...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "#888", textAlign: "center", padding: 24 }}>Aucun propriétaire trouvé.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f2f8", textAlign: "left" }}>
                  <th style={th}>Propriétaire</th>
                  <th style={th}>Email</th>
                  <th style={th}>Inscrit le</th>
                  <th style={th}>Statut</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: p.autorise ? "#1a237e" : "#bdbdbd",
                          color: "#fff", display: "flex", alignItems: "center",
                          justifyContent: "center", fontWeight: 700, fontSize: 16,
                        }}>
                          {(p.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <strong>{p.name}</strong>
                      </div>
                    </td>
                    <td style={td}>{p.email}</td>
                    <td style={td}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td style={td}>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 14px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 700,
                        background: p.autorise ? "#e8f5e9" : "#ffebee",
                        color: p.autorise ? "#2e7d32" : "#c62828",
                      }}>
                        {p.autorise ? "✅ Autorisé" : "🚫 Refusé"}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleAutoriser(p._id)}
                          disabled={p.autorise}
                          style={{
                            background: p.autorise ? "#e0e0e0" : "#4CAF50",
                            color: p.autorise ? "#aaa" : "#fff",
                            border: "none",
                            padding: "6px 16px",
                            borderRadius: 6,
                            cursor: p.autorise ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          Autoriser
                        </button>
                        <button
                          onClick={() => handleRefuser(p._id)}
                          disabled={!p.autorise}
                          style={{
                            background: !p.autorise ? "#e0e0e0" : "#f44336",
                            color: !p.autorise ? "#aaa" : "#fff",
                            border: "none",
                            padding: "6px 16px",
                            borderRadius: 6,
                            cursor: !p.autorise ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Vos coordonnées affichées */}
        <div style={{ background: "#e8eaf6", borderRadius: 8, padding: 16, borderLeft: "4px solid #1a237e" }}>
          <p style={{ margin: 0, fontSize: 14, color: "#1a237e" }}>
            <strong>ℹ️ Vos coordonnées de contact</strong> (affichées aux propriétaires refusés) :
            <strong> {user?.name}</strong> — <strong>{user?.email}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", textAlign: "center", borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>{label}</div>
    </div>
  );
}

const th = { padding: "10px 14px", fontWeight: 700, fontSize: 13, borderBottom: "2px solid #e0e0e0" };
const td = { padding: "12px 14px", verticalAlign: "middle" };

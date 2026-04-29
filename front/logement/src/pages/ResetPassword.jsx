import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../services/auth";
import "../styles/Auth.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-section">
        <img src="/logo1.png" alt="LogementPro" className="auth-logo-img" />
      </div>

      <div className="auth-card auth-card-sm">
        <div className="auth-right" style={{ flex: 1 }}>
          <h2 className="auth-title">Nouveau mot de passe</h2>

          {done ? (
            <div className="auth-alert auth-alert-success">
              <strong>✅ Mot de passe mis à jour</strong>
              <p>Vous allez être redirigé vers la connexion dans 3 secondes…</p>
              <Link to="/login" className="link-primary">Se connecter maintenant</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="auth-alert auth-alert-error">{error}</div>}

              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="auth-eye" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirmer le mot de passe"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button type="button" className="auth-eye" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>

              {confirm && password !== confirm && (
                <p style={{ color: "#c62828", fontSize: 13, margin: 0 }}>Les mots de passe ne correspondent pas.</p>
              )}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Enregistrement…" : "Réinitialiser le mot de passe"}
              </button>

              <p className="auth-footer">
                <Link to="/login" className="link-muted">← Retour à la connexion</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

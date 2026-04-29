import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/auth";
import "../styles/Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true); // même message pour ne pas révéler si l'email existe
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
          <h2 className="auth-title">Mot de passe oublié</h2>

          {sent ? (
            <div className="auth-alert auth-alert-success">
              <strong>✅ Email envoyé</strong>
              <p>Si cet email est associé à un compte, vous recevrez un lien de réinitialisation dans quelques minutes.</p>
              <p style={{ fontSize: 13, color: "#555" }}>Vérifiez aussi vos spams.</p>
              <Link to="/login" className="link-primary" style={{ display: "block", marginTop: 12 }}>
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <p style={{ color: "#555", fontSize: 14, margin: "0 0 8px" }}>
                Entrez votre adresse email, nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <input
                type="email"
                placeholder="Adresse email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Envoi…" : "Envoyer le lien"}
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

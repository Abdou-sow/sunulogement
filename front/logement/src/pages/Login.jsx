import { useState } from "react";
import { login as loginService } from "../services/auth";
import { useUser } from "../contexts/UserContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useToast } from "../components/Toast";
import "../styles/Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [blocked, setBlocked] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const pendingApproval = location.state?.pendingApproval || false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBlocked(null);
    setLoading(true);
    try {
      const userData = await loginService({ email, password });
      login(userData);
      navigate("/dashboard");
    } catch (error) {
      const data = error?.response?.data;
      if (data?.blocked) {
        setBlocked(data.contact);
      } else {
        toast(data?.message || "Email ou mot de passe incorrect", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-section">
        <img src="/logo1.png" alt="LogementPro" className="auth-logo-img" />
      </div>

      <div className="auth-card">
        <div className="auth-left">
          <img src="/logo1.png" alt="LogementPro" className="auth-left-img" />
        </div>

        <div className="auth-right">
          <h2 className="auth-title">Connexion</h2>

          {pendingApproval && (
            <div className="auth-alert auth-alert-success">
              <strong>✅ Inscription réussie !</strong>
              <p>Votre compte a été créé. Connectez-vous une fois que le modérateur l'aura autorisé.</p>
            </div>
          )}

          {blocked && (
            <div className="auth-alert auth-alert-warn">
              <strong>⚠️ Compte non autorisé</strong>
              <p>Votre compte n'a pas encore été validé par le modérateur.</p>
              <div className="auth-contact-block">
                <strong>{blocked.name}</strong><br />
                <a href={`mailto:${blocked.email}`}>{blocked.email}</a>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Adresse email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="auth-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="auth-eye" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="auth-links">
              <Link to="/forgot-password" className="link-muted">Mot de passe oublié ?</Link>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>

            <p className="auth-footer">
              Pas encore de compte ? <Link className="link-primary" to="/register">S'inscrire</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

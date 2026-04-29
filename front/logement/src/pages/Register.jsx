import { useState } from "react";
import { register as registerService } from "../services/auth";
import { useUser } from "../contexts/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import "../styles/Auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast("Les mots de passe ne correspondent pas.", "warning");
      return;
    }
    setLoading(true);
    try {
      const userData = await registerService({ name, email, password });
      login(userData);
      navigate("/dashboard");
    } catch (err) {
      toast(err?.response?.data?.message || "Erreur lors de l'inscription", "error");
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
          <h2 className="auth-title">Créer un compte</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              className="auth-input"
              placeholder="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="auth-input"
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="auth-input-wrap">
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
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
              {loading ? "Inscription…" : "S'inscrire"}
            </button>

            <p className="auth-footer">
              Déjà un compte ? <Link className="link-primary" to="/login">Se connecter</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

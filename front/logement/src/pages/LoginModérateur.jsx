import { useState } from "react";
import { login as loginService } from "../services/auth";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import "../styles/Auth.css";

export default function LoginModérateur() {
  const { login } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await loginService({ email, password });
      if (userData?.role !== "moderateur") {
        toast("Accès réservé aux modérateurs", "error");
        return;
      }
      login(userData);
      navigate("/dashboard-mod");
    } catch (error) {
      const msg = error?.response?.data?.message || "Identifiants invalides";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-section">
        <img src="/logo1.png" alt="SunuLogement" className="auth-logo-img" />
      </div>

      <div className="auth-card auth-card-sm">
        <div className="auth-right" style={{ flex: 1 }}>
          <h2 className="auth-title">Connexion Modérateur</h2>

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
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

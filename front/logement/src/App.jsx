import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Logement from "./pages/Logement";
import LogementDetail from "./pages/LogementDetail";
import Annonces from "./pages/Annonces";
import AnnonceDetail from "./pages/AnnoncesDetails";
import DashboardModérateur from "./pages/DashboardModérateur";
import LoginModérateur from "./pages/LoginModérateur";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ConditionsUtilisation from "./pages/ConditionsUtilisation";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import { useUser } from "./contexts/UserContext";
import Footer from "./components/Footer";
import "./styles/Footer.css";

export default function App() {
  const { user } = useUser();
  const isDashboard = window.location.pathname === "/dashboard";

  return (
    <>
      {!isDashboard && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logements" element={<Logement />} />
        <Route path="/logement/:id" element={<LogementDetail />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/annonces" element={<Annonces />} />
        <Route path="/annonces/:id" element={<AnnonceDetail />} />
        <Route path="/login-mod" element={<LoginModérateur />} />
        <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />

        <Route
          path="/dashboard-mod"
          element={
            user?.role === "moderateur" ? (
              <DashboardModérateur />
            ) : user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      {!isDashboard && <Footer />}
    </>
  );
}

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import logementRoutes from "./routes/logementRoutes.js";
import candidatureRoutes from "./routes/candidatureRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import locataireRoutes from "./routes/locataireRoutes.js";
import moderateurRoutes from "./routes/moderateurRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import registreRoutes from "./routes/registreRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rate-limiting sur les routes d'authentification (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 tentatives max par fenêtre
  message: { message: "Trop de tentatives. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/auth/login", authLimiter);
app.use("/auth/forgot-password", authLimiter);
app.use("/auth/reset-password", authLimiter);

app.use("/auth", authRoutes);
app.use("/logements", logementRoutes);
app.use("/candidatures", candidatureRoutes);
app.use("/reservations", reservationRoutes);
app.use("/locataires", locataireRoutes);
app.use("/moderateur", moderateurRoutes);
app.use("/clients", clientRoutes);
app.use("/registres", registreRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connecté");
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
  })
  .catch((err) => console.error(err));

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllProprietaires,
  autoriserProprietaire,
  refuserProprietaire,
} from "../controllers/moderateurController.js";

const router = express.Router();

const requireModerateur = (req, res, next) => {
  if (req.user?.role !== "moderateur") {
    return res.status(403).json({ message: "Accès réservé aux modérateurs" });
  }
  next();
};

router.get("/proprietaires", protect, requireModerateur, getAllProprietaires);
router.patch("/proprietaires/:id/autoriser", protect, requireModerateur, autoriserProprietaire);
router.patch("/proprietaires/:id/refuser", protect, requireModerateur, refuserProprietaire);

export default router;

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createCandidature,
  getCandidaturesByProprietaire,
  updateCandidature,
  validerCandidature,
  refuserCandidature,
  deleteCandidature,
} from "../controllers/candidatureController.js";

const router = express.Router();

router.post("/:logementId", createCandidature);
router.get("/:proprietaireId", protect, getCandidaturesByProprietaire);
// Spécifique /:id/valider et /:id/refuser avant /:id
router.put("/:id/valider", protect, validerCandidature);
router.put("/:id/refuser", protect, refuserCandidature);
router.put("/:id", protect, updateCandidature);
router.delete("/:id", protect, deleteCandidature);

export default router;

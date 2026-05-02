import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadLocataire } from "../middleware/upload.js";
import {
  createLocataire,
  getLocatairesByProprietaire,
  updateLocataire,
  addPaiement,
  marquerPaiementPaye,
  marquerPaiementImpaye,
  updateEtatDesLieux,
  updateEtatDesLieuxSortie,
  autoMarkUnpaid,
  deletePaiement,
  deleteLocataire,
} from "../controllers/locataireController.js";

const router = express.Router();

const documentsFields = uploadLocataire.fields([
  { name: "pieceIdentite", maxCount: 1 },
  { name: "etatDesLieux", maxCount: 1 },
  { name: "contratBail", maxCount: 1 },
]);

// IMPORTANT : routes statiques avant /:id pour éviter les conflits Express
router.post("/auto-mark-unpaid", protect, autoMarkUnpaid);
router.patch("/paiement/:paiementId/impaye", protect, marquerPaiementImpaye);
router.patch("/paiement/:paiementId", protect, marquerPaiementPaye);
router.delete("/paiement/:paiementId", protect, deletePaiement);

router.post("/", protect, documentsFields, createLocataire);
router.get("/:proprietaireId", protect, getLocatairesByProprietaire);
router.put("/:id", protect, documentsFields, updateLocataire);
router.delete("/:id", protect, deleteLocataire);
router.post("/:locataireId/paiement", protect, addPaiement);
router.patch("/:id/etat-des-lieux", protect, uploadLocataire.single("etatDesLieux"), updateEtatDesLieux);
router.patch("/:id/etat-des-lieux-sortie", protect, uploadLocataire.single("etatDesLieuxSortie"), updateEtatDesLieuxSortie);

export default router;

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
  autoMarkUnpaid,
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

router.post("/", protect, documentsFields, createLocataire);
router.get("/:proprietaireId", protect, getLocatairesByProprietaire);
router.put("/:id", protect, documentsFields, updateLocataire);
router.post("/:locataireId/paiement", protect, addPaiement);
router.patch("/:id/etat-des-lieux", protect, uploadLocataire.single("etatDesLieux"), updateEtatDesLieux);

export default router;

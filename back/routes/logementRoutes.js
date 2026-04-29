import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadLogement } from "../middleware/upload.js";
import {
  getAllLogements,
  getLogementById,
  getLogementsByProprietaire,
  createLogement,
  updateLogement,
  deleteLogement,
} from "../controllers/logementController.js";

const router = express.Router();

router.get("/", getAllLogements);
// Spécifique avant générique pour éviter le conflit /:id
router.get("/proprietaire/:id", protect, getLogementsByProprietaire);
router.get("/:id", getLogementById);
router.post("/", protect, uploadLogement.array("images", 10), createLogement);
router.put("/:id", protect, uploadLogement.array("images", 10), updateLogement);
router.delete("/:id", protect, deleteLogement);

export default router;

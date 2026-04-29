import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createReservation,
  getReservationsByProprietaire,
  getReservationById,
  updateReservation,
  deleteReservation,
} from "../controllers/reservationController.js";

const router = express.Router();

router.post("/:candidatureId", protect, createReservation);
// Spécifique avant générique pour éviter le conflit /:id
router.get("/proprietaire/:proprietaireId", protect, getReservationsByProprietaire);
router.get("/:id", protect, getReservationById);
router.put("/:id", protect, updateReservation);
router.delete("/:id", protect, deleteReservation);

export default router;

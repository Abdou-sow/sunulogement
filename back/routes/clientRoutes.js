import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getClients, createClient, updateClient, deleteClient } from "../controllers/clientController.js";

const router = express.Router();

router.get("/", protect, getClients);
router.post("/", protect, createClient);
router.put("/:id", protect, updateClient);
router.delete("/:id", protect, deleteClient);

export default router;

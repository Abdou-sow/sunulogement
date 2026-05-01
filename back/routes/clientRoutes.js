import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadClient } from "../middleware/upload.js";
import { getClients, createClient, updateClient, deleteClient, uploadClientDocument, deleteClientDocument } from "../controllers/clientController.js";

const router = express.Router();

router.get("/", protect, getClients);
router.post("/", protect, createClient);
router.put("/:id", protect, updateClient);
router.delete("/:id", protect, deleteClient);
router.post("/:id/documents", protect, uploadClient.single("document"), uploadClientDocument);
router.delete("/:id/documents/:docId", protect, deleteClientDocument);

export default router;

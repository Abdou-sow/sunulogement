import express from "express";
import { getRegistres, saveRegistre, deleteRegistre } from "../controllers/registreController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",                        protect, getRegistres);
router.post("/",                       protect, saveRegistre);
router.delete("/:moisNum/:annee",      protect, deleteRegistre);

export default router;

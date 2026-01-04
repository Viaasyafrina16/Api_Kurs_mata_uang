import { Router } from "express";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";
import { latest, convert } from "../controllers/currency.controller.js";

const router = Router();

router.get("/latest", apiKeyAuth, latest);
router.get("/convert", apiKeyAuth, convert);

export default router;

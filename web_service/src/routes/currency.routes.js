import { Router } from "express";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";
import { latest, convert, quota } from "../controllers/currency.controller.js";

const router = Router();

router.get("/quota", apiKeyAuth, quota);
router.get("/latest", apiKeyAuth, latest);
router.get("/convert", apiKeyAuth, convert);

export default router;

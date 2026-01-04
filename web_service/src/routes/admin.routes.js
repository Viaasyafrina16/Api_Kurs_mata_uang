import { Router } from "express";
import { authJwt } from "../middleware/authJwt.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  listCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency
} from "../controllers/adminCurrenciesController.js";

const router = Router();

// CRUD currencies (ADMIN ONLY)
router.get("/currencies", authJwt, requireAdmin, listCurrencies);
router.post("/currencies", authJwt, requireAdmin, createCurrency);
router.put("/currencies/:code", authJwt, requireAdmin, updateCurrency);
router.delete("/currencies/:code", authJwt, requireAdmin, deleteCurrency);

export default router;

import { Router } from "express";
import { authJwt } from "../middleware/authJwt.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

import {
  listCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  createCurrencyWithRate
} from "../controllers/adminCurrenciesController.js";

import {
  adminListRates,
  adminCreateRate,
  adminUpdateRate,
  adminDeleteRate
} from "../controllers/adminRatesController.js";

const router = Router();

// currencies (ADMIN ONLY)
router.get("/currencies", authJwt, requireAdmin, listCurrencies);
router.post("/currencies", authJwt, requireAdmin, createCurrency);
router.put("/currencies/:code", authJwt, requireAdmin, updateCurrency);
router.delete("/currencies/:code", authJwt, requireAdmin, deleteCurrency);
router.post("/currencies-with-rate", authJwt, requireAdmin, createCurrencyWithRate);


// rates (ADMIN ONLY)
router.get("/rates", authJwt, requireAdmin, adminListRates);
router.post("/rates", authJwt, requireAdmin, adminCreateRate);
router.put("/rates/:id", authJwt, requireAdmin, adminUpdateRate);
router.delete("/rates/:id", authJwt, requireAdmin, adminDeleteRate);

export default router;

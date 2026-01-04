import { Router } from "express";
import { authJwt } from "../middleware/authJwt.js";
import { createKey, listKeys, revokeKey } from "../controllers/key.controller.js";

const router = Router();

router.post("/", authJwt, createKey);
router.get("/", authJwt, listKeys);
router.post("/:id/revoke", authJwt, revokeKey);

export default router;

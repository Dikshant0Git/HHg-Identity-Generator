import { Router } from "express";
import { previewBuilderClass } from "../controllers/builderClass.controller.js";

const router = Router();

router.post("/preview", previewBuilderClass);

export default router;

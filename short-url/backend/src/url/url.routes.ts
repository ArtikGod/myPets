import { Router } from "express";
import { UrlController } from "./url.controller.js";

const router = Router();
const urlController = new UrlController();

router.get("/", urlController.getAllUrls.bind(urlController));
router.post("/shorten", urlController.shortenUrl.bind(urlController));
router.get("/:shortUrl", urlController.redirectToOriginalUrl.bind(urlController));
router.get("/info/:shortUrl", urlController.getUrlInfo.bind(urlController));
router.delete("/delete/:shortUrl", urlController.deleteUrl.bind(urlController));

export default router;
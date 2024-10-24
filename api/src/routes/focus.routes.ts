import { Router } from "express";
import { FocusController } from "../controllers/FocusController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const focusRoutes = Router();

const focusController = new FocusController();

focusRoutes.put("/", ensureAuthenticated, focusController.update);
focusRoutes.get("/", ensureAuthenticated, focusController.index);
focusRoutes.get("/:id", ensureAuthenticated, focusController.getFocus);
focusRoutes.delete("/:id", ensureAuthenticated, focusController.deleteFocus);
focusRoutes.put("/:id", ensureAuthenticated, focusController.markAsFinished);

export default focusRoutes;

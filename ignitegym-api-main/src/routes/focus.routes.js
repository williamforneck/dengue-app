const { Router } = require("express");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const FocusController = require("../controllers/FocusController");

const focusRoutes = Router();

const focusController = new FocusController();

focusRoutes.put("/", ensureAuthenticated, focusController.update);
focusRoutes.get("/", ensureAuthenticated, focusController.index);
focusRoutes.get("/:id", ensureAuthenticated, focusController.getFocus);
focusRoutes.put("/:id", ensureAuthenticated, focusController.markAsFinished);

module.exports = focusRoutes;

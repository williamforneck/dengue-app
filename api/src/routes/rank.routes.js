const { Router } = require("express");

const RankController = require("../controllers/RankController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const rankRoutes = Router();

const rankController = new RankController();

rankRoutes.use(ensureAuthenticated);

rankRoutes.get("/", rankController.index);
rankRoutes.get("/points", rankController.getPoints);

module.exports = rankRoutes;

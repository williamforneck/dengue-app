import { Router } from "express";
import { RankController } from "../controllers/RankController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const rankRoutes = Router();

const rankController = new RankController();

rankRoutes.use(ensureAuthenticated);

rankRoutes.get("/", rankController.index);
rankRoutes.get("/points", rankController.getPoints);

export default rankRoutes;

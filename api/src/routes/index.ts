import { Router } from "express";

import focusRoutes from "./focus.routes";
import rankRoutes from "./rank.routes";
import sessionsRouter from "./sessions.routes";
import uploadsRouter from "./uploads.routes";
import usersRoutes from "./users.routes";

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/uploads", uploadsRouter);
routes.use("/sessions", sessionsRouter);

routes.use("/rank", rankRoutes);
routes.use("/focus", focusRoutes);

export default routes;

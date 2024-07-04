const { Router } = require("express");

const usersRouter = require("./users.routes");
const sessionsRouter = require("./sessions.routes");
const uploadsRouter = require("./uploads.routes");
const rankRoutes = require("./rank.routes");
const focusRoutes = require("./focus.routes");

const routes = Router();

routes.use("/users", usersRouter);
routes.use("/uploads", uploadsRouter);
routes.use("/sessions", sessionsRouter);

routes.use("/rank", rankRoutes);
routes.use("/focus", focusRoutes);

module.exports = routes;

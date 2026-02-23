import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler, notFound } from "./middleware/error.js";
import { auditMiddleware } from "./middleware/audit.js";

import vehiclesRoutes from "./routes/vehicles.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import inspectionsRoutes from "./routes/inspections.routes.js";
import insurersRoutes from "./routes/insurers.routes.js";
import publicVerifyRoutes from "./routes/publicVerify.routes.js";
import mediaRoutes from "./routes/media.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

// audit trail (captures actor/ip/user-agent in req.audit)
app.use(auditMiddleware);

// health
app.get("/health", (req, res) => res.json({ ok: true }));

// routes
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/inspections", inspectionsRoutes);
app.use("/api/insurers", insurersRoutes);
app.use("/api/public", publicVerifyRoutes);
app.use("/api/media", mediaRoutes);

// errors
app.use(notFound);
app.use(errorHandler);

export default app;
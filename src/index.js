import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from 'swagger-ui-express';

dotenv.config();

import { logger, httpLogger } from "#lib/logger";
import { errorHandler } from "#middlewares/error-handler";
import { notFoundHandler } from "#middlewares/not-found";
import userRouter from "#routes/auth/user.routes";
import oauthRouter from "#routes/auth/oauth.routes";
import cookieParser from 'cookie-parser';
import { specs } from "#lib/swagger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

// Middlewares
app.use(helmet());
app.use(cors());
app.use(httpLogger);
app.use(express.json());
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Documentation Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCss: '.topbar { display: none }',
}));

// Routes
app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "API Express opérationnelle",
    documentation: "Consultez http://localhost:3000/api-docs pour la documentation Swagger"
  });
});

// Utilisation des routes
app.use("/", userRouter); // Pour garder /register et /login à la racine
app.use("/auth", oauthRouter); // Routes OAuth

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur http://localhost:${PORT}`);
  logger.info(`📚 Documentation Swagger disponible sur http://localhost:${PORT}/api-docs`);
});

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
import workspaceRouter from "#routes/workspace/workspace.route";
import cookieParser from 'cookie-parser';
import { specs } from "#lib/swagger";
import projectRouter from "#routes/workspace/project.route";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

// Middlewares
app.use(helmet());
app.use(httpLogger);
app.use(express.json());
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.set('trust proxy', 1);

//Gestion du probleme de cors
app.use(cors({
  origin: "http://localhost:5173", // L'URL exacte de votre Front-end
  credentials: true,               // Autorise l'envoi des cookies
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


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
app.use("/api", userRouter); // Pour garder /register et /login à la racine
app.use("/api/Oauth", oauthRouter); // Routes OAuth
app.use("/api/workspace", workspaceRouter); // Routes Workspace
app.use("/api/project", projectRouter); // Routes project

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur http://localhost:${PORT}`);
  logger.info(`📚 Documentation Swagger disponible sur http://localhost:${PORT}/api-docs`);
});

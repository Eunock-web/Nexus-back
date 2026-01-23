import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nexus API Documentation',
      version: '1.0.0',
      description: 'Documentation complète de l\'API backend du projet Nexus - Authentification, Gestion Utilisateurs, 2FA et OAuth',
      contact: {
        name: 'Support Nexus',
        email: 'support@nexus.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
      {
        url: 'http://localhost:3001',
        description: 'Serveur alternatif',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token pour l\'authentification. Mettre "Bearer {token}" dans Authorization header',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'Refresh Token stocké automatiquement dans les cookies HTTP-Only',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            firstname: { type: 'string', example: 'Jean' },
            lastname: { type: 'string', example: 'Dupont' },
            avatarUrl: { type: 'string', nullable: true, example: null },
            twoFactorEnable: { type: 'boolean', example: false },
            twoFactorSecret: { type: 'string', nullable: true, example: null },
            createdAt: { type: 'string', format: 'date-time', example: '2026-01-23T10:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-01-23T10:00:00Z' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Une erreur est survenue' },
            response: { type: 'string' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            response: { type: 'string' },
          },
        },
      },
    },
  },
  apis: [
    './src/routes/**/*.js',
  ],
};

export const specs = swaggerJsdoc(options);

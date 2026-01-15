import swaggerJsdoc from 'swagger-jsdoc';

const options = {

  definition: {
    openapi: '3.0.0',

    info: {
      title: 'Nexus API Documentation',
      version: '1.0.0',
      description: 'Documentation de l’API backend pour le projet Nexus (Auth, Users, etc.)',
    },

    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Serveur de développement',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: { // Pour tes futures routes protégées par JWT
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },

  },
  
  // Chemin vers les fichiers contenant les annotations 
  apis: [
    './src/routes/**/*.js',
    './src/controllers/**/*.js'
  ], 

};

export const specs = swaggerJsdoc(options);
# ⚙️ Guide de Configuration Swagger - Nexus API

## 📌 Fichiers Modifiés

### 1. `src/lib/swagger.js` ✅
Configuration complète de Swagger avec:
- Définition OpenAPI 3.0.0
- Schémas réutilisables (User, ErrorResponse, SuccessResponse)
- Schémas de sécurité (Bearer JWT + Cookies)
- Serveurs (localhost:3000 et :3001)

### 2. `src/routes/auth/user.routes.js` ✅
Annotations JSDoc complètes pour **tous les endpoints**:
- POST /register
- POST /login
- POST /verify-email
- POST /forgot-password
- POST /update-password
- POST /logout
- POST /updateProfile
- POST /2fa/setup
- POST /2fa/verify
- GET /
- GET /refresh
- GET /:id
- GET /revokeSection/:sessionId
- GET /revokeAllSection/
- GET /profileUser
- GET /getAllSection/
- GET /reset-password/:token

### 3. `src/routes/auth/oauth.routes.js` ✅
Annotations JSDoc pour les routes OAuth:
- GET /auth/google/redirect
- GET /auth/google/callback

### 4. `src/index.js` ✅
Intégration de Swagger UI Express:
```javascript
import swaggerUi from 'swagger-ui-express';
import { specs } from "#lib/swagger";

// Documentation Swagger disponible à /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
```

---

## 🎨 Structure des Annotations Swagger

### Format Standard pour chaque Endpoint

```javascript
/**
 * @swagger
 * /endpoint:
 *   post:
 *     tags:
 *       - Catégorie
 *     summary: Titre court
 *     description: Description détaillée
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field1
 *             properties:
 *               field1: { type: string, example: "value" }
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *       400:
 *         description: Erreur
 */
router.post("/endpoint", controller);
```

---

## 🔐 Sécurité dans Swagger

### Avec Bearer JWT
```javascript
/**
 * @swagger
 * /protected-route:
 *   get:
 *     security:
 *       - bearerAuth: []
 */
```

### Avec Cookies
```javascript
/**
 * @swagger
 * /protected-route:
 *   get:
 *     security:
 *       - cookieAuth: []
 */
```

### Avec les Deux
```javascript
/**
 * @swagger
 * /protected-route:
 *   get:
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 */
```

---

## 📊 Schémas Réutilisables

Dans `swagger.js`, les schémas définis:

### User Schema
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstname": "Jean",
  "lastname": "Dupont",
  "avatarUrl": null,
  "twoFactorEnable": false,
  "twoFactorSecret": null,
  "createdAt": "2026-01-23T10:00:00Z",
  "updatedAt": "2026-01-23T10:00:00Z"
}
```

### Référencer dans une Route
```javascript
/**
 * @swagger
 * /user:
 *   get:
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
```

---

## 🏷️ Tags Utilisés

| Tag | Endpoints |
|-----|-----------|
| Authentification | /register, /login, /logout, /refresh, /2fa/verify |
| Récupération de mot de passe | /forgot-password, /update-password, /reset-password/:token |
| Profil Utilisateur | /profileUser, /updateProfile |
| Utilisateurs | /, /:id |
| Sessions | /getAllSection/, /revokeSection/:sessionId, /revokeAllSection/ |
| Authentification à Deux Facteurs (2FA) | /2fa/setup, /2fa/verify |
| OAuth - Google | /auth/google/redirect, /auth/google/callback |

---

## 🧪 Tester dans Swagger UI

### Étape 1: Accéder à Swagger
```
http://localhost:3000/api-docs
```

### Étape 2: Enregistrer un Utilisateur
1. Cliquer sur POST /register
2. Cliquer sur "Try it out"
3. Entrer les données:
```json
{
  "email": "test@example.com",
  "password": "TestPass123",
  "firstname": "Test",
  "lastname": "User"
}
```
4. Cliquer "Execute"

### Étape 3: Vérifier l'Email
1. Cliquer sur POST /verify-email
2. Entrer le code reçu par email
3. Cliquer "Execute"

### Étape 4: Se Connecter
1. Cliquer sur POST /login
2. Entrer email et password
3. Copier le `accessToken` retourné
4. Cliquer sur le cadenas ðŸ"' en haut à droite
5. Entrer `Bearer {accessToken}`
6. Cliquer "Authorize"

### Étape 5: Accéder aux Routes Protégées
Maintenant vous pouvez tester les routes protégées comme:
- GET /profileUser
- POST /updateProfile
- POST /2fa/setup

---

## 🔄 Mise à Jour de la Documentation

Chaque fois que vous **ajoutez une nouvelle route**:

1. **Ajouter l'annotation Swagger** dans le fichier de route
2. **Redémarrer le serveur** (`npm run dev`)
3. **Rafraîchir** http://localhost:3000/api-docs

Les changements sont **auto-générés** grâce à `swagger-jsdoc`!

---

## 📝 Template pour Nouvelle Route

Copier-coller ce template pour chaque nouvelle route:

```javascript
/**
 * @swagger
 * /new-endpoint:
 *   post:
 *     tags:
 *       - Catégorie
 *     summary: Résumé court
 *     description: Description détaillée de ce que fait cette route
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field1
 *             properties:
 *               field1:
 *                 type: string
 *                 example: "Example value"
 *               field2:
 *                 type: integer
 *                 example: 123
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Non authentifié
 */
router.post("/new-endpoint", AuthMiddleware.isAuth, asyncHandler(Controller.method));
```

---

## 🚀 Avantages de cette Documentation

✅ **Auto-générée** - JSDoc → Swagger automatiquement  
✅ **Interactive** - Tester directement depuis Swagger UI  
✅ **Maintenable** - Un seul endroit pour documenter  
✅ **Professionnelle** - Format OpenAPI standard  
✅ **Accessible** - Consultable sur http://localhost:3000/api-docs  
✅ **Intégrée** - Pas de fichiers séparés à maintenir  

---

## 🔗 Ressources

- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.3)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)

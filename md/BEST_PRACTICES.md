# ✅ Bonnes Pratiques & Recommandations - Nexus API

## 📚 Table des Matières
1. [Sécurité](#sécurité)
2. [Performance](#performance)
3. [Code Quality](#code-quality)
4. [API Design](#api-design)
5. [Maintenance](#maintenance)
6. [Déploiement](#déploiement)

---

## 🔐 Sécurité

### ✅ À FAIRE

#### 1. Valider Tous les Inputs
```javascript
// BON ✅
import { validateData } from "#lib/validate";
import { registerSchema } from "#schemas/auth/register.schema";

const validatedData = validateData(registerSchema, req.body);
```

#### 2. Utiliser des Tokens JWT avec Expiration
```javascript
// BON ✅
const accessToken = await signToken(
  { sub: userId, isFullAuth: true }, 
  '15m'  // 15 minutes
);
const refreshToken = await signToken(
  { sub: userId }, 
  '7d'   // 7 jours
);
```

#### 3. Stocker les Refresh Tokens en Cookies HTTP-Only
```javascript
// BON ✅
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,         // Non accessible via JavaScript
  secure: process.env.NODE_ENV === 'production',  // HTTPS only en prod
  sameSite: 'Strict',     // Prévient CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 jours
});
```

#### 4. Hash des Mots de Passe
```javascript
// BON ✅
import argon2 from 'argon2';

const hashedPassword = await argon2.hash(password);
```

#### 5. Rate Limiting sur les Routes Sensibles
```javascript
// BON ✅
router.post("/login", authLimiter, asyncHandler(UserController.login));
router.post("/2fa/verify", authLimiter, asyncHandler(OtpController.verify2FA));
```

#### 6. Valider l'Email avec Code OTP
```javascript
// BON ✅
const emailData = await OtpService.SaveOtp(user.email);
await OtpService.SendOtpEmail(user.email, emailData.codeOtp, emailData.expireTime);
```

#### 7. Implémenter 2FA
```javascript
// BON ✅
const { secret, otpauthUrl } = TwoFactorService.generateSecretKey(user.email);
await prisma.user.update({
  where: { id: userId },
  data: { twoFactorSecret: secret }
});
```

#### 8. Utiliser HTTPS en Production
```javascript
// BON ✅
const isProduction = process.env.NODE_ENV === 'production';
const secure = isProduction;  // Force HTTPS
```

### ❌ À ÉVITER

#### 1. ❌ Stocker les Tokens en LocalStorage
```javascript
// MAUVAIS ❌
localStorage.setItem('accessToken', token);  // Vulnérable XSS
```

#### 2. ❌ Exposer le Refresh Token en JSON
```javascript
// MAUVAIS ❌
res.json({
  accessToken: token,
  refreshToken: token  // Exposé au réseau
});
```

#### 3. ❌ Révéler si un Email Existe
```javascript
// MAUVAIS ❌
if (!user) {
  return res.status(404).json({ message: "Email not found" });  // Révèle existence
}
```

#### 4. ❌ Utiliser des Mots de Passe en Texte Clair
```javascript
// MAUVAIS ❌
const user = await prisma.user.findUnique({
  where: { email, password: plainPassword }  // Pas de hash!
});
```

#### 5. ❌ Trusts les Données Client Sans Validation
```javascript
// MAUVAIS ❌
const user = await prisma.user.findUnique({
  where: { id: req.body.userId }  // User peut manipuler
});
```

#### 6. ❌ Logger les Informations Sensibles
```javascript
// MAUVAIS ❌
console.log({ password, token, secret });
```

---

## ⚡ Performance

### ✅ À FAIRE

#### 1. Utiliser la Pagination
```javascript
// BON ✅
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  
  const users = await prisma.user.findMany({
    skip,
    take: limit
  });
});
```

#### 2. Utiliser le Caching
```javascript
// BON ✅
const cache = new Map();
const getCachedUser = async (id) => {
  if (cache.has(id)) return cache.get(id);
  const user = await prisma.user.findUnique({ where: { id } });
  cache.set(id, user);
  return user;
};
```

#### 3. Indexer les Champs Fréquemment Recherchés
```prisma
// schema.prisma - BON ✅
model User {
  id Int @id @default(autoincrement())
  email String @unique @db.VarChar(255)  // Index unique
  createdAt DateTime @default(now())
  
  @@index([email])  // Index supplémentaire
  @@index([createdAt])
}
```

#### 4. Utiliser la Projection pour ne Retourner que les Champs Nécessaires
```javascript
// BON ✅
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    firstname: true,
    lastname: true
    // twoFactorSecret: false  // Ne pas exposer
  }
});
```

### ❌ À ÉVITER

#### 1. ❌ N+1 Queries
```javascript
// MAUVAIS ❌
const users = await prisma.user.findMany();
for (const user of users) {
  user.sessions = await prisma.session.findMany({ where: { userId: user.id } });
  // Une query par utilisateur!
}
```

#### 2. ❌ Retourner Toutes les Données
```javascript
// MAUVAIS ❌
const user = await prisma.user.findUnique({ where: { id } });
res.json(user);  // Inclut twoFactorSecret!
```

---

## 🎯 Code Quality

### ✅ À FAIRE

#### 1. Utiliser async/await avec try/catch
```javascript
// BON ✅
static async register(req, res) {
  try {
    const validatedData = validateData(registerSchema, req.body);
    const user = await UserService.register(validatedData);
    return res.status(201).json({ success: true, user });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
}
```

#### 2. Utiliser des Classes pour l'Organisation
```javascript
// BON ✅
export class UserController {
  static async register(req, res) { }
  static async login(req, res) { }
  static async logout(req, res) { }
}

export class UserService {
  static async register(data) { }
  static async login(email, password) { }
}
```

#### 3. Utiliser le Pattern DTO pour les Réponses
```javascript
// BON ✅
export class UserDto {
  static transform(user) {
    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname
      // twoFactorSecret omis
    };
  }
}
```

#### 4. Documenter le Code avec JSDoc
```javascript
// BON ✅
/**
 * Authentifie un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe en texte clair
 * @param {Object} meta - Métadonnées (userAgent, ipAddress)
 * @returns {Promise<Object>} Tokens ou MFA token
 */
static async login(email, password, meta) { }
```

#### 5. Utiliser des Constantes
```javascript
// BON ✅
const TOKEN_EXPIRY = {
  ACCESS: '15m',
  REFRESH: '7d',
  MFA: '10m'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500
};
```

### ❌ À ÉVITER

#### 1. ❌ Code Dupliqué
```javascript
// MAUVAIS ❌
// Dans user.controller.js
const user = await UserService.register(data);
// Dans oauth.controller.js
const user = await UserService.register(data);
```

#### 2. ❌ Fonctions Trop Longues
```javascript
// MAUVAIS ❌
static async register(req, res) {
  // 200 lignes de code...
}
```

#### 3. ❌ Pas de Gestion d'Erreurs
```javascript
// MAUVAIS ❌
static async register(req, res) {
  const user = await UserService.register(req.body);
  res.json(user);  // Pas de try/catch!
}
```

#### 4. ❌ Magic Strings
```javascript
// MAUVAIS ❌
if (result.type === 'mfa') {  // Magic string
  // ...
}
```

---

## 🏗️ API Design

### ✅ À FAIRE

#### 1. Utiliser des Codes HTTP Appropriés
```javascript
// BON ✅
res.status(201).json(user);        // 201 Created
res.status(400).json(error);        // 400 Bad Request
res.status(401).json({ msg: '...' });  // 401 Unauthorized
res.status(404).json({ msg: '...' });  // 404 Not Found
res.status(429).json({ msg: '...' });  // 429 Too Many Requests
res.status(500).json(error);        // 500 Server Error
```

#### 2. Format de Réponse Cohérent
```javascript
// BON ✅
// Succès
{ success: true, message: "...", data: { ... } }

// Erreur
{ success: false, message: "...", response: "..." }
```

#### 3. Utiliser les Méthodes HTTP Correctement
```javascript
// BON ✅
POST /register     // Créer une ressource
POST /login        // Action (pas GET!)
GET /profileUser   // Récupérer une ressource
POST /updateProfile // Modifier une ressource
DELETE /sessions    // Supprimer des sessions
GET /refresh       // Obtenir une nouvelle ressource
```

#### 4. Nommer les Routes Clairement
```javascript
// BON ✅
POST /register
POST /login
POST /logout
GET /profileUser
POST /updateProfile
POST /forgot-password
POST /update-password
GET /reset-password/:token
POST /2fa/setup
POST /2fa/verify
GET /getAllSection/
GET /revokeSection/:sessionId
```

### ❌ À ÉVITER

#### 1. ❌ Utiliser GET pour des Actions
```javascript
// MAUVAIS ❌
GET /login        // Doit être POST
GET /logout       // Doit être POST
GET /deleteUser   // Doit être DELETE
```

#### 2. ❌ Mélanger les Formats de Réponse
```javascript
// MAUVAIS ❌
// Une route retourne
{ data: { ... } }

// Une autre retourne
{ response: { ... } }

// Une autre retourne
{ ... }  // Sans enveloppe
```

#### 3. ❌ Routes Non Descriptives
```javascript
// MAUVAIS ❌
GET /api/user/1    // Ambigu
POST /api/process  // Pas clair
GET /getData       // Trop générique
```

---

## 🔧 Maintenance

### ✅ À FAIRE

#### 1. Versionner l'API
```javascript
// BON ✅
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", oauthRouter);
// Plus tard:
app.use("/api/v2/users", userRouterV2);
```

#### 2. Logger les Erreurs
```javascript
// BON ✅
import { logger } from "#lib/logger";

logger.error("Erreur lors du login:", error);
logger.info(`Utilisateur ${userId} connecté`);
```

#### 3. Utiliser les Variables d'Environnement
```javascript
// BON ✅
const JWT_SECRET = process.env.JWT_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3000;
```

#### 4. Écrire des Tests
```javascript
// BON ✅
describe("UserController", () => {
  it("should register a new user", async () => {
    const response = await request(app)
      .post("/register")
      .send({ email: "test@example.com", password: "Pass123" });
    expect(response.status).toBe(201);
  });
});
```

### ❌ À ÉVITER

#### 1. ❌ Secrets en Texte Clair dans le Code
```javascript
// MAUVAIS ❌
const JWT_SECRET = "933fb70f2ab2bbd71789373e2d27a763...";
```

#### 2. ❌ Pas de Logging
```javascript
// MAUVAIS ❌
try {
  // code
} catch (error) {
  // Silencieusement ignoré!
}
```

#### 3. ❌ Pas de Tests
```javascript
// MAUVAIS ❌
// Aucun test, déployer directement en production
```

---

## 🚀 Déploiement

### Checklist Avant Déploiement

- [ ] **Sécurité**
  - [ ] HTTPS activé
  - [ ] CORS configuré correctement
  - [ ] Helmet.js activé
  - [ ] Secrets en variables d'environnement
  - [ ] Rate limiting activé
  - [ ] Validation des inputs

- [ ] **Performance**
  - [ ] Base de données indexée
  - [ ] Caching configuré
  - [ ] Pagination implémentée
  - [ ] Queries optimisées (pas de N+1)

- [ ] **Monitoring**
  - [ ] Logging en place
  - [ ] Error tracking (Sentry)
  - [ ] Uptime monitoring
  - [ ] Alertes configurées

- [ ] **Documentation**
  - [ ] Swagger à jour
  - [ ] README complet
  - [ ] Variables d'environnement documentées
  - [ ] API endpoints documentés

- [ ] **Tests**
  - [ ] Tests unitaires écrits
  - [ ] Tests d'intégration réussis
  - [ ] Coverage > 80%

- [ ] **Migrations**
  - [ ] Migrations Prisma testées
  - [ ] Scripts de rollback préparés
  - [ ] Backup base de données

### Variables d'Environnement Essentielles

```env
# Application
NODE_ENV=production
PORT=3000

# Base de Données
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=<long-random-secret-key>

# Email
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=username
EMAIL_PASSWORD=password

# OAuth
GOOGLE_ID_CLIENT=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback

# Frontend
FRONTEND_URL=https://yourdomain.com
```

---

## 📊 Métriques à Monitorer

- Temps de réponse moyen
- Taux d'erreur (5xx)
- Taux d'utilisation CPU/Mémoire
- Latence base de données
- Nombre de requêtes par seconde
- Taux d'authentification réussis/échoués

---

## 🔗 Ressources Utiles

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [REST API Best Practices](https://restfulapi.net/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)


# 📚 Nexus API - Documentation Complète

## 🚀 Démarrage Rapide

### Accéder à la Documentation Swagger
Une fois le serveur lancé, accédez à:
```
http://localhost:3000/api-docs
```

### Lancer le serveur
```bash
npm run dev
```

---

## 📊 Structure de l'API

### Authentification & Sécurité

#### 🔐 **Mécanisme de Tokens**

1. **JWT Access Token**
   - Validité: 15 minutes
   - Endroit: Header `Authorization: Bearer {token}`
   - Usage: Authentifier les requêtes protégées

2. **JWT Refresh Token**
   - Validité: 7 jours
   - Endroit: Cookie HTTP-Only (sécurisé)
   - Usage: Générer un nouvel Access Token

3. **MFA Token** (temporaire)
   - Utilisé lors du login si 2FA est activé
   - Échangé contre un Access Token après validation du code 2FA

---

## 🔑 Endpoints Principaux

### 1️⃣ **Authentification Basique**

#### Inscription
```
POST /register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstname": "Jean",
  "lastname": "Dupont",
  "avatarUrl": null
}
```

**Validation du mot de passe:**
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre

**Réponse (201):**
```json
{
  "success": true,
  "response": "Inscription éffectué avec succes",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstname": "Jean",
    "lastname": "Dupont"
  }
}
```

#### Connexion
```
POST /login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Réponse Sans 2FA (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Réponse Avec 2FA (200):**
```json
{
  "success": true,
  "requires2FA": true,
  "mfaToken": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Veuillez entrer votre code de sécurité"
}
```

#### Vérification Email
```
POST /verify-email
```
**Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

#### Logout
```
POST /logout
```
**Headers:**
```
Authorization: Bearer {accessToken}
Cookie: refreshToken={refreshToken}
```

---

### 2️⃣ **Authentification à Deux Facteurs (2FA)**

#### Configurer 2FA
```
POST /2fa/setup
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

**Réponse:**
```json
{
  "success": true,
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "otpauthUrl": "otpauth://totp/Nexus:user@example.com?secret=JBSWY3DPEBLW64TMMQ======&issuer=Nexus"
}
```

**Étapes côté Frontend:**
1. Afficher le QR Code généré à partir de `otpauthUrl`
2. L'utilisateur scanne avec Google Authenticator, Authy, etc.
3. L'utilisateur envoie le code à `/2fa/verify`

#### Vérifier Code 2FA
```
POST /2fa/verify
```
**Body (après login):**
```json
{
  "code": "123456",
  "mfaToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Body (activation après setup):**
```json
{
  "code": "123456"
}
```

**Headers (activation):**
```
Authorization: Bearer {accessToken}
```

---

### 3️⃣ **Récupération de Mot de Passe**

#### Demander Reset
```
POST /forgot-password
```
**Body:**
```json
{
  "email": "user@example.com"
}
```

**Sécurité:** La réponse est identique même si l'email n'existe pas.

#### Vérifier Token Reset
```
GET /reset-password/{token}
```

#### Mettre à Jour Mot de Passe
```
POST /update-password
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "NewSecurePass123"
}
```

---

### 4️⃣ **Gestion du Profil Utilisateur**

#### Récupérer Profil
```
GET /profileUser
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

#### Mettre à Jour Profil
```
POST /updateProfile
```
**Headers:**
```
Authorization: Bearer {accessToken}
```
**Body:**
```json
{
  "firstname": "Jean",
  "lastname": "Dupont",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

#### Récupérer Utilisateur par ID
```
GET /{id}
```

#### Récupérer Tous les Utilisateurs
```
GET /
```

---

### 5️⃣ **Gestion des Sessions**

#### Rafraîchir Access Token
```
GET /refresh
```
**Headers:**
```
Authorization: Bearer {accessToken}
Cookie: refreshToken={refreshToken}
```

**Réponse:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Récupérer Toutes les Sessions
```
GET /getAllSection/
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

#### Révoquer Session Spécifique
```
GET /revokeSection/{sessionId}
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

#### Révoquer Toutes les Sessions
```
GET /revokeAllSection/
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

---

### 6️⃣ **OAuth Google**

#### Redirection vers Google
```
GET /auth/google/redirect
```
Redirige vers le consentement Google.

#### Callback Google
```
GET /auth/google/callback?code=...&state=...
```
Traité automatiquement par le serveur.

---

## 🛡️ Sécurité

### Rate Limiting
- **Login:** 5 tentatives par 15 minutes par IP
- **2FA Verify:** 5 tentatives par 15 minutes par IP
- **Register:** 5 tentatives par 15 minutes par IP

### Protocoles de Sécurité
- ✅ Tokens JWT avec signature
- ✅ Refresh Token rotation
- ✅ Cookies HTTP-Only pour les refresh tokens
- ✅ CORS configuré
- ✅ Helmet.js pour les headers de sécurité
- ✅ Hash des mots de passe avec Argon2
- ✅ Validation Zod sur tous les inputs

---

## 📋 Codes d'Erreur Courants

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Non trouvé |
| 429 | Trop de tentatives |
| 500 | Erreur serveur |

---

## 🔄 Flux d'Authentification Complet

### Sans 2FA
```
1. POST /login (email + password)
   ↓
2. Retour: accessToken + refreshToken
   ↓
3. Utiliser accessToken pour les requêtes protégées
   ↓
4. Si accessToken expiré: GET /refresh
   ↓
5. POST /logout pour déconnexion
```

### Avec 2FA
```
1. POST /login (email + password)
   ↓
2. Retour: requires2FA + mfaToken
   ↓
3. POST /2fa/verify (code + mfaToken)
   ↓
4. Retour: accessToken
   ↓
5. Utiliser comme sans 2FA
```

---

## 🐛 Dépannage

### Token Invalide
**Problème:** `Token invalide ou expiré`

**Solution:**
1. Vérifier que le token est dans le header Authorization
2. Format: `Authorization: Bearer {token}`
3. Le token a expiré? Utiliser `/refresh`

### Session Expirée
**Problème:** `Session expirée`

**Solution:**
1. Refresh token expiré (7 jours)
2. Rediriger l'utilisateur vers `/login`

### Rate Limit Atteint
**Problème:** `Trop de tentatives. Réessayez dans 15 minutes.`

**Solution:**
1. Attendre 15 minutes
2. Ou utiliser une autre adresse IP (développement seulement)

---

## 📦 Dépendances Principales

- `express` - Framework web
- `jose` - JWT
- `@prisma/client` - ORM
- `argon2` - Hash des mots de passe
- `swagger-jsdoc` + `swagger-ui-express` - Documentation
- `express-rate-limit` - Rate limiting
- `zod` - Validation des données
- `nodemailer` - Envoi d'emails
- `otplib` - Gestion des OTP/2FA

---

## 🎯 Points Importants

1. **Jamais** exposer les tokens refresh en JSON - toujours en cookies HTTP-Only
2. **Toujours** valider les inputs avec Zod
3. **Utiliser** asyncHandler pour gérer les erreurs asynchrones
4. **Appliquer** le rate limiting sur les routes sensibles
5. **Enregistrer** les sessions dans la base de données
6. **Nettoyer** les tokens OTP expirés régulièrement

---

## 📞 Support

Pour plus d'informations, consultez la documentation Swagger interactive:
```
http://localhost:3000/api-docs
```

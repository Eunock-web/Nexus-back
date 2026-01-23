# 🎯 Plan de Test - GitHub OAuth

## ✅ Pré-requis Vérifiés

- [x] Service OAuth GitHub implémenté (`src/services/OAuth/auth.service.js`)
- [x] Contrôleur GitHub OAuth implémenté (`src/controllers/OAuth/auth.controller.js`)
- [x] Routes GitHub OAuth ajoutées (`src/routes/auth/oauth.routes.js`)
- [x] Variables d'env configurées (`.env`)
- [x] Documentation complète créée

---

## 🚀 Étapes de Test

### 1️⃣ Démarrer le Serveur

```bash
cd /home/light/Documents/Projets/Nexus-back
npm run dev
```

**Attendu:**
```
✓ Serveur démarré sur http://localhost:3000
✓ 📚 Documentation Swagger disponible sur http://localhost:3000/api-docs
```

---

### 2️⃣ Vérifier que les Routes Existent

**Option A: Via Curl**
```bash
# Vérifier le redirect
curl -I http://localhost:3000/auth/github/redirect
# Attendu: 302 ou 200

# Vérifier la Swagger
curl http://localhost:3000/api-docs | head -20
# Attendu: HTML contenant Swagger
```

**Option B: Via Navigateur**
```
http://localhost:3000/api-docs
```

Cherchez les routes dans la section **"OAuth - GitHub"**

---

### 3️⃣ Tester le Flux Complet

#### A. Démarrer l'Authentification
```bash
# Dans un navigateur, ouvrez:
http://localhost:3000/auth/github/redirect
```

**Attendu:**
- Redirection 302 vers GitHub
- Affichage de l'écran de consentement GitHub

#### B. Approuver sur GitHub
```
1. Cliquer "Authorize" sur l'écran GitHub
2. GitHub vous redirige vers le callback
```

**Attendu:**
- Réponse JSON avec les tokens
- Structure:
```json
{
  "success": true,
  "message": "Authentification réussie via GitHub",
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": 1,
    "email": "your@github.com",
    "firstname": "...",
    "lastname": "...",
    "avatarUrl": "...",
    "isVerified": true
  }
}
```

#### C. Utiliser le Token

```bash
# Copier l'accessToken et tester:
TOKEN="<votre_access_token>"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/profileUser
```

**Attendu:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "your@github.com",
    ...
  }
}
```

---

## 🧪 Cas de Test Détaillés

### Test 1: Health Check
```bash
curl http://localhost:3000
```
✅ Devrait retourner: `{ success: true, message: "API Express opérationnelle" }`

---

### Test 2: Route Redirect Existe
```bash
curl -I http://localhost:3000/auth/github/redirect
```
✅ Devrait retourner: Code HTTP 302 ou 200

---

### Test 3: Récupérer l'URL GitHub
```bash
# Via un client JavaScript côté serveur (test)
# Ou via la route qui génère l'URL
```
✅ Devrait retourner une URL GitHub valide contenant:
- `client_id=Ov23lizLxQ2GDSK3HEN1`
- `redirect_uri=http://localhost:3000/auth/github/callback`
- `scope=user:email`

---

### Test 4: Swagger Accessible
```bash
open http://localhost:3000/api-docs
```
✅ Devrait voir:
- Section "OAuth - GitHub"
- Routes `/auth/github/redirect` et `/auth/github/callback`
- Paramètres documentés

---

### Test 5: Profil Après Authentification
```bash
# Après avoir obtenu un token
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/profileUser
```
✅ Devrait retourner vos infos GitHub

---

### Test 6: Mise à Jour Profil
```bash
TOKEN="<votre_token>"

curl -X POST http://localhost:3000/updateProfile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Nouveau",
    "lastname": "Nom"
  }'
```
✅ Devrait retourner: `{ success: true, response: "Profile mis a jour..." }`

---

### Test 7: Logout
```bash
TOKEN="<votre_token>"

curl -X POST http://localhost:3000/logout \
  -H "Authorization: Bearer $TOKEN"
```
✅ Devrait retourner: `{ success: true, response: "Deconnexion réussie" }`

---

### Test 8: Token Expiré
```bash
# Attendre 15+ minutes OU modifier le token

curl -H "Authorization: Bearer <token_expiré>" \
  http://localhost:3000/profileUser
```
✅ Devrait retourner: Erreur 401 non authentifié

---

### Test 9: Refresh Token
```bash
curl -X GET http://localhost:3000/refresh \
  -H "Authorization: Bearer <access_token>" \
  -b "refreshToken=<refresh_token>"
```
✅ Devrait retourner: Nouvel `accessToken`

---

## 📊 Cas d'Erreur à Tester

### Erreur 1: Code Manquant
```bash
curl http://localhost:3000/auth/github/callback
```
✅ Devrait retourner: 400 Bad Request

---

### Erreur 2: Token Invalide
```bash
curl -H "Authorization: Bearer invalid" \
  http://localhost:3000/profileUser
```
✅ Devrait retourner: 401 Unauthorized

---

### Erreur 3: Route Non Existante
```bash
curl http://localhost:3000/not-exist
```
✅ Devrait retourner: 404 Not Found

---

## 🔍 Vérifications Additionnelles

### Base de Données
```bash
# Vérifier qu'un utilisateur a été créé
npm run db:studio

# Cherchez:
# 1. Table "User" → nouvel enregistrement
# 2. Table "OAuth" → lien google + github
# 3. Table "Session" → nouvelle session
```

---

### Logs du Serveur
```bash
# Pendant npm run dev, vérifiez:
# ✓ Logs d'authentification
# ✓ Logs de création d'utilisateur
# ✓ Pas d'erreurs
```

---

### Cookies
```bash
# Après authentification, vérifier le cookie refreshToken:
# Cookies → refreshToken (httpOnly)
```

---

## 📋 Checklist Finale

- [ ] Serveur démarre sans erreur
- [ ] Routes `/auth/github/*` accessibles
- [ ] Swagger affiche les routes GitHub
- [ ] Redirection vers GitHub fonctionne
- [ ] Callback traite le code correctement
- [ ] Utilisateur créé en BDD
- [ ] Tokens retournés correctement
- [ ] Token fonctionne sur /profileUser
- [ ] Logout fonctionne
- [ ] Refresh token fonctionne
- [ ] Erreurs gérées correctement

---

## 🚨 Problèmes Courants

| Problème | Cause | Solution |
|----------|-------|----------|
| "GITHUB_ID_CLIENT undefined" | `.env` non chargé | Redémarrer: `npm run dev` |
| 302 infini sur /redirect | URI incorrecte | Vérifier `GITHUB_REDIRECT_URI` |
| "Email not found" | Email GitHub privé | Rendre public dans GitHub Settings |
| 401 sur /profileUser | Token expiré | Utiliser /refresh pour nouvel token |
| CORS error | Frontend sur autre domaine | À configurer en `.env` ou dans CORS |

Voir **GITHUB_OAUTH_SETUP.md** pour dépannage complet.

---

## 📞 Support Rapide

- 📖 Documentation: **GITHUB_OAUTH_SETUP.md**
- 📝 Exemples: **GITHUB_OAUTH_EXAMPLES.md**
- 🚀 Quick Start: **QUICK_START.md**
- ⚠️ URI Config: **GITHUB_URI_CONFIGURATION.md**
- 📊 Résumé: **IMPLEMENTATION_SUMMARY.md**

---

## ✅ Une Fois Tous les Tests Passés

1. **Pour le Frontend:**
   - Créer un bouton "Login with GitHub"
   - Pointer vers `http://localhost:3000/auth/github/redirect`
   - Stocker les tokens reçus
   - Utiliser `accessToken` pour les API calls

2. **Pour la Production:**
   - Changer `GITHUB_REDIRECT_URI` vers le domaine réel
   - Mettre à jour GitHub App Settings
   - Utiliser HTTPS obligatoirement
   - Configurer les variables d'env en production

3. **Prochaines Étapes:**
   - Ajouter d'autres OAuth (Facebook, etc.)
   - Implémenter merge de comptes
   - Ajouter deux-facteur
   - Logging des authentifications

---

**Créé:** 23 janvier 2026  
**Dernière mise à jour:** 23 janvier 2026  
**Statut:** ✅ Prêt pour test complet

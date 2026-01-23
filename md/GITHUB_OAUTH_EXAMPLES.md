# Exemples CURL - GitHub OAuth

## 📝 Redirection vers GitHub

### Démarrer l'authentification GitHub
```bash
curl -i http://localhost:3000/auth/github/redirect
```

**Réponse:** Redirection 302 vers GitHub

---

## 🔄 Callback GitHub

### Simuler le callback (en production, GitHub le fait automatiquement)
```bash
# Note: Remplacez <authorization_code> par un code réel reçu de GitHub
curl -X GET "http://localhost:3000/auth/github/callback?code=<authorization_code>"
```

**Réponse Succès (200):**
```json
{
  "success": true,
  "message": "Authentification réussie via GitHub",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@github.com",
    "firstname": "Jean",
    "lastname": "Dupont",
    "avatarUrl": "https://avatars.githubusercontent.com/u/12345?v=4",
    "twoFactorEnable": false,
    "isVerified": true,
    "createdAt": "2026-01-23T12:30:00Z"
  }
}
```

---

## 👤 Récupérer le Profil Utilisateur

### Après authentification, récupérer vos infos
```bash
curl -X GET http://localhost:3000/profileUser \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json"
```

**Réponse (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@github.com",
    "firstname": "Jean",
    "lastname": "Dupont",
    "avatarUrl": "https://avatars.githubusercontent.com/u/12345?v=4",
    "twoFactorEnable": false,
    "isVerified": true,
    "createdAt": "2026-01-23T12:30:00Z"
  }
}
```

---

## 🔄 Rafraîchir le Token

### Générer un nouvel accessToken
```bash
curl -X GET http://localhost:3000/refresh \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -b "refreshToken=<your_refresh_token>"
```

**Réponse (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🚪 Déconnexion

### Logout et révocation de la session
```bash
curl -X POST http://localhost:3000/logout \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -b "refreshToken=<your_refresh_token>"
```

**Réponse (200):**
```json
{
  "success": true,
  "response": "Deconnexion réussie"
}
```

---

## 📊 Récupérer toutes les Sessions Actives

### Voir toutes vos sessions connectées
```bash
curl -X GET http://localhost:3000/getAllSection \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json"
```

**Réponse (200):**
```json
{
  "success": true,
  "response": [
    {
      "id": 1,
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-01-23T12:30:00Z"
    },
    {
      "id": 2,
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)...",
      "ipAddress": "192.168.1.100",
      "createdAt": "2026-01-23T13:45:00Z"
    }
  ]
}
```

---

## 🔐 Révoquer une Session Spécifique

### Déconnecter une session (ex: autre appareil)
```bash
curl -X GET http://localhost:3000/revokeSection/2 \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json"
```

**Réponse (200):**
```json
{
  "success": true,
  "response": "Session spécifique supprimée avec succès"
}
```

---

## 🔐 Révoquer Toutes les Sessions

### Déconnecter toutes les autres sessions
```bash
curl -X GET http://localhost:3000/revokeAllSection \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json"
```

**Réponse (200):**
```json
{
  "success": true,
  "response": "Toutes les sessions ont été révoquées"
}
```

---

## ✏️ Mettre à Jour le Profil

### Modifier vos infos de profil
```bash
curl -X POST http://localhost:3000/updateProfile \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Jean",
    "lastname": "Martin",
    "email": "jean.martin@example.com",
    "avatarUrl": "https://example.com/avatar.jpg"
  }'
```

**Réponse (200):**
```json
{
  "success": true,
  "response": "Profile mis a jour avec success"
}
```

---

## 🔗 Flux Complet de Test - Register + Login GitHub

### Scénario: Un nouvel utilisateur se connecte avec GitHub

1. **Redirection vers GitHub:**
   ```bash
   curl -i http://localhost:3000/auth/github/redirect
   ```
   → Redirection 302 vers GitHub

2. **Utilisateur approuve l'accès sur GitHub**
   → GitHub redirige vers callback avec code

3. **Backend traite le callback:**
   ```bash
   # (Fait automatiquement par le navigateur)
   curl -X GET "http://localhost:3000/auth/github/callback?code=<code_from_github>"
   ```
   → JSON avec tokens et utilisateur créé

4. **Frontend stocke le token et utilise l'API:**
   ```bash
   curl -X GET http://localhost:3000/profileUser \
     -H "Authorization: Bearer <access_token>"
   ```

---

## ⚠️ Notes Importantes

- Remplacez `<your_access_token>` par votre token JWT réel
- Remplacez `<your_refresh_token>` par votre refresh token réel
- Le `refreshToken` est généralement stocké dans les cookies (httpOnly)
- Les tests manuels nécessitent de passer par le flow complet GitHub

---

## 🧪 Test avec Postman

Vous pouvez aussi tester avec Postman :

1. **Create a new request:**
   - Method: GET
   - URL: `http://localhost:3000/auth/github/redirect`

2. **In Authorization tab:**
   - Type: Bearer Token
   - Token: `<your_access_token>`

3. **In Headers:**
   - Content-Type: application/json

4. **Send and check the response**

---

**Dernière mise à jour:** 23 janvier 2026

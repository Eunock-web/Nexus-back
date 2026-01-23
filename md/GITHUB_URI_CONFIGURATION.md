# ⚠️ Important - URI de Redirection GitHub

## Vérifier la Configuration

Votre `.env` actuellement:
```env
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
```

Votre route actuellement:
```javascript
// src/routes/auth/oauth.routes.js
// Cette route est sous le routeur "/auth"
// Donc l'URL complète est: /auth + /auth/github/callback
// Ce qui donne: http://localhost:3000/auth/auth/github/callback ❌
```

---

## 🔧 Solutions

### Option 1: Corriger l'URI dans `.env` (Recommandé)

Changez le `.env`:
```env
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
```

✅ Cela correspond exactement à votre route

---

### Option 2: Corriger le routing dans `index.js`

Si vous préférez garder `/api/auth/`:

Modifiez `src/index.js`:
```javascript
// Avant:
app.use("/auth", oauthRouter);

// Après:
app.use("/api/auth", oauthRouter);
```

Et gardez le `.env`:
```env
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
```

---

## ✅ Quelle Option Choisir ?

### Option 1: `/auth/github/callback` (Actuellement Implémenté)
**Avantages:**
- Plus court et lisible
- Moins de niveaux de routing
- Standard dans la plupart des frameworks

**À faire:**
1. Modifier `.env`:
   ```env
   GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
   ```
2. Redémarrer le serveur

### Option 2: `/api/auth/github/callback` (Versioning API)
**Avantages:**
- Permet le versioning (`/api/v1/`, `/api/v2/`)
- Sépare l'API des autres routes
- Professionnel

**À faire:**
1. Modifier `src/index.js`
2. Laisser le `.env` tel quel

---

## 🧪 Vérifier la Configuration

### Via cURL
```bash
# Voir si la route existe
curl -v http://localhost:3000/auth/github/redirect

# Ou
curl -v http://localhost:3000/api/auth/github/redirect
```

### Via Swagger
1. Ouvrez `http://localhost:3000/api-docs`
2. Cherchez la section "OAuth - GitHub"
3. Vérifiez les chemins des routes

### Dans les Logs
Quand vous démarrez le serveur avec `npm run dev`, vérifiez les routes affichées.

---

## ⚠️ Important pour GitHub Settings

Peu importe votre choix, vous DEVEZ mettre à jour les **GitHub App Settings**:

1. Allez sur https://github.com/settings/developers
2. Cliquez sur votre application GitHub OAuth
3. Trouvez "Authorization callback URL"
4. Mettez: 
   - Soit `http://localhost:3000/auth/github/callback`
   - Soit `http://localhost:3000/api/auth/github/callback`

**⚠️ L'URI doit correspondre EXACTEMENT** (protocole, domaine, port, chemin)

---

## 🚀 Mon Recommandation

Je vous recommande **Option 1** car:
1. C'est plus simple
2. Ça matche votre structure actuelle
3. C'est plus facile à documenter

### Action Requise:

Modifiez simplement votre `.env`:

```env
# Avant:
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback

# Après:
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
```

Puis redémarrez:
```bash
npm run dev
```

C'est tout! ✅

---

## 📋 Checklist Final

- [ ] Choix Option 1 ou Option 2
- [ ] Modification du `.env` OU `src/index.js`
- [ ] Redémarrage du serveur (`npm run dev`)
- [ ] Vérification via `http://localhost:3000/auth/github/redirect`
- [ ] Mise à jour GitHub App Settings (si changement)
- [ ] Test du flow complet

---

**Note:** Cette configuration doit être la même en development ET en production !

Pour production, changez:
```env
GITHUB_REDIRECT_URI=https://votredomaine.com/auth/github/callback
# ou
GITHUB_REDIRECT_URI=https://votredomaine.com/api/auth/github/callback
```

Selon votre choix.

---

Besoin d'aide? Consultez **GITHUB_OAUTH_SETUP.md** pour plus de détails !

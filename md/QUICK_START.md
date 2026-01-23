# 🚀 Guide de Démarrage Rapide - GitHub OAuth

## ✅ Prérequis

Vous avez déjà tout ce qu'il faut !

### Dépendances Nécessaires (Déjà Installées)
- ✓ `express` - Framework web
- ✓ `jose` - Pour la gestion des JWT
- ✓ `@prisma/client` - ORM base de données
- ✓ `cookie-parser` - Pour gérer les cookies

### Variables d'Environnement (Déjà Configurées)
```env
GITHUB_ID_CLIENT=Ov23lizLxQ2GDSK3HEN1
GITHUB_CLIENT_SECRET=545d27bbb6e827385675b75478da38d5d2a2219c
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
```

---

## 🔧 Installation

### 1. Vérifier que les dépendances sont installées
```bash
npm install
# ou
pnpm install
```

### 2. Appliquer les migrations Prisma
```bash
npm run db:migrate
# ou
npm run db:push
```

### 3. Démarrer le serveur
```bash
npm run dev
```

Le serveur doit démarrer sur `http://localhost:3000`

---

## 📍 Points d'Accès GitHub OAuth

Une fois le serveur démarré:

| Route | Méthode | Description |
|-------|---------|-------------|
| `/auth/github/redirect` | GET | Démarre l'authentification GitHub |
| `/auth/github/callback` | GET | Reçoit le callback de GitHub |
| `/profileUser` | GET | Récupère le profil (authentifié) |
| `/logout` | POST | Déconnecte l'utilisateur |

---

## 🧪 Test Rapide - Frontend

### 1. Lien de Connexion HTML Basique
```html
<!DOCTYPE html>
<html>
<head>
  <title>GitHub OAuth Test</title>
</head>
<body>
  <h1>Test GitHub OAuth</h1>
  
  <!-- Bouton Login GitHub -->
  <a href="http://localhost:3000/auth/github/redirect" style="padding: 10px 20px; background: black; color: white; text-decoration: none; border-radius: 5px;">
    📘 Login with GitHub
  </a>

  <hr>

  <!-- Script pour récupérer les tokens après callback -->
  <script>
    // Récupérer et afficher les infos de l'utilisateur
    async function loadProfile() {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.log('Pas de token trouvé');
        return;
      }

      const response = await fetch('http://localhost:3000/profileUser', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Profil utilisateur:', data);
      
      if (data.user) {
        document.body.innerHTML += `
          <h2>Connecté en tant que:</h2>
          <p>Email: ${data.user.email}</p>
          <p>Nom: ${data.user.firstname} ${data.user.lastname}</p>
          <img src="${data.user.avatarUrl}" style="width: 50px; border-radius: 50%;">
        `;
      }
    }

    loadProfile();
  </script>
</body>
</html>
```

### 2. Flux Complet (React)
```javascript
import { useEffect, useState } from 'react';

export function GitHubOAuthTest() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Récupérer le token depuis les paramètres URL ou localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    }
  }, []);

  const fetchProfile = async (accessToken) => {
    try {
      const response = await fetch('http://localhost:3000/profileUser', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      localStorage.removeItem('accessToken');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  return (
    <div>
      {!user ? (
        <a href="http://localhost:3000/auth/github/redirect">
          Login with GitHub
        </a>
      ) : (
        <div>
          <h2>Bienvenue {user.firstname}!</h2>
          <img src={user.avatarUrl} alt="Avatar" width="50" />
          <p>Email: {user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 Vérifier l'Intégration

### Via Swagger (Interface Visuelle)
1. Allez sur `http://localhost:3000/api-docs`
2. Cherchez les routes dans la section **"OAuth - GitHub"**
3. Cliquez sur "Try it out" pour tester

### Via cURL
```bash
# Test simple
curl http://localhost:3000/auth/github/redirect -i

# Avec token après authentification
curl -H "Authorization: Bearer <your_token>" http://localhost:3000/profileUser
```

---

## 🐛 Dépannage

### "GITHUB_ID_CLIENT is undefined"
- Vérifiez que `.env` est chargé
- Redémarrez le serveur: `npm run dev`

### "Erreur lors du callback"
- Vérifiez que `GITHUB_REDIRECT_URI` est correct dans `.env`
- Cette URI doit correspondre à celle configurée dans GitHub Settings

### "Email non trouvé"
- L'utilisateur GitHub n'a pas d'email public
- Allez dans GitHub Settings → Email → changer la visibilité à "Public"

---

## 📁 Structure Fichiers Modifiés

```
src/
├── services/OAuth/
│   └── auth.service.js         ✏️ Ajout redirectToGithub() + handleGithubAuth()
├── controllers/OAuth/
│   └── auth.controller.js      ✏️ Ajout githubRedirect() + githubCallback()
├── routes/auth/
│   └── oauth.routes.js         ✏️ Ajout routes /auth/github/*
└── services/auth/
    └── user.service.js         ✅ findOrCreateOAuthUser() existe déjà

Documentation/
├── GITHUB_OAUTH_SETUP.md       📖 Guide complet
├── GITHUB_OAUTH_EXAMPLES.md    📝 Exemples cURL
└── QUICK_START.md              🚀 Ce fichier
```

---

## 🔐 Checklist Sécurité

- [x] `GITHUB_CLIENT_SECRET` dans `.env` (pas en public)
- [x] `refreshToken` en cookie `httpOnly`
- [x] `accessToken` à courte durée (15 min)
- [x] Validation email GitHub
- [x] Liaison OAuth en base de données
- [ ] HTTPS activé en production
- [ ] CSRF protection ajoutée
- [ ] Rate limiting sur `/auth/*`

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Consultez [GITHUB_OAUTH_SETUP.md](GITHUB_OAUTH_SETUP.md) pour les détails techniques
2. Consultez [GITHUB_OAUTH_EXAMPLES.md](GITHUB_OAUTH_EXAMPLES.md) pour les exemples cURL
3. Vérifiez les logs: `npm run dev` affiche les erreurs
4. Documentation GitHub OAuth: https://docs.github.com/en/developers/apps/building-oauth-apps

---

**Créé:** 23 janvier 2026  
**Statut:** ✅ Prêt à l'emploi

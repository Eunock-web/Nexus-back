# Configuration GitHub OAuth - Register et Login

## 📋 Vue d'ensemble

Cette documentation explique comment implémenter GitHub OAuth pour l'authentification (register et login) dans votre application.

## 🔧 Configuration des Variables d'Environnement

Les identifiants GitHub sont déjà configurés dans votre `.env`:

```env
GITHUB_ID_CLIENT=Ov23lizLxQ2GDSK3HEN1
GITHUB_CLIENT_SECRET=545d27bbb6e827385675b75478da38d5d2a2219c
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
```

**Note:** Protégez bien votre `GITHUB_CLIENT_SECRET` - ne le commitez jamais en public!

## 🌐 Points d'Extrémité Disponibles

### 1. **Redirection vers GitHub** (Initier l'authentification)
```
GET /auth/github/redirect
```

**Utilisation Frontend:**
```html
<a href="http://localhost:3000/auth/github/redirect">
  Connexion avec GitHub
</a>
```

**Réponse:** Redirection (302) vers `https://github.com/login/oauth/authorize`

---

### 2. **Callback GitHub** (Traitement du code d'autorisation)
```
GET /auth/github/callback?code=<authorization_code>
```

GitHub redirige automatiquement vers cette route après que l'utilisateur a approuvé l'accès.

**Réponse Succès (200):**
```json
{
  "success": true,
  "message": "Authentification réussie via GitHub",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
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

**Erreurs Possibles:**
- `400`: Code manquant ou invalide
- `500`: Erreur lors du traitement OAuth

---

## 🔄 Flux d'Authentification GitHub

```
┌─────────────────────────────────────────────────────────────┐
│  1. Utilisateur clique "Login with GitHub"                  │
│     → Redirection vers /auth/github/redirect                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Redirection vers GitHub OAuth                            │
│     → Utilisateur approuve l'accès                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. GitHub redirige avec code d'autorisation                │
│     → vers /auth/github/callback?code=xxx                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Backend échange le code contre un access token GitHub   │
│     (appel API à github.com/login/oauth/access_token)       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Backend récupère les infos utilisateur GitHub           │
│     (appel API à api.github.com/user)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Vérifier/Créer l'utilisateur en BDD                     │
│     - Si existe: lier le compte GitHub                      │
│     - Si n'existe pas: créer + lier                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Créer la session et générer les JWT tokens              │
│     - accessToken (15 min)                                  │
│     - refreshToken (7 jours en cookie httpOnly)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  8. Retourner les tokens au frontend                        │
│     → Redirection ou JSON response                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Exemple d'Intégration Frontend (React)

```javascript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function GitHubAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Le code est traité côté serveur (redirection automatique)
      // Vous pouvez stocker l'accessToken reçu
      const response = await fetch('/auth/github/callback');
      const data = await response.json();

      if (data.success) {
        // Stocker les tokens
        localStorage.setItem('accessToken', data.accessToken);
        // refreshToken est en cookie httpOnly (sécurisé)

        // Rediriger vers le dashboard
        navigate('/dashboard');
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Authentification en cours...</div>;
}

// Bouton de login
export function LoginWithGithub() {
  return (
    <a href="http://localhost:3000/auth/github/redirect" className="btn">
      📘 Login with GitHub
    </a>
  );
}
```

---

## 🔐 Sécurité - Points Importants

✅ **Ce qui est fait:**
- ✓ `GITHUB_CLIENT_SECRET` protégé en `.env`
- ✓ `refreshToken` en cookie `httpOnly` (protégé XSS)
- ✓ `accessToken` à courte durée de vie (15 min)
- ✓ Vérification des emails GitHub (publics + privés)
- ✓ Liaison des comptes OAuth à la base de données

⚠️ **À faire côté frontend:**
- [ ] Implémenter CSRF protection
- [ ] Valider les tokens reçus
- [ ] Utiliser HTTPS en production
- [ ] Implémenter le logout (révoquer les sessions)

---

## 🐛 Dépannage

### Erreur: "Code invalide ou manquant"
- Vérifiez que le `GITHUB_ID_CLIENT` et `GITHUB_CLIENT_SECRET` sont corrects
- Assurez-vous que l'URI de redirection GitHub correspond à `GITHUB_REDIRECT_URI`

### Erreur: "Email non trouvé sur GitHub"
- L'utilisateur GitHub doit avoir un email public OU avoir donné l'accès à l'email privé
- Le backend cherche d'abord l'email public, puis les emails privés

### L'utilisateur est créé mais sans données de profil
- Les données viennent de GitHub (nom, avatar)
- L'utilisateur peut mettre à jour son profil via `/updateProfile`

---

## 📚 Fichiers Modifiés/Créés

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/services/OAuth/auth.service.js` | Modifié | Ajout de `redirectToGithub()` et `handleGithubAuth()` |
| `src/controllers/OAuth/auth.controller.js` | Modifié | Ajout de `githubRedirect()` et `githubCallback()` |
| `src/routes/auth/oauth.routes.js` | Modifié | Ajout des routes GitHub OAuth |
| `src/services/auth/user.service.js` | ✓ Existant | Méthode `findOrCreateOAuthUser()` déjà disponible |

---

## 🎯 Prochaines Étapes

1. **Tester les routes:**
   ```bash
   curl http://localhost:3000/auth/github/redirect
   ```

2. **Implémenter le logout:**
   ```javascript
   POST /logout (avec token authentifié)
   ```

3. **Ajouter la récupération du profil:**
   ```javascript
   GET /profileUser (avec Authorization Bearer token)
   ```

4. **Implémenter le rafraîchissement du token:**
   ```javascript
   GET /refresh (automatique avec cookie)
   ```

---

## 📖 Ressources Utiles

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub API - User Emails](https://docs.github.com/en/rest/users/emails?apiVersion=2022-11-28)
- [RFC 6749 - OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)

---

**Créé:** 23 janvier 2026  
**Dernière mise à jour:** 23 janvier 2026

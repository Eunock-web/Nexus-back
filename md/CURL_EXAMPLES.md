# 🧪 Exemples cURL - Tests de l'API Nexus

## 📋 Table des Matières
1. [Authentification Basique](#authentification-basique)
2. [2FA](#2fa)
3. [Gestion du Profil](#gestion-du-profil)
4. [Récupération de Mot de Passe](#récupération-de-mot-de-passe)
5. [Sessions](#sessions)
6. [OAuth Google](#oauth-google)

---

## 🔑 Authentification Basique

### 1. Inscription (Register)
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "firstname": "John",
    "lastname": "Doe",
    "avatarUrl": "https://example.com/avatar.jpg"
  }'
```

**Réponse Attendue (201):**
```json
{
  "success": true,
  "response": "Inscription éffectué avec succes",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

### 2. Vérifier Email (OTP)
```bash
curl -X POST http://localhost:3000/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "code": "123456"
  }'
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "message": "Votre compte a été validé avec succès."
}
```

### 3. Connexion (Login) - Sans 2FA
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Connexion (Login) - Avec 2FA
Si 2FA est activé:
```json
{
  "success": true,
  "requires2FA": true,
  "mfaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Veuillez entrer votre code de sécurité"
}
```

---

## 🔐 2FA - Authentification à Deux Facteurs

### 1. Configurer 2FA
```bash
curl -X POST http://localhost:3000/2fa/setup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "otpauthUrl": "otpauth://totp/Nexus:john.doe@example.com?secret=JBSWY3DPEBLW64TMMQ======&issuer=Nexus"
}
```

**Instructions pour le Frontend:**
1. Afficher le QR Code via `otpauthUrl`
2. L'utilisateur scanne avec Google Authenticator
3. Passer le secret stocké à l'étape suivante

### 2. Vérifier Code 2FA - Après Login
```bash
curl -X POST http://localhost:3000/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456",
    "mfaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "message": "Authentification réussie",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Vérifier Code 2FA - Activation
```bash
curl -X POST http://localhost:3000/2fa/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "code": "123456"
  }'
```

---

## 👤 Gestion du Profil

### 1. Récupérer Mon Profil
```bash
curl -X GET http://localhost:3000/profileUser \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "twoFactorEnable": false,
    "createdAt": "2026-01-23T10:00:00Z",
    "updatedAt": "2026-01-23T10:00:00Z"
  }
}
```

### 2. Mettre à Jour le Profil
```bash
curl -X POST http://localhost:3000/updateProfile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "firstname": "Johnny",
    "lastname": "Doe",
    "avatarUrl": "https://example.com/new-avatar.jpg"
  }'
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "response": "Profile mis a jour avec success"
}
```

### 3. Récupérer un Utilisateur par ID
```bash
curl -X GET http://localhost:3000/1
```

### 4. Récupérer Tous les Utilisateurs
```bash
curl -X GET http://localhost:3000/
```

---

## 🔄 Récupération de Mot de Passe

### 1. Demander Reset (Forgot Password)
```bash
curl -X POST http://localhost:3000/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Réponse (200) - Sécurité par obscurité:**
```json
{
  "success": true,
  "response": "Le lien de réinitialisation a été envoyé par email."
}
```

### 2. Vérifier le Token Reset
```bash
curl -X GET "http://localhost:3000/reset-password/YOUR_RESET_TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "response": "Token valide.",
  "email": "john.doe@example.com"
}
```

### 3. Mettre à Jour le Mot de Passe
```bash
curl -X POST http://localhost:3000/update-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "NewSecurePass456"
  }'
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "response": "Mot de passe mis a jour avec success"
}
```

---

## 🔐 Sessions et Tokens

### 1. Rafraîchir le Token (Refresh)
```bash
curl -X GET http://localhost:3000/refresh \
  -H "Authorization: Bearer YOUR_OLD_ACCESS_TOKEN" \
  -H "Cookie: refreshToken=YOUR_REFRESH_TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Récupérer Toutes Mes Sessions
```bash
curl -X GET http://localhost:3000/getAllSection/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "response": [
    {
      "id": 1,
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "createdAt": "2026-01-23T10:00:00Z"
    }
  ]
}
```

### 3. Révoquer Une Session Spécifique
```bash
curl -X GET http://localhost:3000/revokeSection/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "response": "Session spécifique supprimée avec succès"
}
```

### 4. Révoquer Toutes les Sessions
```bash
curl -X GET http://localhost:3000/revokeAllSection/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "response": "Toutes les sessions ont été révoquées"
}
```

### 5. Logout (Déconnexion)
```bash
curl -X POST http://localhost:3000/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Cookie: refreshToken=YOUR_REFRESH_TOKEN"
```

**Réponse Attendue (200):**
```json
{
  "success": true,
  "response": "Deconnexion réussie"
}
```

---

## 🔑 OAuth Google

### 1. Redirection vers Google
```bash
curl -X GET http://localhost:3000/auth/google/redirect
```

Cela redirige vers la page de consentement Google.

### 2. Callback (Automatique)
Google redirige automatiquement vers:
```
http://localhost:3000/auth/google/callback?code=AUTH_CODE&state=STATE
```

Le serveur traite le code et retourne:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "user@gmail.com",
    "firstname": "User"
  }
}
```

---

## 📊 Format des Erreurs

### Erreur de Validation
```json
{
  "success": false,
  "message": "Email invalide"
}
```

### Token Expiré
```json
{
  "success": false,
  "message": "Token invalide ou expiré."
}
```

### Rate Limit Atteint
```json
{
  "success": false,
  "message": "Trop de tentatives. Réessayez dans 15 minutes."
}
```

---

## 🚀 Script de Test Complet

```bash
#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

API="http://localhost:3000"
EMAIL="test$(date +%s)@example.com"
PASSWORD="TestPass123"

echo -e "${GREEN}1. Inscription...${NC}"
REGISTER=$(curl -s -X POST $API/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"firstname\":\"Test\",\"lastname\":\"User\"}")
echo $REGISTER

echo -e "${GREEN}2. Connexion...${NC}"
LOGIN=$(curl -s -X POST $API/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo $LOGIN

# Extraire le token (nécessite jq)
TOKEN=$(echo $LOGIN | jq -r '.accessToken')

echo -e "${GREEN}3. Récupérer le profil...${NC}"
curl -s -X GET $API/profileUser \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "${GREEN}4. Rafraîchir le token...${NC}"
curl -s -X GET $API/refresh \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "${GREEN}5. Logout...${NC}"
curl -s -X POST $API/logout \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 📝 Notes

- Remplacer `YOUR_ACCESS_TOKEN` et `YOUR_REFRESH_TOKEN` par les vrais tokens
- Les timestamps sont en UTC (ISO 8601)
- Les réponses avec `success: false` contiennent un code HTTP approprié (400, 401, 429, etc.)
- Les cookies refresh token sont automatiquement gérés par le navigateur
- Pour tester avec cURL, utiliser `-b` et `-c` pour les cookies

---

## 🔗 Accès à la Documentation Interactive

```
http://localhost:3000/api-docs
```

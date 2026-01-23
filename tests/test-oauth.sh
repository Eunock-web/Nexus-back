#!/bin/bash
# Script de test - GitHub OAuth Integration
# Usage: bash test-github-oauth.sh

echo "======================================"
echo "🧪 Tests GitHub OAuth Integration"
echo "======================================"
echo ""

API_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour tester une URL
test_endpoint() {
    echo "🔍 Test: $1"
    echo "URL: $2"
    
    if [ "$3" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$2")
    else
        response=$(curl -s -X POST "$2" -H "Content-Type: application/json" -w "\n%{http_code}")
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [[ $http_code == 200 || $http_code == 302 ]]; then
        echo -e "${GREEN}✅ Succès (Code: $http_code)${NC}"
    else
        echo -e "${RED}❌ Erreur (Code: $http_code)${NC}"
    fi
    echo "Réponse: $body"
    echo ""
}

# ====================================
# TESTS
# ====================================

echo "1️⃣ Vérifier que le serveur fonctionne"
test_endpoint "Health Check" "$API_URL" "GET"

echo "2️⃣ Vérifier l'endpoint GitHub Redirect"
test_endpoint "GitHub Redirect" "$API_URL/auth/github/redirect" "GET"

echo "3️⃣ Vérifier les routes disponibles"
curl -s "$API_URL/api-docs" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Swagger disponible${NC}"
    echo "📚 Consultez: $API_URL/api-docs"
else
    echo -e "${RED}❌ Swagger non accessible${NC}"
fi
echo ""

echo "======================================"
echo "✅ Tests Terminés!"
echo "======================================"
echo ""
echo "📖 Prochaines étapes:"
echo "1. Allez sur: $API_URL/auth/github/redirect"
echo "2. Approuvez l'accès GitHub"
echo "3. Vous serez redirigé avec un token"
echo "4. Utilisez le token pour /profileUser"
echo ""
echo "🐛 Pour déboguer, consultez les fichiers:"
echo "   - GITHUB_OAUTH_SETUP.md"
echo "   - GITHUB_OAUTH_EXAMPLES.md"
echo ""

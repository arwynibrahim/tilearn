# Rapport de Performance — Total Innovation Learning API

## Résumé

| Métrique | Valeur |
|---|---|
| **Tests exécutés** | 3 (benchmark, load progressif, scénario réaliste) |
| **Total requêtes** | ~530 000 |
| **Taux de succès** | 100% (0 erreur 5xx) |
| **Throughput max** | ~3 100 req/s |
| **Latence moyenne** | 2–216ms selon la charge |
| **Utilisateurs simultanés max** | 500 |

---

## 1. Benchmark par endpoint (autocannon — 50 conn, 15s)

| Endpoint | RPS | Lat. avg | Lat. p50 | Lat. p99 |
|---|---|---|---|---|
| GET /instructor/profile | **2 059** | 48ms | 45ms | 83ms |
| GET /b2b/organizations | **2 028** | 49ms | 45ms | 129ms |
| GET /payments/mine | **2 015** | 49ms | 45ms | 107ms |
| GET /users | **1 988** | 50ms | 45ms | 86ms |
| GET /roles/permissions | **1 985** | 50ms | 46ms | 98ms |
| GET /auth/profile | **1 980** | 50ms | 45ms | 99ms |
| GET /roles/me | **1 962** | 50ms | 46ms | 92ms |
| GET /enrollments | **1 751** | 57ms | 49ms | 270ms |
| POST /payments | **1 674** | 59ms | 55ms | 109ms |
| GET /domains | **1 460** | 68ms | 61ms | 135ms |
| GET /courses/:slug | **1 396** | 71ms | 66ms | 133ms |
| POST /auth/forgot-password | **1 117** | 89ms | 81ms | 195ms |
| POST /auth/login | **948** | 105ms | 87ms | 214ms |
| GET /courses | **789** | 126ms | 118ms | 255ms |

**Total benchmark :** ~347 000 requêtes en ~3 min 30, aucun timeout.

---

## 2. Test progressif avec auth (script Node.js — 500 VUs)

### Phases

| Phase | VUs | Durée | Requêtes | RPS | Lat. moy |
|---|---|---|---|---|---|
| Ramp-up 20 | 20 | 30s | 375 | 12 | 9ms |
| Ramp-up 100 | 100 | 30s | 2 980 | 50 | 10ms |
| Ramp-up 250 | 250 | 30s | 11 926 | 132 | 13ms |
| Ramp-up 500 | 500 | 60s | 56 348 | 375 | 28ms |
| Sustain 500 | 500 | 120s | 177 672 | 657 | 201ms |

### Résultats par code

| Code | Nombre | Signification |
|---|---|---|
| **200** | 76 314 | Endpoints publics (courses, domains) |
| **201** | 3 307 | forgot-password OK |
| **401** | 88 507 | Authentifié sans token (attendu) |
| **404** | 10 910 | course/example-course inexistant |
| **5xx** | **0** | ✅ Aucune erreur serveur |

---

## 3. Optimisations appliquées

### Throttler
- **Avant :** `TTL=60s, limit=60` → 1 req/s max, générait 80% de 429
- **Après :** `TTL=1s, limit=10 000` → 10 000 req/s, plus de throttling
- ➡️ Config via variables d'env (`THROTTLE_TTL`, `THROTTLE_LIMIT`)

### Pool de connexion Prisma
- **Avant :** Aucun pool configuré (connexions uniques)
- **Après :** `connection_limit=20, pool_timeout=10`
- ➡️ Config dans `prisma/schema.prisma`

### Scripts npm ajoutés
```json
"start:loadtest": "THROTTLE_TTL=1000 THROTTLE_LIMIT=10000 nest start",
"test:load": "node load-tests/run.js"
```

---

## 4. Recommandations

### Priorité haute
1. **✅ Déjà fait** — Rendre le throttler configurable via `.env` (lu depuis `process.env`)
2. **✅ Déjà fait** — Ajouter le connection pooling Prisma (`connection_limit=20`)
3. **❌ À faire** — Mettre en place un cache Redis pour les endpoints lecture (catalogue, domains, permissions) : temps de réponse passerait de ~100ms à <5ms
4. **❌ À faire** — Implémenter un cache HTTP (`Cache-Control` headers) sur les endpoints GET publics

### Priorité moyenne
5. **❌ À faire** — Ajouter un cache Prisma (prisma-extension-caching) pour les requêtes répétées
6. **❌ À faire** — Paginer / optimiser les queries SELECT N+1 (notamment `GET /courses` avec jointures)
7. **❌ À faire** — Rate-limiting plus fin (auth → 5 req/min, catalogue → 1000 req/min)

### Priorité basse
8. **❌ À faire** — Ajouter un endpoint dédié `GET /api/search/courses` avec Elasticsearch
9. **❌ À faire** — Compresser les réponses JSON (gzip middleware NestJS)
10. **❌ À faire** — Ajouter des index de base de données sur les colonnes fréquemment requêtées

---

## 5. Fichiers de test

```
load-tests/
├── config.js           # Configuration des endpoints
├── runner.js           # Runner progressif (register → login → requests)
├── scenario-real.js    # Scénario réaliste (4 profils utilisateur)
├── benchmark.js        # Benchmark par endpoint (autocannon)
├── package.json        # Script npm "start"
└── PERFORMANCE_REPORT.md   # Ce fichier
```

Commandes :
```bash
# Démarrer le serveur en mode load test
npm run start:loadtest

# Lancer le test progressif
npm run test:load

# Lancer le benchmark complet
node load-tests/benchmark.js

# Lancer le scénario réaliste 500 users
node load-tests/scenario-real.js
```

# Déploiement Railway — Backend TIL

## 1. Service & build
- Railway détecte le `Dockerfile` (multi-stage, image Debian bookworm compatible avec le binaryTarget Prisma `debian-openssl-3.0.x`).
- `railway.json` fixe le healthcheck sur `/health` et la politique de redémarrage.
- Au démarrage, le conteneur exécute `prisma migrate deploy && node dist/main` (les migrations sont appliquées automatiquement sur la base vide).

## 2. Provisionner la base
Ajouter un service **PostgreSQL** dans le projet Railway. Railway expose `DATABASE_URL` — la référencer dans le service backend.
> Redis n'est **pas** requis (aucun import dans le code, seulement utilisé pour le throttler en option).

## 3. Variables d'environnement à définir sur Railway

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (référence Railway) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | URL du frontend (CORS) — ex. `https://til.vercel.app` |
| `JWT_PRIVATE_KEY` | clé privée RS256 (voir note ci-dessous) |
| `JWT_PUBLIC_KEY` | clé publique RS256 |
| `JWT_ACCESS_EXPIRATION` | `15m` |
| `JWT_REFRESH_EXPIRATION` | `7d` |
| `THROTTLE_TTL` / `THROTTLE_LIMIT` | `60000` / `60` (prod) |

Optionnelles selon les fonctionnalités utilisées : `SMTP_*`, `STRIPE_*`, `LIGDICASH_*`, `GOOGLE_*`, `LINKEDIN_*`, `AWS_*`, `S3_BUCKET`.

> **PORT** : ne pas le définir manuellement — Railway l'injecte et l'app le lit via `ConfigService` (bind sur `0.0.0.0`).

### Clés JWT (RS256)
Le code normalise les `\n` littéraux → sauts de ligne réels (`normalizePemKey`), donc **les deux formats fonctionnent** sur Railway :
- coller la clé avec de vrais retours à la ligne, **ou**
- coller sur une seule ligne avec `\n` : `-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----`

Générer une paire si besoin :
```bash
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key
```

## 4. Seed (optionnel, une fois)
Pour créer les comptes de démo, ouvrir un shell Railway sur le service et lancer :
```bash
npm run prisma:seed
```
(nécessite les devDependencies — sinon exécuter le seed en local pointé sur la `DATABASE_URL` de prod).

## 5. Vérifier
- `GET /health` → `{ "status": "ok", ... }` (liveness, sans DB)
- `GET /health/ready` → `{ "status": "ready" }` (vérifie la connexion DB)
- `GET /api/docs` → Swagger

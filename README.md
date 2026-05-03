# Green Monorepo

## Quick start

```bash
corepack enable
pnpm install
```

### Run services

```bash
pnpm --filter @green/mobile dev
pnpm --filter @green/admin-web dev
pnpm --filter @green/api dev
```

### Docker

```bash
docker compose up --build
```

## Ports (Green dedicated)
- mobile: 17100
- admin-web: 17110
- api: 17120
- postgres: 17130
- redis: 17140

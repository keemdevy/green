# Green Monorepo

평판 기반 매칭 앱 Green의 Expo 모바일 앱, Next 어드민, Node API, 공유 패키지를 담는 모노레포입니다.

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

### Current app surfaces

- mobile: 검토, 매칭, 채팅, 프로필 초기 탭 화면
- admin-web: `/`, `/reports`, `/users`, `/sanctions`
- api: `/health`, `/review-pool`, `/green-flags`, `/matches`, `/admin/*`

### Shared packages

- `@green/domain`: 유저, 프로필, 그린플래그, 매칭, 신고, 제재 타입
- `@green/config`: Green 전용 포트, API URL, 정책 상수
- `@green/api-client`: typed fetch client

### Database

Supabase migration files live in `supabase/migrations`.

```bash
supabase start
supabase db reset
```

The initial schema includes users, profiles, green flags, matches, evaluations, reports, sanctions, appeals, predefined reason options, and first-pass RLS policies.
Local Supabase uses Postgres 17 on port `17130`.

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

## Planning doc

Canonical planning document: `docs/green_기획서.md`

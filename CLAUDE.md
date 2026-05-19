# CLAUDE.md

Contexto rápido para IA. Para entendimento completo, **sempre ler `ai/contexts/essential.md` primeiro**.

## O que é

Plataforma interna do clube **Inteli Blockchain** (Messias é presidente) para substituir planilhas: membros, processo seletivo, PDI. MVP completo. Próxima fase planejada: agendar reuniões via Google Calendar (schema + scope OAuth `calendar.events` já preparados).

## Stack

- **Frontend** — Next.js 16.x (App Router), React 19, Tailwind v4, TS — Vercel (root: `frontend`).
- **Backend** — NestJS 11, Prisma 6, TS — Fly.io app `pessoas-blockchain`.
- **Banco** — Postgres no Supabase (us-east-1).
- **Auth** — Google OAuth 2.0, domínio `@sou.inteli.edu.br`.

## Workflow obrigatório

`ai/WORKFLOW.md` define: para feature/fix não-trivial, **criar plano em `ai/plans/<nome>.md` antes de implementar** e aguardar aprovação. Após implementar, atualizar `ai/contexts/essential.md`. Convenção: `feature-*`, `fix-*`, `refactor-*`, `chore-*`.

Pular plano só para: typo, ajuste óbvio em 1 arquivo, exploração/audit.

## Regras técnicas críticas

1. **AuthGuard valida `x-user-id` no DB e lê role do DB.** Header `x-user-role` é **ignorado** pelo backend (anti-escalada). Frontend usa role do localStorage só para UI gating. Ver `backend/src/modules/auth/auth.guard.ts`.
2. **SSR-safe**: nunca `typeof window !== 'undefined'` no render. Padrão: `useState<boolean | null>(null)` + `useEffect` lendo localStorage. Páginas com guard retornam `null` enquanto carrega (sem flash).
3. **Resposta API**: tudo envelopado por `ResponseInterceptor` — `{status, message, success, data, error, meta}`. Frontend lê `response.data?.data`.
4. **PDI auto-revisão**: `PATCH /pdi/:id` cria `PdiEntryRevision` em `$transaction` (timeout 30s) quando `content` muda. `authorId`/`editorId` **nullable** (`onDelete: SetNull`).
5. **Paginação por cursor** em todas listagens: `cursor`, `limit`, `sort`, `direction`. `meta.nextCursor` no retorno.
6. **Frontend Next.js**: ler `frontend/AGENTS.md` — esta versão tem breaking changes vs treino comum, consultar `node_modules/next/dist/docs/` antes de mexer em APIs novas do framework.

## Arquivos de referência

| Onde | O que |
|------|-------|
| `ai/contexts/essential.md` | Contexto consolidado (atualizar após cada feature) |
| `ai/WORKFLOW.md` | Processo plano → aprovação → implementação |
| `ai/plans/` | Planos aprovados, exemplos de formato |
| `docs/ARCHITECTURE.md` | 16 modelos Prisma, 9 enums, RBAC, 44+ endpoints |
| `backend/prisma/schema.prisma` | Schema fonte da verdade |
| `backend/README.md` / `frontend/README.md` | Detalhes de cada camada |
| Swagger | `http://localhost:3001/docs` ou `https://pessoas-blockchain.fly.dev/docs` |

## Setup rápido

```bash
npm install --prefix backend
npm install --prefix frontend
# backend/.env e frontend/.env conforme README.md
cd backend && npx prisma migrate deploy && npx ts-node scripts/seed.ts
cd .. && npm run dev   # frontend :3000, backend :3001
# Primeiro acesso pós-seed:
# http://localhost:3000/dashboard?userId=00000000-0000-0000-0000-000000000001&role=ADMIN
```

## Estado atual (verificado 2026-05-19)

- 59/59 testes backend passando (6 suites).
- Frontend typecheck limpo (`npx tsc --noEmit`).
- Working tree: arquivos default do Next em `frontend/public/` removidos (file.svg, globe.svg, next.svg, vercel.svg, window.svg); `favicon.ico` + `logo.png` adicionados. Não commitado ainda.
- Branch `main`, último commit: `54e8a71 docs: atualiza readme`.

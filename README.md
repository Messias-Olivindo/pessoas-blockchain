# Inteli Blockchain — Gestão de Pessoas

Plataforma interna para gerenciar a jornada dos integrantes do clube Inteli Blockchain. Centraliza processos seletivos, avaliações, feedbacks e Planos de Desenvolvimento Individual (PDI), substituindo planilhas isoladas.

## Stack

| Camada | Tecnologia | Deploy |
|--------|-----------|--------|
| Frontend | Next.js 15+ (App Router), React 19, Tailwind CSS v4, TypeScript | Vercel — Root Directory: `frontend` |
| Backend | NestJS 11, TypeScript, Swagger, Prisma 6.x | Fly.io via Docker — app `pessoas-blockchain` |
| Banco de Dados | PostgreSQL (Supabase, AWS us-east-1) | Supabase |
| Auth | Google OAuth 2.0 + DB-validated header guard | `google-auth-library` |

## Estrutura do Monorepo

```
.
├── backend/          # API RESTful (NestJS + Prisma)
├── frontend/         # Interface web (Next.js App Router)
├── data/             # Planilhas xlsx para seed
├── docs/             # Documentação técnica (ARCHITECTURE.md)
├── ai/               # Contexto e workflow para agentes de IA
│   ├── contexts/     # essential.md — referência principal do projeto
│   ├── plans/        # Planos de funcionalidades aprovados antes de implementar
│   └── WORKFLOW.md   # Processo: contexto → plano → aprovação → implementação
└── package.json      # Scripts do monorepo
```

## Pré-requisitos

- Node.js 20+
- npm 10+
- Conta Supabase com banco PostgreSQL criado
- Credenciais Google OAuth 2.0 (Google Cloud Console)

## Setup Local

### 1. Instalar dependências

```bash
git clone <repo>
cd gestao_pessoas
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configurar variáveis de ambiente

**Backend** — criar `backend/.env`:

```env
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/postgres"
PORT=3001
NODE_ENV=development
GOOGLE_CLIENT_ID="<seu-client-id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<seu-client-secret>"
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:3001/auth/google/callback"
FRONTEND_URL="http://localhost:3000"
```

**Frontend** — criar `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Aplicar migrations e popular banco

```bash
cd backend
npx prisma migrate deploy      # aplica todas as migrations
npx ts-node scripts/seed.ts    # popula com dados reais dos xlsx em data/
```

> O seed imprime todos os `x-user-id` criados. Use o ID do admin para o primeiro login local.

### 4. Rodar em desenvolvimento

```bash
# Da raiz — roda frontend (3000) e backend (3001) em paralelo
npm run dev

# Individualmente
npm run dev:front   # Next.js em localhost:3000
npm run dev:back    # NestJS em localhost:3001 (hot reload)
```

### 5. Primeiro acesso local

Após o seed, acesse:

```
http://localhost:3000/dashboard?userId=00000000-0000-0000-0000-000000000001&role=ADMIN
```

Isso inicializa a sessão no localStorage sem precisar de OAuth.

## Auth Flow

1. `GET /auth/google` → redireciona para consentimento Google
2. Google redireciona para `/auth/google/callback?code=...`
3. Backend troca code por tokens, faz upsert do User + Account no DB
4. Backend redireciona para `/dashboard?userId=<id>&role=<role>`
5. Frontend armazena `x-user-id` e `x-user-role` no localStorage
6. Cada request Axios envia `x-user-id` no header
7. `AuthGuard` valida o user no banco (role lida do DB, não do header)

**Domínio restrito:** apenas emails `@sou.inteli.edu.br` podem autenticar.

## Roles e Permissões

| Role | Acesso |
|------|--------|
| **ADMIN** | Irrestrito. Pode alterar roles de outros usuários. UUID fixo no seed: `00000000-0000-0000-0000-000000000001` |
| **PEOPLE** | Gerencia membros, PDI, processos seletivos e usuários (exceto alterar roles) |
| **INTERVIEWER** | Leitura de membros, leitura e avaliação de candidatos no processo seletivo |

## Deploy

### Backend (Fly.io)

```bash
cd backend
fly deploy
```

- Release command automático: `npx prisma migrate deploy`
- Região: `iad` (US East)
- Recursos: 1 vCPU compartilhado, 1 GB RAM

### Frontend (Vercel)

Configurar no dashboard da Vercel:
- **Root Directory:** `frontend`
- **Environment Variable:** `NEXT_PUBLIC_API_URL=https://pessoas-blockchain.fly.dev`

## Comandos Úteis

```bash
# Backend
cd backend
npm run start:dev          # desenvolvimento com hot reload
npm run build              # compilar TypeScript
npm run test               # rodar 59 testes unitários
npx prisma studio          # GUI do banco de dados
npx ts-node scripts/seed.ts  # repopular banco com dados reais

# Frontend
cd frontend
npm run dev                # desenvolvimento
npm run build              # build de produção
npx tsc --noEmit           # verificar tipos TypeScript
```

## Documentação

- **Arquitetura completa:** `docs/ARCHITECTURE.md`
- **Contexto do projeto (IA):** `ai/contexts/essential.md`
- **API Swagger:** `http://localhost:3001/docs` (local) ou `https://pessoas-blockchain.fly.dev/docs`
- **Backend detalhado:** `backend/README.md`
- **Frontend detalhado:** `frontend/README.md`
- **Workflow de desenvolvimento:** `ai/WORKFLOW.md`

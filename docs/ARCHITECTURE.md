# Arquitetura — Inteli Blockchain Gestão de Pessoas

**Última atualização:** 2026-05-07

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura do Monorepo](#3-estrutura-do-monorepo)
4. [Banco de Dados](#4-banco-de-dados)
   - [Enums](#41-enums)
   - [Modelos](#42-modelos)
   - [Regras de Integridade](#43-regras-de-integridade)
5. [Backend (NestJS)](#5-backend-nestjs)
   - [Módulos](#51-módulos)
   - [Padrão de Resposta](#52-padrão-de-resposta)
   - [Auth Guard (DB-Validated)](#53-auth-guard-db-validated)
   - [RBAC](#54-rbac)
   - [Paginação por Cursor](#55-paginação-por-cursor)
6. [Frontend (Next.js)](#6-frontend-nextjs)
   - [Rotas](#61-rotas)
   - [Auth no Frontend](#62-auth-no-frontend)
   - [Padrão SSR-Safe](#63-padrão-ssr-safe)
   - [Responsividade Mobile](#64-responsividade-mobile)
7. [Fluxo de Auth (OAuth)](#7-fluxo-de-auth-oauth)
8. [Deploy e Infraestrutura](#8-deploy-e-infraestrutura)
9. [Endpoints Completos](#9-endpoints-completos)

---

## 1. Visão Geral

Plataforma interna para gerenciar a jornada dos integrantes do clube Inteli Blockchain. Centraliza processos seletivos, avaliações, feedbacks e Planos de Desenvolvimento Individual (PDI), substituindo planilhas isoladas.

**Escopo MVP implementado:** Membros, Processo Seletivo completo (processes/stages/questions/applications/results/evaluations/answers), PDI com histórico de revisões, Import/Export xlsx/csv/pdf.

**Fora do MVP:** Google Calendar, autenticação por cookie/sessão (Session model existe mas não está ativo).

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão | Deploy |
|--------|-----------|--------|--------|
| Frontend | Next.js App Router, React, Tailwind CSS v4, TypeScript | Next 15+, React 19 | Vercel |
| Backend | NestJS, TypeScript, Swagger | NestJS 11 | Fly.io via Docker |
| ORM | Prisma | 6.x | — |
| Banco | PostgreSQL (Supabase, AWS us-east-1) | — | Supabase |
| Auth | Google OAuth 2.0 + DB-validated header guard | `google-auth-library` 10 | — |
| Animações | Framer Motion | 12 | — |
| PDF | pdfkit | 0.18 | — |
| Excel | xlsx | 0.18 | — |

---

## 3. Estrutura do Monorepo

```
gestao_pessoas/
├── backend/                    # NestJS API (porta 3001)
│   ├── src/
│   │   ├── main.ts             # Bootstrap: CORS, Swagger, pipes, interceptors, filters
│   │   ├── app.module.ts       # Registro de todos os módulos
│   │   ├── modules/
│   │   │   ├── auth/           # OAuth + guard
│   │   │   ├── users/          # CRUD usuários
│   │   │   ├── members/        # CRUD membros
│   │   │   ├── selection/      # Pipeline seletivo completo
│   │   │   ├── pdi/            # PDI + auto-revisão
│   │   │   └── import-export/  # xlsx/csv/pdf
│   │   └── shared/
│   │       ├── database/prisma/    # PrismaService (@Global)
│   │       ├── guards/             # AuthGuard, RolesGuard
│   │       ├── interceptors/       # ResponseInterceptor
│   │       ├── filters/            # HttpExceptionFilter
│   │       ├── decorators/         # @Roles()
│   │       ├── types/              # ApiResponse, CursorPagination, Request typings
│   │       └── utils/              # isInteliEmail()
│   ├── prisma/
│   │   ├── schema.prisma       # 16 modelos, 9 enums
│   │   └── migrations/         # Histórico de migrations
│   ├── scripts/
│   │   └── seed.ts             # Popula banco com dados reais de xlsx
│   ├── Dockerfile              # Multi-stage: builder + runner Node 20 slim
│   └── fly.toml                # Fly.io: região iad, 1 vCPU, 1 GB RAM
│
├── frontend/                   # Next.js App Router (porta 3000)
│   ├── app/
│   │   ├── (public)/login/     # Google OAuth login
│   │   └── (protected)/        # Layout com Sidebar + topbar mobile
│   │       ├── dashboard/
│   │       ├── members/[id]/pdi/
│   │       ├── members/
│   │       ├── selection/[id]/
│   │       ├── selection/
│   │       └── admin/users/
│   ├── components/
│   │   ├── layout/Sidebar.tsx  # Hamburger mobile / sidebar fixa desktop
│   │   └── ui/                 # Button, Card, Input, Modal, Table, MarkdownEditor/Viewer
│   ├── services/               # Axios services (api.ts, auth, dashboard, members, pdi, selection, users)
│   └── lib/labels.ts           # Mapas enum → pt-BR
│
├── data/                       # Planilhas xlsx para seed
│   ├── [CENTRAL] BLOCKCHAIN INTEGRANTES.xlsx
│   └── Aprovados 2026.xlsx
│
├── docs/
│   └── ARCHITECTURE.md         # Este arquivo
│
└── ai/
    ├── contexts/essential.md   # Contexto consolidado do projeto (referência para IAs)
    ├── plans/                  # Planos aprovados antes de implementar
    └── WORKFLOW.md             # Processo de desenvolvimento com IA
```

---

## 4. Banco de Dados

### 4.1. Enums

```prisma
enum UserRole        { ADMIN  PEOPLE  INTERVIEWER }
enum UserStatus      { PENDING  APPROVED  REJECTED }
enum MemberStatus    { CANDIDATE  ACTIVE  INACTIVE  ALUMNI }
enum Department      { PEOPLE  MARKETING  PROJECTS  EDUCATIONAL }
enum Position        { MEMBER  DIRECTOR  PRESIDENT  HEAD }
enum ApplicationStatus { DRAFT SUBMITTED IN_REVIEW APPROVED REJECTED WITHDRAWN }
enum StageResultStatus { PENDING  PASSED  FAILED  SKIPPED }
enum MeetingRequestStatus { PENDING APPROVED REJECTED CANCELED }  // fora do MVP
enum MeetingStatus   { SCHEDULED  COMPLETED  CANCELED }           // fora do MVP
```

### 4.2. Modelos

#### User
```prisma
model User {
  id            String     @id @default(uuid())
  name          String?
  email         String     @unique
  emailVerified DateTime?
  image         String?
  role          UserRole   @default(PEOPLE)
  status        UserStatus @default(PENDING)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  memberId      String?    @unique       // 1:1 opcional com Member
  accounts      Account[]
  sessions      Session[]
  member        Member?
  evaluations   CandidateEvaluation[]
}
```

#### Account (OAuth tokens)
```prisma
model Account {
  id                String  @id @default(uuid())
  userId            String
  provider          String                  // "google"
  providerAccountId String
  access_token      String? @db.Text
  refresh_token     String? @db.Text
  expires_at        Int?
  @@unique([provider, providerAccountId])
}
```

#### Member
```prisma
model Member {
  id           String       @id @default(uuid())
  name         String
  email        String       @unique
  universityId String?
  gender       String?
  race         String?
  isLgbtqia   Boolean      @default(false)
  status       MemberStatus @default(CANDIDATE)
  position     Position?
  department   Department?
  joinedAt     DateTime?
  leftAt       DateTime?
  interests    String[]     // GIN index para busca
  // Relações: User?, Application[], PdiEntry[], MemberAssignment[]
}
```

#### Processo Seletivo (cascata)
```
SelectionProcess
  └── SelectionStage (order único por processo)
        └── SelectionQuestion (order único por etapa, maxScore, weight)
              ├── CandidateEvaluation (score + notes, evaluatorId nullable)
              └── SelectionAnswer (answerText — resposta do candidato)

Application (memberId + processId — unique)
  ├── StageResult (por etapa — status PASSED/FAILED/PENDING, score?)
  ├── CandidateEvaluation (por questão — score?, notes?)
  └── SelectionAnswer (por questão — texto livre)
```

#### PdiEntry
```prisma
model PdiEntry {
  id        String   @id @default(uuid())
  memberId  String
  authorId  String?              // nullable — onDelete: SetNull
  title     String
  content   String   @db.Text
  isActive  Boolean  @default(true)
  revisions PdiEntryRevision[]
}

model PdiEntryRevision {
  id         String   @id @default(uuid())
  pdiEntryId String
  editorId   String?             // nullable — onDelete: SetNull
  content    String   @db.Text
  createdAt  DateTime @default(now())
}
```

### 4.3. Regras de Integridade

| Relação | Comportamento ao deletar pai |
|---------|------------------------------|
| User → Account, Session | Cascade |
| Member → Application, PdiEntry, MemberAssignment | Cascade |
| SelectionProcess → Stage → Question | Cascade |
| Application → StageResult, CandidateEvaluation, SelectionAnswer | Cascade |
| CandidateEvaluation.evaluatorId → User | SetNull |
| PdiEntry.authorId → User | SetNull |
| PdiEntryRevision.editorId → User | SetNull |

---

## 5. Backend (NestJS)

### 5.1. Módulos

```
Controller → Service → Repository → PrismaService → PostgreSQL
     │
     ├── AuthGuard (valida x-user-id no DB, seta request.user com role real)
     ├── RolesGuard (verifica request.user.role contra @Roles())
     └── DTOs (class-validator, whitelist=true, forbidNonWhitelisted=true)
```

| Shared | Função |
|--------|--------|
| `PrismaService` | `@Global()` — sem necessidade de importar PrismaModule em cada módulo |
| `ResponseInterceptor` | Envelopa **todas** respostas: `{status, message, success, data, error, meta}` |
| `HttpExceptionFilter` | Erros padronizados: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR` |

### 5.2. Padrão de Resposta

```json
{
  "status": 200,
  "message": "OK",
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "nextCursor": "uuid", "limit": 20, "sort": "createdAt" }
}
```

Frontend sempre lê `response.data?.data`.

### 5.3. Auth Guard (DB-Validated)

```typescript
// Fluxo do AuthGuard (src/modules/auth/auth.guard.ts)
const userId = request.header('x-user-id');
// → 401 se ausente
const user = await prisma.user.findUnique({ where: { id: userId } });
// → 401 se não encontrado
// → 403 se user.status != 'APPROVED'
request.user = { id: user.id, role: user.role };
// role vem do DB — header x-user-role é IGNORADO para autorização
```

**Segurança:** impossível escalar privilégios via header forjado. Role escalation foi uma vulnerabilidade crítica no design anterior (header trust).

### 5.4. RBAC

| Recurso | ADMIN | PEOPLE | INTERVIEWER |
|---------|:-----:|:------:|:-----------:|
| Members (leitura) | ✅ | ✅ | ✅ |
| Members (escrita) | ✅ | ✅ | ❌ |
| Selection (leitura) | ✅ | ✅ | ✅ |
| Selection (avaliações) | ✅ | ✅ | ✅ |
| Selection (escrita geral) | ✅ | ✅ | ❌ |
| PDI | ✅ | ✅ | ❌ |
| Users (leitura + aprovar) | ✅ | ✅ | ❌ |
| Users (alterar role) | ✅ | ❌ | ❌ |
| Import/Export | ✅ | ✅ | ❌ |

### 5.5. Paginação por Cursor

```
GET /members?cursor=<uuid>&limit=20&sort=createdAt&direction=asc
```

`meta` retorna: `nextCursor`, `prevCursor`, `limit`, `sort`.

---

## 6. Frontend (Next.js)

### 6.1. Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/login` | Público | Login via Google OAuth |
| `/dashboard` | Autenticado | Métricas gerais, inicializa sessão via `?userId=&role=` |
| `/members` | ADMIN, PEOPLE | Lista com busca debounced + filtros |
| `/members/[id]` | ADMIN, PEOPLE | Perfil completo com edição inline |
| `/members/[id]/pdi` | ADMIN, PEOPLE | Editor PDI com preview e export |
| `/selection` | ADMIN, PEOPLE | Lista de processos com etapas expansíveis |
| `/selection/[id]` | ADMIN, PEOPLE | Planilha de candidatos + modal por candidato |
| `/admin/users` | ADMIN, PEOPLE | Gerência de usuários da plataforma |

### 6.2. Auth no Frontend

```
localStorage:
  x-user-id    → UUID do usuário (header obrigatório em todo request)
  x-user-role  → ADMIN|PEOPLE|INTERVIEWER (apenas routing de UI)

Axios interceptor 401:
  → limpa localStorage → redirect /login (auth.ts)

Inicializar sessão (pós-seed ou primeiro acesso):
  /dashboard?userId=<uuid>&role=<role>
```

### 6.3. Padrão SSR-Safe

**Problema:** `typeof window !== 'undefined'` no corpo do componente causa hydration mismatch (SSR renderiza role="" → client renderiza com role real → React falha na hidratação).

**Solução aplicada em todos os arquivos:**

```tsx
const [canAccess, setCanAccess] = useState<boolean | null>(null);

useEffect(() => {
  const role = localStorage.getItem("x-user-role") ?? "";
  setCanAccess(role === "ADMIN" || role === "PEOPLE");
}, []);

if (canAccess === null) return null;    // invisível enquanto verifica (sem flash)
if (!canAccess) return <AccessDenied />;
```

Arquivos com esse padrão: `Sidebar.tsx`, `members/page.tsx`, `members/[id]/page.tsx`, `selection/page.tsx`, `selection/[id]/page.tsx`, `admin/users/page.tsx`.

### 6.4. Responsividade Mobile

- **Sidebar:** topbar `h-14` com botão hamburger visível só em `< md`. Sidebar abre como overlay animado (Framer Motion `x: "-100%" → 0`). Backdrop fecha ao clicar fora.
- **Modal:** sheet no mobile (`items-end`, `rounded-t-[20px]`, drag handle visual). Centralizado no desktop (`sm:items-center`, `sm:rounded-[20px]`). Scroll em `max-h-[75vh]`. Body overflow oculto quando aberto.
- **Back buttons:** `members/[id]` → `/members`, `members/[id]/pdi` → `/members/:id`, `selection/[id]` → `/selection`.

---

## 7. Fluxo de Auth (OAuth)

```
1. Usuário clica "Entrar com Google"
   → GET /auth/google
   → 302 redirect para accounts.google.com

2. Usuário autoriza
   → Google redireciona para /auth/google/callback?code=...

3. Backend:
   → troca code por tokens (access_token, refresh_token)
   → valida domínio @sou.inteli.edu.br
   → upsert User por email (status preservado no update — não sobrescreve)
   → upsert Account com tokens OAuth
   → se user.status == PENDING → redirect /pending
   → se user.status == APPROVED → redirect /dashboard?userId=&role=

4. Frontend:
   → /dashboard lê ?userId e ?role da URL
   → persiste no localStorage
   → setupApiClient() configura interceptor Axios
   → router.replace("/dashboard") para limpar URL
```

**Nota:** O seed cria usuários com `status: APPROVED` explicitamente. Novos usuários via OAuth começam com `status: PENDING` (default do schema) até aprovação manual em `/admin/users`.

---

## 8. Deploy e Infraestrutura

### Backend (Fly.io)

```toml
# fly.toml
app = 'pessoas-blockchain'
primary_region = 'iad'     # US East
internal_port = 3000
memory = '1gb'
release_command = 'npx prisma migrate deploy'
```

```dockerfile
# Dockerfile (multi-stage)
FROM node:20-bookworm-slim AS builder
# npm ci --include=dev
# prisma generate
# npm run build

FROM node:20-bookworm-slim AS runner
# npm ci --omit=dev
# COPY dist/ prisma/
# CMD node dist/main
```

### Frontend (Vercel)

- Root Directory: `frontend`
- Build command: `npm run build` (auto-detectado)
- Environment: `NEXT_PUBLIC_API_URL=https://pessoas-blockchain.fly.dev`

### Banco de Dados (Supabase)

- Provider: AWS us-east-1
- Duas URLs: `DATABASE_URL` (pgbouncer, porta 6543) para runtime; `DIRECT_URL` (porta 5432) para migrations Prisma.
- Migrations aplicadas automaticamente no deploy via `prisma migrate deploy`.

---

## 9. Endpoints Completos

### Auth (público)
```
GET  /auth/google
GET  /auth/google/callback
GET  /auth/me                              [AuthGuard]
```

### Users [ADMIN, PEOPLE]
```
GET    /users
GET    /users/:id
PATCH  /users/:id/approve
PATCH  /users/:id/role                     [ADMIN]
```

### Members [ADMIN, PEOPLE, INTERVIEWER (leitura)]
```
GET    /members                            filtros: q, status, department, position, interests, cursor, limit
GET    /members/:id
POST   /members                            [ADMIN, PEOPLE]
PATCH  /members/:id                        [ADMIN, PEOPLE]
PATCH  /members/:id/status                 [ADMIN, PEOPLE]
GET    /members/:id/assignments
POST   /members/:id/assignments            [ADMIN, PEOPLE]
PATCH  /members/assignments/:id            [ADMIN, PEOPLE]
```

### Selection [ADMIN, PEOPLE, INTERVIEWER (leitura + avaliação)]
```
GET    /selection/processes
POST   /selection/processes
GET    /selection/processes/:id
PATCH  /selection/processes/:id

GET    /selection/processes/:id/stages
POST   /selection/processes/:id/stages
PATCH  /selection/stages/:id

GET    /selection/stages/:id/questions
POST   /selection/stages/:id/questions
PATCH  /selection/questions/:id

GET    /selection/applications             filtros: processId, memberId, status
POST   /selection/applications
GET    /selection/applications/:id         inclui member, stages, questions, answers, evaluations, results
PATCH  /selection/applications/:id/submit
PATCH  /selection/applications/:id/status

GET    /selection/applications/:id/results
PATCH  /selection/applications/:id/results/:stageId

GET    /selection/applications/:id/answers
POST   /selection/applications/:id/answers
PATCH  /selection/applications/:id/answers/:questionId

GET    /selection/applications/:id/evaluations
POST   /selection/applications/:id/evaluations    [ADMIN, PEOPLE, INTERVIEWER]
PATCH  /selection/applications/:id/evaluations/:questionId [ADMIN, PEOPLE, INTERVIEWER]
```

### PDI [ADMIN, PEOPLE]
```
GET    /pdi                                filtro: memberId
POST   /pdi
GET    /pdi/:id
PATCH  /pdi/:id                            → cria PdiEntryRevision se content mudou
POST   /pdi/:id/revisions
```

### Import/Export [ADMIN, PEOPLE]
```
POST   /import/members
POST   /import/selection
GET    /export/members/csv
GET    /export/members/:id/pdf
GET    /export/selection/:processId/csv
GET    /export/pdi/csv
```

**Total: 44+ rotas mapeadas**

---

## Referências

- `ai/contexts/essential.md` — contexto consolidado para IAs (atualizado continuamente)
- `ai/WORKFLOW.md` — processo de desenvolvimento: plano → aprovação → implementação
- `ai/plans/` — histórico de planos implementados
- Swagger: `http://localhost:3001/docs` / `https://pessoas-blockchain.fly.dev/docs`

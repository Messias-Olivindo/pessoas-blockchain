# Frontend — Inteli Blockchain Gestão de Pessoas

Interface web construída com Next.js 15+ App Router, React 19, Tailwind CSS v4 e TypeScript.

## Stack

- **Framework:** Next.js 15+ (App Router, SSR + Client Components)
- **UI:** React 19, Tailwind CSS v4
- **Animações:** Framer Motion 12
- **HTTP:** Axios 1.x
- **Ícones:** Lucide React
- **Markdown:** react-markdown + remark-gfm
- **Deploy:** Vercel — Root Directory: `frontend`

## Setup

```bash
npm install
cp .env.example .env   # editar NEXT_PUBLIC_API_URL

npm run dev            # localhost:3000
npm run build          # build de produção
npx tsc --noEmit       # verificar tipos sem compilar
```

## Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Estrutura

```
frontend/
├── app/
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Raiz — redireciona conforme auth
│   ├── globals.css                    # Variáveis CSS + Tailwind
│   ├── (public)/
│   │   └── login/page.tsx             # Tela de login Google OAuth
│   └── (protected)/
│       ├── layout.tsx                 # Layout protegido: Sidebar + topbar mobile
│       ├── dashboard/page.tsx         # Métricas (membros, processos, PDIs)
│       ├── members/
│       │   ├── page.tsx               # Lista com busca e filtros
│       │   └── [id]/
│       │       ├── page.tsx           # Perfil: edição inline, interesses, histórico PS
│       │       └── pdi/page.tsx       # Editor PDI + preview + export PDF/CSV
│       ├── selection/
│       │   ├── page.tsx               # Lista de processos com etapas expansíveis
│       │   └── [id]/page.tsx          # Planilha de candidatos (clicar na linha abre modal)
│       └── admin/
│           └── users/page.tsx         # Gerencia usuários: approve, reject, role
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx                # Hamburger mobile / sidebar fixa desktop
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx                  # Sheet no mobile (slide de baixo), centralizado desktop
│       ├── Table.tsx
│       ├── MarkdownEditor.tsx
│       └── MarkdownViewer.tsx
├── lib/
│   └── labels.ts                      # Mapas enum → pt-BR + fn label()
└── services/
    ├── api.ts                         # Axios + interceptor 401 + downloadFile()
    ├── auth.service.ts
    ├── dashboard.service.ts
    ├── members.service.ts
    ├── pdi.service.ts
    ├── selection.service.ts
    └── users.service.ts
```

## Páginas

### `/dashboard`
- Métricas reais: membros por status (ACTIVE/INACTIVE/CANDIDATE/ALUMNI), total de processos ativos/encerrados, total de PDIs.
- **Inicializa sessão:** lê `?userId=&role=` da URL e persiste no localStorage.

### `/members`
- Busca textual debounced (300ms) por nome/email via `?q=` server-side.
- Filtros: Status, Departamento, Cargo, Processo Seletivo (cross-reference client-side).
- Contador de resultados e filtros ativos.

### `/members/[id]`
- View + edição inline de todos os campos (status, dept, cargo, email, RA, datas, gênero, raça, LGBTQIA+).
- Interesses: tags add/remove com sugestões pré-definidas.
- Histórico do processo seletivo: badges por etapa com status e pontuação.
- "Ver mais" por candidatura: lazy-load de avaliações, respostas e anotações.
- Back button → `/members`.

### `/members/[id]/pdi`
- Carrega PDI existente do banco ao abrir.
- Editor markdown com indicador de alterações não salvas.
- Preview em modal antes de exportar PDF ou CSV.
- Back button → `/members/:id`.

### `/selection`
- Lista de processos com card expansível inline (click em "Ver mais"):
  - Etapas colapsáveis com número, título, contagem de questões, total de pontos.
  - Questões aninhadas com pontuação.

### `/selection/[id]`
- Tabela de candidatos com ordenação clicável (nome, status, nota por etapa, total).
- Click na linha do candidato → modal com respostas e avaliações agrupadas por etapa.
- Filtro rápido por status (pills).
- Import CSV/xlsx e export CSV.
- Back button → `/selection`.

### `/admin/users`
- Lista usuários da plataforma com filtros de role e status.
- Aprova, rejeita e altera role. Botão de alterar role visível apenas para ADMIN.

## Auth no Frontend

```
localStorage:
  x-user-id    → UUID do usuário (enviado em x-user-id header em todo request)
  x-user-role  → ADMIN|PEOPLE|INTERVIEWER (apenas UI — backend ignora para auth)

Axios interceptor 401:
  → limpa localStorage → window.location.href = '/login'
```

Após seed ou primeiro login, inicializar sessão via:
```
/dashboard?userId=<id>&role=<role>
```

## Responsividade Mobile

- **Sidebar:** hamburger `<md`, overlay animado da esquerda. Fecha ao clicar fora ou em link.
- **Modal:** sheet de baixo no mobile (`items-end`, `rounded-t-[20px]`), centralizado no desktop (`sm:items-center`).
- **Padding e layout:** `p-8` pages, `md:` breakpoints para layouts side-by-side.

## Padrão SSR-Safe (Hydration)

**Nunca** usar `typeof window !== 'undefined'` no corpo do componente — causa hydration mismatch.

Padrão correto para ler localStorage:

```tsx
const [canAccess, setCanAccess] = useState<boolean | null>(null);

useEffect(() => {
  const role = localStorage.getItem("x-user-role") ?? "";
  setCanAccess(role === "ADMIN" || role === "PEOPLE");
}, []);

if (canAccess === null) return null;   // invisível durante check
if (!canAccess) return <AccessDenied />;
```

Aplicado em: Sidebar, members/page, members/[id]/page, selection/page, selection/[id]/page, admin/users/page.

## Labels pt-BR (`lib/labels.ts`)

Mapas de tradução para todos os enums:

```ts
import { label, MEMBER_STATUS_LABEL, DEPARTMENT_LABEL } from "@/lib/labels";

label(MEMBER_STATUS_LABEL, "ACTIVE")  // → "Ativo"
label(DEPARTMENT_LABEL, "PEOPLE")     // → "Pessoas"
```

Mapas disponíveis: `MEMBER_STATUS_LABEL`, `DEPARTMENT_LABEL`, `POSITION_LABEL`, `APPLICATION_STATUS_LABEL`, `STAGE_RESULT_STATUS_LABEL`, `USER_ROLE_LABEL`, `USER_STATUS_LABEL`, `GENDER_LABEL`, `RACE_LABEL`.

## Serviços

Todos os serviços leem `response.data?.data` (envelope da API).

| Serviço | Principais funções |
|---------|-------------------|
| `api.ts` | `setupApiClient()`, `downloadFile(path, filename)` |
| `members.service.ts` | `getMembers(filters)`, `getMemberById(id)`, `updateMember(id, data)`, `exportPDF(id)` |
| `selection.service.ts` | `getProcesses()`, `getProcess(id)`, `getApplications(processId)`, `getApplicationDetail(id)`, `getMemberApplications(memberId)` |
| `pdi.service.ts` | `getPdis(memberId)`, `savePdi(...)`, `updatePdi(...)`, `exportPDF(memberId)`, `exportCSV(memberId)` |
| `users.service.ts` | `getUsers(filters)`, `approveUser(id)`, `rejectUser(id)`, `updateRole(id, role)` |
| `dashboard.service.ts` | `getMetrics()` |

## Deploy (Vercel)

Configuração no dashboard da Vercel:
- **Root Directory:** `frontend`
- **Framework Preset:** Next.js (auto-detectado)
- **Environment Variable:** `NEXT_PUBLIC_API_URL=https://pessoas-blockchain.fly.dev`

Não há `vercel.json` — configuração via dashboard.

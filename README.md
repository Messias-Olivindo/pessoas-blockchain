# ⛓️ Inteli Blockchain - Member Management System

Plataforma interna desenvolvida para gerenciar a jornada dos integrantes do clube Inteli Blockchain. O sistema centraliza a administração de processos seletivos, feedbacks e Planos de Desenvolvimento Individual (PDI), substituindo planilhas isoladas e documentos soltos.

## 🏗️ Estrutura do Projeto (Monorepo)

O projeto utiliza **npm workspaces** para agrupar o frontend e o backend em um único repositório, facilitando a navegação e o compartilhamento de configurações globais, mantendo as dependências isoladas.
```text
.
├── backend/       # API RESTful (NestJS + Prisma)
├── frontend/      # Aplicação Web (Next.js 15+ App Router)
├── docs/          # Documentação técnica da aplicação
└── package.json   # Gerenciador do Workspace (configuração raiz)
```

## 💻 Tecnologias Utilizadas

*   **Frontend:** Next.js, React, Tailwind CSS.
*   **Backend:** NestJS, TypeScript.
*   **Banco de Dados:** PostgreSQL (hospedado no Supabase) via Prisma ORM.
*   **Infraestrutura:** Vercel (Frontend) e Railway via Docker (Backend).

## 🛠️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
*   [Node.js](https://nodejs.org/en/) (v20 ou superior)
*   [npm](https://www.npmjs.com/) (Gerenciador de pacotes padrão deste repositório)
*   [Docker](https://www.docker.com/) (Recomendado para simular infraestrutura local)

## 🚀 Como rodar o projeto localmente

Como o projeto utiliza npm workspaces, grande parte da instalação pode ser feita diretamente da raiz.

**1. Clone o repositório e instale as dependências globais:**
```bash
git clone 
cd 
npm install
```

**2. Configure as Variáveis de Ambiente:**
*   Acesse a pasta `backend/` e crie seu arquivo `.env` (use o `.env.example` como base). Adicione a URL do PostgreSQL fornecida pelo Supabase.
*   Acesse a pasta `frontend/` e crie o `.env` com as chaves públicas necessárias (ex: URLs da API).

**3. Inicie os servidores (Desenvolvimento):**

Para rodar a API (Backend) - Porta padrão `3001` (ou a configurada):
```bash
npm run start:dev --workspace=backend
```

Para rodar a Interface (Frontend) - Porta padrão `3000`:
```bash
npm run dev --workspace=frontend
```

## 🚢 Deploy e Hospedagem

Como este é um repositório único dividindo duas aplicações separadas, a configuração de deploy exige atenção ao **Diretório Raiz (Root Directory)** em cada plataforma:

*   **Vercel (Frontend):** Ao importar o projeto, altere o "Root Directory" de `./` para `frontend`. A Vercel detectará o Next.js e fará o build automaticamente.
*   **Railway (Backend):** Ao conectar o repositório, vá em *Settings* do serviço e altere o "Root Directory" para `backend`. Certifique-se de que o seu `Dockerfile` está na raiz da pasta `backend/` para que o Railway consiga orquestrar o container do NestJS.

## 🤝 Padrões de Contribuição

Para garantir a escalabilidade e manutenção por futuras diretorias:
1.  Crie *branches* com nomes descritivos: `feat/nova-tabela-ps`, `fix/bug-login`.
2.  Mantenha as responsabilidades separadas: O `frontend/` não deve fazer queries SQL diretas, apenas consumir os *endpoints* disponibilizados pelo `backend/`.
3.  Documente novos módulos criados no NestJS e atualize este README caso a infraestrutura mude.

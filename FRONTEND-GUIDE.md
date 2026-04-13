# Hermes — Frontend Guide

## Visão Geral

**Hermes** é o frontend standalone do produto **Dashfly AI** (`ai.dashfly.com.br`).

Surgiu como projeto separado do `martial` (dashboard principal da Dashfly) porque, no futuro, clientes **fora da Dashfly** também poderão usar o módulo AI — e o frontend precisa funcionar de forma independente, sem acoplamento à plataforma Dashfly.

### Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 15 (App Router, `src/` dir) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS v4 (inline `@theme`, sem config file) |
| Ícones | `@hugeicons/react` + `@hugeicons/core-free-icons` (primário) · `lucide-react` (secundário) |
| Formulários | `react-hook-form` + `@hookform/resolvers` + `zod` |
| HTTP | `axios` |
| Server State | `@tanstack/react-query` |
| Toasts | `sonner` |
| Gráficos | `recharts` |
| UI headless | `@headlessui/react` |
| Class utils | `clsx` + `tailwind-merge` (via `cn()`) |
| Animações | `tw-animate-css` |
| Datas | `date-fns` |
| Auth | JWT via cookie (mesmo backend `aquila`) |

### Backend

O backend é o `aquila` (NestJS). Autenticação via cookie JWT já usado no `martial`. As rotas relevantes ao AI estão documentadas no `aquila/docs/ai-dashfly-arquitetura.md`.

---

## Design System — baseado no `martial`

O objetivo é que **hermes seja visualmente idêntico ao martial**. Tudo abaixo foi extraído do código real do martial.

### Tailwind v4 — configuração

Tailwind v4 não usa `tailwind.config.js`. Toda customização vai inline no `globals.css` dentro de `@theme {}`:

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  --font-syne: var(--font-syne), sans-serif;

  /* Containers & Box */
  --color-background: #111116;
  --color-container: #16161b;
  --color-containerHover: #1b1b20;
  --color-secondaryContainer: #100f16;
  --color-secondaryContainerHover: #15141b;
  --color-border: #1f1f24;

  /* Landing Page */
  --color-landingBackground: #030014;
  --color-landingText: #efedfd99;
  --color-landingDarkText: #d9d5fd;
  --color-landingStroke: #5f5380;
  --color-landingPrimary: #220841;

  /* Brand */
  --color-primary: #6b1bad;
  --color-lightPrimary: #b084e1;
  --color-primaryHover: #8122c2;
  --color-primaryStroke: #71578d;

  /* Textos */
  --color-darkText: #a4a4b2;
  --color-textHover: #b8b8c6;
  --color-textLight: #d0d0e1;
  --color-primaryText: #975fc6;
  --color-lightPrimaryText: #b084e1;

  /* Alertas */
  --color-greenAlert: #06d679;
  --color-redAlert: #ea4335;
  --color-yellowAlert: #fbbc04;
  --color-blueAlert: #4285f4;

  --animate-spinner: spinner 1s linear infinite;

  @keyframes spinner {
    0%   { opacity: 0.85; }
    50%  { opacity: 0.25; }
    100% { opacity: 0.25; }
  }
}

* {
  --font-inter: "Inter", sans-serif;
  --font-syne: "Syne", sans-serif;
  scrollbar-color: auto;
  scrollbar-width: auto;
}

button:disabled { cursor: not-allowed; }
button, a { cursor: pointer; }
body { font-family: var(--font-inter); }

::-webkit-scrollbar { margin-right: 0.5rem; height: 0.25rem; width: 0.45rem; }
::-webkit-scrollbar-corner { background-image: none; border-style: none; }
::-webkit-scrollbar-thumb { cursor: move; border-radius: 0.625rem; background-color: var(--color-border); }
::-webkit-scrollbar-track { border-style: none; background-color: transparent; }

/* Autofill fix para inputs escuros */
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0px 900px #16161b inset !important;
  -webkit-text-fill-color: white !important;
  transition: background-color 9999s ease-in-out 0s;
}
```

---

### Tipografia

Fontes carregadas via `next/font/google` no `layout.tsx` raiz:

```tsx
import { Inter, Syne } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["200", "400", "600"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400"],
});
```

- **Inter** → fonte base do body (`font-family: var(--font-inter)`)
- **Syne** → usada em títulos/highlights com `font-syne`

Body recebe `${inter.variable} ${syne.variable} antialiased bg-background`.

---

### Ícones

Biblioteca principal: **HugeIcons**

```tsx
import { Analytics01Icon, TokenSquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

<HugeiconsIcon icon={Analytics01Icon} size={21} className="text-darkText" />
```

- `@hugeicons/core-free-icons` → exporta os objetos de ícone
- `@hugeicons/react` → exporta `HugeiconsIcon` (componente renderizador)
- Props comuns: `size` (número), `className` (para cor via Tailwind)

Secundário: `lucide-react` — usado pontualmente quando o ícone não existe no HugeIcons.

---

### Layout Padrão (Dashboard)

```
┌────────────────────────────────────────────────────────┐
│  Header (fixed, top-0, w-full, h-20, bg-secondaryContainer, border-b border-border) │
├──────────┬─────────────────────────────────────────────┤
│          │                                             │
│ Sidebar  │  <main>                                     │
│ (fixed,  │   pt-20 md:pl-56                           │
│  w-56,   │   w-full                                    │
│  h-screen│   md:h-screen overflow-y-auto               │
│  bg-sec- │                                             │
│  ondary- │                                             │
│  Contain-│                                             │
│  er,     │                                             │
│  border-x│                                             │
│  border- │                                             │
│  border) │                                             │
└──────────┴─────────────────────────────────────────────┘
```

**Sidebar** (`w-56`, `h-screen`, `fixed`, `z-29`, `pt-30`, `bg-secondaryContainer`, `border-x border-border`, `p-4`):
- Mobile: oculta por padrão com `-translate-x-full`, abre com `translate-x-0`
- Desktop: sempre visível com `md:translate-x-0`
- Item ativo: `bg-container text-white border-border` + indicador lateral `w-[6px] h-8 rounded-r-full bg-border absolute left-0`
- Item inativo: `text-darkText hover:bg-container hover:text-white border-transparent`

**Header** (`fixed`, `w-full`, `bg-secondaryContainer`, `border-b border-border`):
- Padding: `md:p-5 md:px-10 max-md:p-4`
- z-index: `z-30`

---

### Componentes de UI

#### `cn()` utility

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Colocar em `src/lib/utils.ts`.

#### Toaster (Sonner)

```tsx
import { Toaster } from "sonner";

<Toaster
  toastOptions={{
    style: { backgroundColor: "#16161b" },
  }}
  theme="dark"
  icons={{
    error: <HugeiconsIcon icon={AlertCircleIcon} size={20} className="text-red-500" />,
  }}
/>
```

#### Botões — padrões comuns

```tsx
// Primário
<button className="bg-primary hover:bg-primaryHover text-white rounded-lg px-4 py-2 transition-colors">

// Secundário / outline
<button className="bg-container border border-border text-darkText hover:bg-containerHover hover:text-white rounded-lg px-4 py-2 transition-colors">

// Desabilitado
<button disabled className="cursor-not-allowed opacity-50 ...">
```

#### Input

```tsx
<input className="bg-container border border-border rounded-lg px-4 py-2 text-white placeholder:text-darkText focus:outline-none focus:border-primaryStroke w-full" />
```

#### Card / Container

```tsx
<div className="bg-container border border-border rounded-xl p-4">
  {/* conteúdo */}
</div>
```

#### Badge de status

```tsx
// Ativo / BETA / label
<span className="text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded-full bg-primary/20 text-lightPrimary border border-primaryStroke/30">
  BETA
</span>
```

---

### Paleta de Cores — Referência Rápida

| Token | Hex | Uso |
|---|---|---|
| `background` | `#111116` | Fundo da página |
| `container` | `#16161b` | Cards, inputs, sidebar items ativos |
| `containerHover` | `#1b1b20` | Hover em containers |
| `secondaryContainer` | `#100f16` | Sidebar, header |
| `secondaryContainerHover` | `#15141b` | Hover em secondary container |
| `border` | `#1f1f24` | Bordas de cards, dividers |
| `primary` | `#6b1bad` | Cor da marca, botões primários |
| `lightPrimary` | `#b084e1` | Ícones AI, highlights |
| `primaryHover` | `#8122c2` | Hover em primary |
| `primaryStroke` | `#71578d` | Bordas de elementos primários |
| `darkText` | `#a4a4b2` | Texto secundário |
| `textHover` | `#b8b8c6` | Texto em hover |
| `textLight` | `#d0d0e1` | Texto mais claro |
| `primaryText` | `#975fc6` | Texto com cor da marca |
| `lightPrimaryText` | `#b084e1` | Texto AI/primário claro |
| `greenAlert` | `#06d679` | Sucesso |
| `redAlert` | `#ea4335` | Erro |
| `yellowAlert` | `#fbbc04` | Aviso |
| `blueAlert` | `#4285f4` | Info |

---

### Providers (estrutura do `layout.tsx` raiz)

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${syne.variable} antialiased bg-background`}>
        <Toaster ... />
        <QueryProvider>       {/* TanStack Query */}
          <AuthProvider>     {/* Context de autenticação JWT */}
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

### Estrutura de Pastas Planejada

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, providers, toaster)
│   ├── globals.css             # @theme + reset global
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   └── (dashboard)/
│       ├── layout.tsx          # Sidebar + Header
│       ├── page.tsx            # Home / overview
│       ├── conversations/
│       │   └── page.tsx        # Lista de conversas AI
│       ├── emails/
│       │   └── page.tsx        # Caixa de entrada AI
│       ├── automations/
│       │   └── page.tsx        # Regras de automação
│       └── settings/
│           └── page.tsx        # Configurações da conta
├── components/
│   ├── ui/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   └── QueryProvider.tsx
├── contexts/
│   └── AuthContext.tsx
├── services/
│   └── api.ts                  # Instância axios configurada
└── lib/
    └── utils.ts                # cn()
```

---

### Dependências para instalar

```bash
npm install \
  @hugeicons/react @hugeicons/core-free-icons \
  @headlessui/react \
  @hookform/resolvers \
  @tanstack/react-query \
  axios \
  class-variance-authority \
  clsx \
  date-fns \
  lucide-react \
  nookies \
  react-hook-form \
  recharts \
  sonner \
  tailwind-merge \
  tw-animate-css \
  zod

npm install -D @tailwindcss/postcss
```

---

### Notas de Implementação

1. **Autofill no dark mode**: inputs com `-webkit-autofill` precisam do hack CSS listado no `globals.css` (cor de fundo inset `#16161b`) — caso contrário o browser sobrepõe fundo branco.

2. **Tailwind v4 e classes arbitrárias**: a sintaxe `bg-primary/8`, `from-primary/20`, etc. funciona nativamente no v4. Não é necessário configurar `safelist`.

3. **HugeIcons import**: os ícones são **named exports** de `@hugeicons/core-free-icons`. O componente renderizador é sempre `HugeiconsIcon` de `@hugeicons/react`. Não misturar — `HugeiconsIcon` não aceita `children`, apenas `icon` prop.

4. **Sidebar mobile**: o estado `openSidebar` fica em um Context (`HeaderConfigContext`). O Header controla o toggle via `setOpenSidebar`. O z-index da sidebar é `z-29`, o do header é `z-30`.

5. **`recharts`**: fixar na versão `2.15.4` (mesma do martial) para evitar breaking changes.

---

## Estrutura de Pastas Final (Expandida)

```
src/
├── app/
│   ├── layout.tsx                          # Root layout (fonts, providers, toaster)
│   ├── globals.css                         # @theme + reset global
│   ├── (auth)/
│   │   ├── layout.tsx                      # Layout público (sem sidebar)
│   │   └── login/
│   │       └── page.tsx                    # Tela de login
│   ├── (dashboard)/
│   │   ├── layout.tsx                      # Layout com Sidebar + Header
│   │   ├── page.tsx                        # Visão geral / Overview
│   │   ├── conversations/
│   │   │   ├── page.tsx                    # Lista de conversas de email (inbox)
│   │   │   └── [id]/
│   │   │       └── page.tsx                # Thread de conversa individual
│   │   ├── automations/
│   │   │   └── page.tsx                    # Métricas + unsubscribes + disputas
│   │   └── settings/
│   │       └── page.tsx                    # Configurações do AI (tabs)
│   └── unsubscribe/
│       └── page.tsx                        # Página pública de descadastro
├── components/
│   ├── ui/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx                       # Status badges (pending, sent, etc)
│   │   ├── Toggle.tsx                      # Switch on/off para configurações
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx                       # Modal genérico via @headlessui
│   │   ├── Spinner.tsx                     # Loading spinner
│   │   ├── EmptyState.tsx                  # Tela vazia com ícone + mensagem
│   │   └── StreamingText.tsx              # Componente para exibir SSE progressivo
│   ├── conversations/
│   │   ├── ConversationList.tsx
│   │   ├── ConversationRow.tsx
│   │   ├── ConversationThread.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ApprovalActions.tsx            # Botões aprovar/rejeitar/editar-e-aprovar
│   ├── automations/
│   │   ├── AutomationStatsCards.tsx
│   │   ├── UnsubscribeTable.tsx
│   │   └── DisputeDraftCard.tsx
│   ├── settings/
│   │   ├── AssistantIdentityForm.tsx
│   │   ├── SharingTogglesForm.tsx
│   │   ├── EmailSettingsForm.tsx
│   │   ├── InboundEmailsManager.tsx
│   │   ├── CartAttemptsEditor.tsx         # Editor de tentativas (array dinâmico)
│   │   ├── PostPurchaseForm.tsx
│   │   ├── ReengagementForm.tsx
│   │   ├── CustomTextsForm.tsx            # Política de troca/envio + FAQ + SSE
│   │   └── BlacklistEditor.tsx            # Editor de palavras blacklistadas
│   ├── subscription/
│   │   ├── PlanCard.tsx
│   │   └── SubscriptionBanner.tsx         # Banner quando sem plano ou overdue
│   └── QueryProvider.tsx
├── contexts/
│   ├── AuthContext.tsx                     # JWT + store selecionada
│   └── HeaderConfigContext.tsx            # openSidebar state
├── hooks/
│   ├── useConversations.ts
│   ├── useAiSettings.ts
│   ├── useAutomationStats.ts
│   ├── useDisputeDrafts.ts
│   ├── useSubscription.ts
│   └── useStreamingContent.ts            # Hook para SSE (geração de texto por IA)
├── services/
│   ├── api.ts                             # Instância axios com interceptors
│   ├── conversations.service.ts
│   ├── ai-settings.service.ts
│   ├── automations.service.ts
│   ├── disputes.service.ts
│   └── subscription.service.ts
├── types/
│   ├── conversation.types.ts
│   ├── ai-settings.types.ts
│   ├── automation.types.ts
│   └── subscription.types.ts
└── lib/
    └── utils.ts                           # cn()
```

---

## Plano de Implementação

> **Legenda:** `[ ]` = pendente · `[x]` = concluído · `[~]` = em progresso

---

### Fase 0 — Setup Base

- [x] Instalar todas as dependências listadas na seção anterior
- [x] Substituir `layout.tsx` raiz: Inter + Syne via `next/font/google`, providers, Toaster
- [x] Criar `src/app/globals.css` com `@theme` completo (cores, animações, scrollbar, autofill fix)
- [x] Criar `src/lib/utils.ts` com `cn()`
- [x] Criar `src/services/api.ts` — instância axios com Bearer token do cookie, interceptor de refresh (401 → tenta refresh → redirect login)
- [x] Criar `src/components/QueryProvider.tsx` — wrapper de `QueryClientProvider`
- [x] Criar `src/contexts/AuthContext.tsx` — lê JWT do cookie, expõe `user`, `storeId`, `isAuthenticated`, `login`, `logout`
- [x] Criar `src/contexts/HeaderConfigContext.tsx` — expõe `openSidebar` + `setOpenSidebar`
- [x] Configurar variáveis de ambiente: `NEXT_PUBLIC_API_URL` (`.env.local`)
- [x] Copiar `favicon.ico` do martial (`src/app/favicon.ico`)
- [x] Copiar logos do martial para `public/assets/` (`horizontal-logo.svg`, `logo.svg`, `dashfly-logo-roxa.png`)

> **Atenção:** o middleware deve sempre excluir `assets/` no matcher para não bloquear arquivos estáticos. Padrão correto: `(?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets/)`. Usar `next/image` normalmente para SVGs — o problema de logo não carregar é sempre o middleware interceptando `/assets/*`, não o componente Image.

---

### Fase 1 — Autenticação

- [x] Criar rota `(auth)/layout.tsx` — layout limpo, fundo `bg-background`, sem sidebar
- [x] Criar `(auth)/login/page.tsx` — formulário de login com `react-hook-form` + `zod`
  - [x] Campos: email + senha (com toggle show/hide)
  - [x] Validação com Zod v4
  - [x] Submit → `POST /auth/login` via axios → `login()` do AuthContext seta cookie e redireciona
  - [x] Redirecionamento para `/` ao autenticar
  - [x] Loading state no botão de submit (spinner inline)
  - [x] Toast de erro em falha
  - [x] Redirect para `/` se já autenticado (middleware)
- [x] Criar middleware `src/middleware.ts` — protege todas as rotas, redireciona sem cookie para `/login`, permite `/unsubscribe` sem auth

---

### Fase 2 — Layout do Dashboard

- [x] Criar `src/components/ui/Sidebar.tsx`
  - [x] Links de navegação: Visão Geral, Conversas, Automações, Configurações
  - [x] Ícones HugeIcons para cada item
  - [x] Item ativo: `bg-container text-white` + indicador lateral roxo
  - [x] Comportamento mobile: `-translate-x-full` → `translate-x-0` via `HeaderConfigContext`
  - [x] Overlay escuro ao abrir no mobile
  - [x] Info do usuário + botão logout no rodapé
- [x] Criar `src/components/ui/Header.tsx`
  - [x] Botão hamburger mobile que abre sidebar via `setOpenSidebar`
  - [x] Logo Dashfly centralizada com link para `/`
  - [x] Badge `AI` no canto direito
- [x] Criar `(dashboard)/layout.tsx` — `HeaderConfigProvider` + Header + Sidebar + `<main pt-20 md:pl-56>`
- [x] Criar `(dashboard)/page.tsx` — placeholder "Visão Geral"
- [x] Criar componentes UI base reutilizáveis:
  - [x] `Badge.tsx` — variantes: pending/sent/approved/rejected/blacklist/success/warning/info/default
  - [x] `Toggle.tsx` — switch acessível via `@headlessui/react` com label + description
  - [x] `Spinner.tsx` — spinner animado (sm/md/lg)
  - [x] `EmptyState.tsx` — ícone + título + subtítulo + action slot
  - [x] `Modal.tsx` — `Dialog` do headlessui com overlay backdrop-blur, animação de entrada/saída
  - [ ] `StreamingText.tsx` — textarea que recebe texto via SSE progressivamente (Fase 6)

---

### Fase 3 — Visão Geral (Overview)

**Rota:** `(dashboard)/page.tsx`

- [x] Cards de métricas rápidas (busca em `/automations/:storeId/stats`):
  - [x] Total de conversas no mês
  - [x] Emails processados no mês
  - [x] Jobs de automação disparados
  - [x] Emails pendentes de aprovação (card amarelo com alerta se > 0)
- [x] Banner de onboarding quando AI não está ativa (`ai-settings.isActive === false`)
  - [x] CTA "Ativar agora" → `POST /ai-settings/:storeId/activate` com loading state
- [x] Seção "Pendentes de aprovação" — lista das últimas 5 conversas pendentes com badge de blacklist
- [x] Seção "Disputas abertas" — banner vermelho clicável com contagem + link para automações
- [x] Skeleton loaders (pulse) enquanto carrega em cards e lista

---

### Fase 4 — Conversas (Inbox de Email)

**Rota:** `(dashboard)/conversations/page.tsx`

- [x] `src/services/conversations.service.ts` — list, getById, approve, reject, editAndApprove
- [x] `src/hooks/useConversations.ts` — useConversations, useConversation, useApproveConversation, useRejectConversation, useEditAndApprove
- [x] `(dashboard)/conversations/page.tsx`
  - [x] Tabs de filtro por status: Todas · Pendente · Enviado · Aprovado · Rejeitado · Blacklist
  - [x] `ConversationRow` com email, assunto, badge de status, blacklist indicator, tempo relativo
  - [x] Skeleton loaders e estado vazio
  - [x] Filtro via query string (`?status=...`) com `useSearchParams`
- [x] `(dashboard)/conversations/[id]/page.tsx`
  - [x] `MessageBubble` — balão INBOUND (cinza) vs OUTBOUND (roxo) com métricas de entrega
  - [x] `ApprovalActions` — aprovar, rejeitar, editar e enviar (com textarea de edição inline)
  - [x] Alert banner de blacklist no topo quando `blacklistTriggered: true`
  - [x] Breadcrumb de volta para lista
  - [x] Skeleton loader e estado de não encontrado

---

### Fase 5 — Automações

**Rota:** `(dashboard)/automations/page.tsx`

- [x] `src/services/automations.service.ts`
  - [x] `getStats(storeId)` → `GET /automations/:storeId/stats`
  - [x] `listUnsubscribes(storeId)` → `GET /automations/:storeId/unsubscribes`
  - [x] `removeUnsubscribe(storeId, email)` → `DELETE /automations/:storeId/unsubscribes/:email`
- [x] `src/services/disputes.service.ts` (incluído em automations.service.ts)
  - [x] `listDrafts(storeId)` → `GET /dispute-drafts/:storeId`
  - [x] `updateDraft(id, content)` → `PATCH /dispute-drafts/:id`
  - [x] `dismissDraft(id)` → `POST /dispute-drafts/:id/dismiss`
- [x] `src/components/automations/AutomationStatsCards.tsx`
  - [x] Cards: conversas no mês / emails processados / jobs de automação
- [x] `src/components/automations/UnsubscribeTable.tsx`
  - [x] Tabela de emails descadastrados com scope (ALL / CART / REENGAGEMENT)
  - [x] Botão "Remover da blacklist" com confirmação modal
- [x] **Seção de Disputas (Chargebacks)**
  - [x] `src/components/automations/DisputeDraftCard.tsx`
    - [x] Mostra: número do pedido, valor em disputa, motivo, rascunho de contestação
    - [x] Área de edição do rascunho
    - [x] Botão "Marcar como submetida" → `POST /dispute-drafts/:id/dismiss` com status `submitted`
    - [x] Botão "Descartar" → `POST /dispute-drafts/:id/dismiss` com status `dismissed`
    - [x] Badge de status: `pending_review` (amarelo) · `submitted` (verde) · `dismissed` (cinza)

---

### Fase 6 — Configurações do AI

**Rota:** `(dashboard)/settings/page.tsx`

Esta é a página mais complexa. Implementar com tabs ou seções colapsáveis.

- [x] `src/services/ai-settings.service.ts`
  - [x] `getSettings(storeId)` → `GET /ai-settings/:storeId`
  - [x] `updateSettings(storeId, data)` → `PATCH /ai-settings/:storeId`
  - [x] `listInboundEmails(storeId)` → `GET /ai-settings/:storeId/inbound-emails`
  - [x] `addInboundEmail(storeId, data)` → `POST /ai-settings/:storeId/inbound-emails`
  - [x] `deleteInboundEmail(storeId, id)` → `DELETE /ai-settings/:storeId/inbound-emails/:id`
- [x] `src/hooks/useAiSettings.ts` — wrapper TanStack Query com `invalidateQueries` no mutate
- [x] Estrutura da página: nav vertical com 7 tabs

#### 6.1 Identidade do Assistente
- [x] `src/components/settings/AssistantIdentityForm.tsx`
  - [x] Campo: Nome do assistente (input)
  - [x] Select: Idioma padrão (PT | EN)
  - [x] Select: Tom de voz (amigável / formal / casual)
  - [x] Textarea: Personalidade livre (texto descritivo)
  - [x] Botão Salvar com loading state

#### 6.2 Controle de Informações Compartilháveis
- [x] `src/components/settings/SharingTogglesForm.tsx`
  - [x] Toggle: Compartilhar código de rastreio
  - [x] Toggle: Compartilhar detalhes do pedido
  - [x] Toggle: Compartilhar status de estoque
  - [x] Toggle: Compartilhar política de troca
  - [x] Toggle: Compartilhar prazo estimado de entrega
  - [x] Toggle: Compartilhar preços de produtos
  - [x] Auto-save ao alterar toggle (PATCH imediato)

#### 6.3 Configurações de Email
- [x] `src/components/settings/EmailSettingsForm.tsx`
  - [x] Toggle: Resposta automática ativa
  - [x] Toggle: Exigir aprovação antes de enviar
  - [x] Toggle: Detecção automática de idioma
  - [x] Input: Nome do remetente
  - [x] Textarea: Assinatura customizada
- [x] `src/components/settings/BlacklistEditor.tsx`
  - [x] Lista de palavras/temas que forçam revisão manual
  - [x] Input + botão "Adicionar" para inserir nova palavra
  - [x] Badge removível para cada palavra existente
- [x] `src/components/settings/InboundEmailsManager.tsx`
  - [x] Lista de endereços de entrada configurados
  - [x] Cada item mostra: label, inboundAddress + botão copiar, fromAddress, botão remover
  - [x] Formulário "Adicionar endereço": label + fromAddress
  - [x] Instruções de configuração de SPF/DKIM (seção expandível)

#### 6.4 Carrinho Abandonado
- [x] `src/components/settings/CartAttemptsEditor.tsx`
  - [x] Toggle: Feature ativa ou não
  - [x] Lista dinâmica de tentativas: toggle enabled, input delayHours, select tone, toggle useAiGenerated
  - [x] Se `useAiGenerated: false`: textarea `customMessage` com variáveis
  - [x] Toggle discountEnabled + input discountPercent (se ativo)
  - [x] Botão remover tentativa
  - [x] Botão "Adicionar tentativa" (bloqueado se atingiu MAX_ATTEMPTS)
  - [x] Painel de variáveis disponíveis para referência

#### 6.5 Pós-compra
- [x] `src/components/settings/PostPurchaseForm.tsx`
  - [x] Toggle: Feature ativa
  - [x] Toggle: Enviar confirmação de pedido
  - [x] Toggle: Enviar email com código de rastreio no fulfillment
  - [x] Toggle: Fazer upsell de produto complementar

#### 6.6 Reengajamento
- [x] `src/components/settings/ReengagementForm.tsx`
  - [x] Toggle: Feature ativa
  - [x] Input: Dias de inatividade para disparar (número)

#### 6.7 Textos Customizados
- [x] `src/components/settings/CustomTextsForm.tsx`
  - [x] Seção "Política de Troca": textarea + Gerar com IA (SSE) + Salvar
  - [x] Seção "Política de Envio": mesma estrutura, endpoint `generate/shipping-policy`
  - [x] Seção "FAQ": mesma estrutura, endpoint `generate/faq`
  - [x] `src/components/ui/StreamingText.tsx` — textarea SSE progressiva com auto-scroll
  - [x] `src/hooks/useStreamingContent.ts` — fetch + ReadableStream, AbortController

---

### Fase 7 — Assinatura

- [x] `src/services/subscription.service.ts`
  - [x] `getPlans()` → `GET /ai/plans`
  - [x] `getSubscription(storeId)` → `GET /stores/:storeId/ai/subscription`
  - [x] `subscribe(storeId, planId)` → `POST /stores/:storeId/ai/subscribe`
  - [x] `cancel(storeId)` → `DELETE /stores/:storeId/ai/cancel`
- [x] `src/hooks/useSubscription.ts` — `useAiPlans`, `useAiSubscription`, `useSubscribeAi`, `useCancelAiSubscription`
- [x] `src/components/subscription/PlanCard.tsx`
  - [x] Nome do plano, preço, features (chatWidget, email, automações, etc.)
  - [x] CTA "Assinar" com nota de cobrança pro-rata na página
  - [x] Plano atual marcado com badge "Plano atual" + borda destacada
  - [x] Barras de uso mensal (emails, conversas, jobs)
- [x] `src/components/subscription/SubscriptionBanner.tsx`
  - [x] Exibido no topo quando sem assinatura ou status `OVERDUE` ou `CANCELED`
  - [x] Mensagem + CTA para regularizar
- [x] `src/components/subscription/SubscriptionBannerWrapper.tsx` — wrapper client-side (layout é Server Component)
- [x] `src/app/(dashboard)/subscription/page.tsx` — status atual, uso do mês, grid de planos
- [x] Integrar banner em `(dashboard)/layout.tsx` via `SubscriptionBannerWrapper`
- [x] Sidebar atualizada com item "Assinatura" + ícone `CreditCardIcon`

---

### Fase 8 — Página Pública de Unsubscribe

**Rota:** `app/unsubscribe/page.tsx` (fora do grupo `(dashboard)`, sem auth)

- [x] Lê `?token=<uuid>` da URL
- [x] `GET /unsubscribe?token=<uuid>` via `fetch` puro (sem auth interceptor) → exibe confirmação de sucesso ou erro
- [x] Design simples: logo Dashfly AI + mensagem clara ao cliente final
- [x] Exibe o scope do descadastro (ALL / CART / REENGAGEMENT) quando retornado pelo backend
- [x] Sem Sidebar/Header — layout standalone (usa root layout apenas)
- [x] 4 estados: `loading`, `success`, `error`, `invalid` (sem token na URL)

---

### Fase 9 — Admin: Planos AI (dashflyadmin)

**Projeto:** `dashflyadmin` — painel interno da Dashfly

- [x] `src/app/(admin)/ai-plans/page.tsx` — lista com DataTable, botão "Novo Plano AI"
- [x] `src/app/(admin)/ai-plans/columns.tsx` — colunas com badges booleanos de features + ações editar/excluir
- [x] `src/app/(admin)/ai-plans/ai-plan-form-dialog.tsx` — dialog com todos os campos do `AiPlan`:
  - [x] Identificação: nome, slug, preço
  - [x] Features (Checkbox): chatWidget, emailResponse, automações, disputas, integração Dashfly
  - [x] Limites: inboundEmailsLimit, emailsPerMonthLimit, conversationsPerMonth, automationJobsPerMonth, maxCartAttempts
- [x] Sidebar do admin atualizada com item "Planos AI" + ícone `BotIcon`

---

### Tipos TypeScript

- [x] `src/types/conversation.types.ts`
  ```ts
  type ConversationStatus = 'pending_manual_review' | 'approved' | 'sent' | 'rejected' | 'blacklist'
  type MessageDirection = 'INBOUND' | 'OUTBOUND'
  type DeliveryStatus = 'DELIVERED' | 'BOUNCED' | 'DEFERRED'

  interface EmailConversation { id, storeId, customerEmail, subject, status, blacklistTriggered, spamReported, createdAt, messages: EmailMessage[] }
  interface EmailMessage { id, direction, content, timestamp, deliveryStatus, openCount, clickCount, firstOpenedAt }
  ```
- [x] `src/types/ai-settings.types.ts`
  ```ts
  interface CartAttempt { enabled, delayHours, tone, useAiGenerated, customMessage, discountEnabled, discountPercent }
  interface AiSettings { assistantName, language, tone, personality, shareTrackingCode, shareOrderDetails, shareInventoryStatus, shareExchangePolicy, shareDeliveryTime, shareProductPrices, emailResponseActive, emailRequireApproval, emailFromName, emailSignature, autoDetectLanguage, subjectBlacklist: string[], cartAbandonment: { enabled, attempts: CartAttempt[] }, postPurchase: { enabled, sendOrderConfirmation, sendTrackingEmail, upsellEnabled }, reengagement: { enabled, inactivityDays }, exchangePolicy, shippingPolicy, faq }
  ```
- [x] `src/types/automation.types.ts`
  ```ts
  interface AutomationStats { cartJobsTotal, cartJobsMonth, postPurchaseEmailsMonth, reengagementEmailsMonth, emailsProcessedMonth }
  interface UnsubscribeRecord { customerEmail, scope, unsubscribedAt }
  interface DisputeDraft { id, shopifyDisputeId, orderNumber, amount, reason, draftContent, status, createdAt }
  ```
- [x] `src/types/subscription.types.ts`
  ```ts
  interface AiPlan { id, name, slug, price, chatWidgetEnabled, emailResponseEnabled, automationsEnabled, disputeAlertsEnabled, emailsPerMonthLimit, conversationsPerMonth, maxCartAttempts }
  interface AiStoreSubscription { id, storeId, plan: AiPlan, status, currentPeriodEnd }
  ```

---

### Considerações de UX / Detalhe

- **SSE (Server-Sent Events):** usar `EventSource` nativo ou `fetch` com `ReadableStream` para os endpoints de geração de conteúdo. O texto deve aparecer progressivamente na textarea, caracter a caracter. Ao terminar, habilitar o botão "Salvar".
- **PATCH otimista:** nos toggles de configuração, aplicar a mudança localmente imediatamente e fazer rollback se o PATCH falhar, com toast de erro.
- **Blacklist visual:** emails com `blacklistTriggered: true` nas conversas devem ter indicador vermelho distinto (ex: tag "⚠ Blacklist") para diferenciar de aprovação normal pendente.
- **Limite de plano:** bloquear UI de adicionar tentativa de carrinho quando `attempts.length >= plan.maxCartAttempts`, exibindo tooltip explicativo.
- **Métricas de entrega:** na thread de conversa, exibir chips discretos de `opened`, `clicked`, `bounced` ao lado da mensagem enviada.

---

## Princípios de Linguagem e UX para Lojistas

> Hermes é usado por **lojistas**, não por engenheiros. Toda a interface deve ser acessível para alguém sem conhecimento técnico.

### Regras de linguagem

1. **Nunca use jargão técnico sem explicação.** SPF, DKIM, DNS, webhook, payload — se precisar aparecer, sempre acompanhado de uma explicação em linguagem simples.
2. **Foque no benefício, não na mecânica.** Em vez de "Configure SPF/DKIM", escreva "Evite que os emails caiam no spam dos seus clientes".
3. **Use a segunda pessoa e linguagem ativa.** "Você pode ativar", "Sua loja envia", não "O sistema irá".
4. **Contextualize com exemplos reais.** Ao explicar variáveis como `{{firstName}}`, mostre um exemplo de frase real.

### Nomenclatura de tabs nas Configurações

| Técnico (evitar) | Amigável (usar) |
|---|---|
| Identidade do Assistente | Seu Assistente |
| Controle de Informações Compartilháveis | O que pode ser respondido |
| Configurações de Email | Email e respostas |
| Carrinho Abandonado | Recuperar carrinhos |
| Pós-compra | Após a venda |
| Reengajamento | Clientes inativos |
| Textos Customizados | Textos da loja |

### Multi-loja — Sem suporte intencional

Hermes é um produto **por loja**. Cada login corresponde a uma única loja. **Não há seletor de loja na UI.** O `storeId` é resolvido automaticamente pelo AuthContext a partir do primeiro store do usuário. Se um merchant tem múltiplas lojas na Dashfly, ele usa contas separadas — isso é intencional (simplifica a UI e isola dados).

### Onboarding — Novo lojista ✅ IMPLEMENTADO

**Rota:** `src/app/(onboarding)/onboarding/page.tsx` — layout limpo sem sidebar, acionado pelo botão "Ativar agora" no dashboard.

**Fluxo atual (4 passos):**
1. Email da loja → `InboundEmailsManager` incorporado, "Próximo" só ativo com email conectado
2. Como responder → 2 toggles em cards: automático + revisão manual
3. Nome e tom → input de nome + seleção visual de tom (radio estilizado)
4. Tudo pronto! → checklist do que acontece + botão "Ir para o painel"

"Configurar depois → Ir para o painel" disponível em todos os passos.

O botão "Ativar agora" no dashboard redireciona para `/onboarding` após ativar (sem toast).

---

Especificação original (referência):

Quando um lojista acessa pela primeira vez (settings sem inboundEmail configurado e `isActive === false`), mostrar um **wizard de onboarding de 3 passos** antes das configurações normais:

#### Passo 1 — "Como seu assistente vai se chamar?"
- Campo: Nome do assistente
- Campo: Tom de voz (amigável / formal / casual)
- Linguagem: "Seu assistente vai falar com seus clientes. Dê um nome e escolha o jeito de falar."

#### Passo 2 — "Conecte o email da sua loja"
- Este é o passo mais crítico e mais técnico. Precisa de máxima clareza:

**Como explicar email/SPF/DKIM para leigos:**

```
Título: "Conecte o email da sua loja"
Subtítulo: "Para o assistente responder emails dos seus clientes, precisamos vincular o 
            email que sua loja usa para atendimento."

Como funciona (accordion "Entenda em 30 segundos"):
  1. Você nos informa o email da sua loja (ex: contato@sujaloja.com.br)
  2. Criamos um endereço especial que recebe as mensagens dos seus clientes
  3. O assistente lê, entende e responde automaticamente

Por que preciso configurar o DNS?
  "DNS é como a lista telefônica do seu site. Ao adicionar as informações abaixo, 
   você está dizendo para o mundo que os emails enviados pelo Dashfly AI são oficialmente 
   da sua loja — isso evita que caiam no spam dos seus clientes."
  "Você vai no painel do lugar onde comprou seu domínio (GoDaddy, Registro.br, 
   Hostinger, Cloudflare, etc.) e cola as informações que geramos para você."

CTA: "Precisa de ajuda? Fale com nosso suporte →"
```

#### Passo 3 — "Pronto para ativar?"
- Resumo do que foi configurado
- Botão "Ativar Dashfly AI" (POST /activate)
- Após ativar, redireciona para a visão geral

### Configuração de Email — Componente InboundEmailsManager

O componente precisa ser completamente reescrito com foco no lojista:

```
[Card] "Email da sua loja"
  Descrição: "Configure o email que seus clientes usam para falar com você.
              O assistente irá ler e responder essas mensagens."

[Se nenhum email configurado]
  Estado vazio amigável com ícone + "Nenhum email conectado ainda"
  CTA primário: "Conectar meu email"

[Formulário de adição]
  Label: "Endereço de email da loja" (não "fromAddress")
  Placeholder: "contato@sujaloja.com.br"
  
[Após adicionar]
  Card do email configurado mostrando:
  - Email da loja
  - Status: "Aguardando configuração DNS" ou "Configurado ✓"
  - Botão "Ver instruções de configuração"

[Accordion "Como configurar o DNS"]
  Título: "Evite que emails caiam no spam"
  Descrição amigável (não SPF/DKIM)
  
  Passo 1: "Acesse o painel do seu domínio"
    "O painel é o site onde você comprou ou gerencia seu domínio. 
     Exemplos: GoDaddy, Registro.br, Hostinger, Cloudflare, HostGator."
  
  Passo 2: "Adicione o primeiro registro (SPF)"
    "Este registro diz que o Dashfly AI tem permissão para enviar emails pela sua loja."
    Tipo: TXT | Nome: @ | Valor: [copiável]
  
  Passo 3: "Adicione o segundo registro (DKIM)"
    "Este registro é como uma assinatura digital nos emails — prova que são realmente seus."
    Tipo: TXT | Nome: [gerado] | Valor: [copiável]
  
  Aviso: "Pode levar até 24h para as configurações propagarem. 
          Fique tranquilo, é normal — você já pode usar o assistente enquanto isso."
  
  Link: "Precisa de ajuda? Nosso suporte te ajuda em minutos →"
```

---

### Fase 10 — Multi-loja (Store Switcher)

**Contexto:** O backend suporta múltiplas lojas por usuário (`user.stores[]`). O `AuthContext` já tem `setStoreId` e persiste em `localStorage`. Falta a UI para o merchant trocar de loja.

- [x] **Store Switcher no Header**
  - [x] Exibir nome + domínio da loja atual no Header (ao lado do logo, all breakpoints)
  - [x] Dropdown com todas as lojas do usuário (`user.stores`)
  - [x] Ao selecionar: chama `setStoreId(store.id)` + `queryClient.clear()` → hooks recarregam
  - [x] Se `user.stores.length === 1`: exibir apenas o nome da loja, sem dropdown
  - [x] Skeleton loader enquanto `user` é carregado

- [x] **Persistência e sincronização**
  - [x] No init: valida que `savedStoreId` pertence ao usuário logado; fallback para `stores[0]`
  - [x] Após profile load: re-valida novamente (cobre troca de conta com token reutilizado)

- [x] **UX de troca de loja**
  - [x] `queryClient.clear()` ao trocar de loja — todos os dados recarregam para a nova loja
  - [x] Toast de confirmação: "Loja alterada para [nome]"

---

### Fase 11 — Correções Críticas

#### 11.1 Bug visual: piscar do onboarding

**Causa:** Quando o usuário já tem subscription, a sequência de renders é:
1. `loadingSubscription = true` → spinner exibido ✓
2. `loadingSubscription = false, subscription != null` → page renderiza step 0 por 1 frame
3. `useEffect` dispara → `router.replace("/")` → redireciona

O frame entre 2 e 3 causa o piscar.

**Fix:** Incluir o caso "tem subscription em step 0" no guard de loading:

```tsx
// Em OnboardingPage, substituir:
if (loadingSubscription || loadingSettings || loadingEmails) { ... }

// Por:
if (loadingSubscription || loadingSettings || loadingEmails || (subscription && step === 0)) {
  return <Spinner />
}
```

- [x] Aplicar fix no `(onboarding)/onboarding/page.tsx`
- [ ] Testar o fluxo: usuário com plano ativo → acessa `/onboarding` → deve ir direto ao dashboard sem piscar

#### 11.2 Bug: storeId inválido no AuthContext após logout/troca de conta

- [x] Ao fazer logout, limpar `selectedStoreId` do `localStorage`
- [x] Ao logar com outro usuário, verificar se o `selectedStoreId` salvo pertence ao novo usuário antes de usar

#### 11.3 Subscription guard: loop infinito potencial

**Cenário:** `SubscriptionBannerWrapper` redireciona para `/onboarding` quando `subscription === null`. Se o usuário já tem subscription mas o hook retorna `null` momentaneamente (loading), pode causar redirect indevido.

- [x] Adicionar guard: só redirecionar quando `authLoading === false && storeId !== null && isLoading === false && subscription === null`
- [ ] Testar: abrir dashboard com subscription ativa → não deve redirecionar nunca

---

### Fase 12 — Configuração de Email (Reestruturação Completa)

**Contexto e diagnóstico real:**

A configuração de email tem três camadas independentes, nenhuma delas completa hoje:

| Camada | O que é | Status atual |
|--------|---------|--------------|
| **Endereço inbound** | Criar o email interno Dashfly que recebe os encaminhamentos | ✅ Funciona |
| **Encaminhamento (Forwarding)** | Fazer o provedor do merchant encaminhar emails para o Dashfly | ⚠️ Só no onboarding, sem persistência de status, sem acesso nas settings |
| **Autenticação de domínio (SPF + DKIM)** | Autorizar o Dashfly a enviar emails como se fossem da loja | ❌ Só instruções estáticas, sem status, sem verificação |

> **Sobre MX records:** este produto usa **encaminhamento**, não entrega direta por MX. O merchant **não precisa** e **não deve** mexer nos seus registros MX. Isso deve ser comunicado explicitamente na UI para evitar confusão.

---

#### 12.0 Backend: adicionar status de forwarding ao `StoreInboundEmail` (aquila)

**Este é o pré-requisito de tudo.** Hoje o modelo `StoreInboundEmail` não persiste se o forwarding foi configurado. O OAuth faz o trabalho mas nunca marca o registro. Se o merchant faz onboarding e pula o forwarding, não há como saber — nem como reconfigurar nas settings.

**Migração necessária:**

```prisma
model StoreInboundEmail {
  // ... campos existentes ...

  // NOVO: status do encaminhamento
  forwardingProvider    String?   // "gmail" | "microsoft" | "manual" | null
  forwardingConfiguredAt DateTime?
  forwardingStatus      String    @default("pending") 
  // "pending" | "awaiting_confirmation" | "configured"
}
```

- [ ] Criar migração Prisma: `npx prisma migrate dev --name add_forwarding_status`
- [ ] Atualizar `GmailForwardingService.handleCallback()`: ao final, fazer `prisma.storeInboundEmail.update({ where: { inboundAddress }, data: { forwardingProvider: 'gmail', forwardingStatus: 'awaiting_confirmation', forwardingConfiguredAt: new Date() } })`
- [ ] Atualizar `MicrosoftForwardingService.handleCallback()`: mesma coisa com `forwardingStatus: 'configured'`
- [ ] Novo endpoint: `POST /stores/:storeId/ai/email/forwarding/confirm-manual` — marca o inbound como `forwardingStatus: 'configured', forwardingProvider: 'manual'` (chamado quando merchant clica "Já configurei" no fluxo manual)
- [ ] O endpoint `GET /ai-settings/:storeId/inbound-emails` já retorna os dados — garantir que inclui os novos campos
- [ ] Remover `AiFeatureGuard` do `ForwardingOnboardingController` — é setup, não consumo de feature

---

#### 12.1 Frontend: tipos e hook

- [ ] Atualizar `InboundEmail` type em `useAiSettings.ts`:
  ```ts
  type ForwardingStatus = "pending" | "awaiting_confirmation" | "configured";
  
  interface InboundEmail {
    id: string;
    label: string;
    fromAddress: string;
    inboundAddress: string;
    forwardingProvider: "gmail" | "microsoft" | "manual" | null;
    forwardingStatus: ForwardingStatus;
    forwardingConfiguredAt: string | null;
  }
  ```
- [ ] Novo `useConfirmManualForwarding(storeId, inboundEmailId)` mutation em `useForwarding.ts`

---

#### 12.2 Componente reutilizável: `ForwardingSetup`

Criar `src/components/settings/ForwardingSetup.tsx` — usado tanto no onboarding quanto nas settings.

```
Props:
  inboundAddress: string       // endereço a ser configurado
  currentStatus: ForwardingStatus
  onConfirmManual: () => void  // callback ao clicar "Já configurei"
  onOAuthSuccess?: () => void  // callback após abrir OAuth (opcional)
```

UI — seleção de provedor com uma opção expandida por vez:

```
┌─────────────────────────────────────────────────────┐
│ Como seus clientes enviam email para você?          │
│                                                     │
│ [○] Gmail / Google Workspace                        │
│     ↳ Configuração automática via Google            │
│       [Conectar com Google]                         │
│                                                     │
│ [○] Outlook / Microsoft 365                         │
│     ↳ Configuração automática via Microsoft         │
│       [Conectar com Microsoft]                      │
│                                                     │
│ [○] Outro (Zoho, GoDaddy, Registro.br, Titan...)   │
│     ↳ Passo 1: acesse o painel do seu provedor      │
│       Passo 2: vá em "Encaminhamento de email"      │
│       Passo 3: adicione este endereço como destino: │
│       [abc123@inbound.ai.dashfly.com]  [Copiar]     │
│       [Já configurei →]                             │
│                                                     │
│ ─────────────────────────────────────              │
│ [Configurar depois]    (link discreto)              │
└─────────────────────────────────────────────────────┘
```

- [x] Criar `ForwardingSetup.tsx`
- [x] Substituir o step 2 do onboarding por `<ForwardingSetup />`
- [x] Usar também nas settings (ver 12.3)

---

#### 12.3 Settings: encaminhamento acessível após onboarding

**O gap crítico:** se o merchant pular o forwarding no onboarding, hoje não há como voltar e configurar. O produto fica completamente não funcional e sem nenhum alerta.

**Mudanças no `InboundEmailsManager`:**

Para cada email na lista, exibir o status de forwarding com ação:

```
┌───────────────────────────────────────────────────────┐
│ suporte@loja.com  · Suporte principal                 │
│ ⚠ Encaminhamento não configurado    [Configurar →]   │
│ Endereço Dashfly: abc123@inbound.ai.dashfly.com [📋]  │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│ trocas@loja.com  · Trocas                            │
│ ✅ Encaminhamento ativo · Gmail · desde 12/04/2026   │
│ Endereço Dashfly: abc456@inbound.ai.dashfly.com [📋]  │
└───────────────────────────────────────────────────────┘
```

- [x] Adicionar badge de status por email: `null` → amarelo "Encaminhamento não configurado", `awaiting_confirmation` → amarelo "Aguardando confirmação do Google", `configured` → verde "Encaminhamento ativo"
- [x] Botão "Configurar" (null) → expande inline `<ForwardingSetup />` por email
- [x] Wiring de callbacks `onForwardingOAuth` e `onForwardingConfirmManual` nas settings

**Alerta no dashboard (overview):**
- [x] Se algum inbound email tiver `forwardingStatus === null`, mostrar banner amarelo de alerta

---

#### 12.4 Settings: autenticação de domínio (SPF + DKIM)

Nova aba "Domínio" nas settings de email (`InboundEmailsManager` ou seção separada).

```
┌──────────────────────────────────────────────────────────┐
│ Autenticação de domínio                                  │
│ Para que os emails do assistente não caiam no spam       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ℹ Sobre registros MX                                    │
│   Você não precisa mexer nos seus registros MX.          │
│   O Dashfly usa encaminhamento, não entrega direta.      │
│   Seus registros MX ficam exatamente como estão.         │
│                                                          │
│ ─── Registro SPF ────────────────────────────────────   │
│ "Autoriza o Dashfly a enviar emails pelo seu domínio"    │
│ Tipo: TXT  Nome: @                                       │
│ Valor: v=spf1 include:sendgrid.net ~all  [Copiar]        │
│ ⚠ Se já tiver SPF, adicione include:sendgrid.net         │
│   ao existente. Não crie um segundo registro SPF.        │
│                                                          │
│ ─── Registro DKIM ───────────────────────────────────   │
│ "Assina digitalmente os emails — prova que são seus"     │
│ Tipo: CNAME  Nome: s1._domainkey  [Copiar]               │
│ Valor: s1.domainkey.sendgrid.net  [Copiar]               │
│                                                          │
│ ⏱ Pode levar até 24h para propagar. Já pode usar        │
│   o assistente enquanto isso.                            │
│                                                          │
│ [Precisa de ajuda? Nosso suporte configura para você →]  │
└──────────────────────────────────────────────────────────┘
```

- [x] Criar seção "Autenticação de domínio" (collapsible) no `InboundEmailsManager`
- [x] Instrução SPF com valor copiável + aviso de merge com SPF existente
- [x] Instrução DKIM com nome e valor copiáveis (tipo CNAME, não TXT)
- [x] Aviso explícito: **MX records não precisam ser alterados**
- [x] Tempo de propagação com mensagem tranquilizadora
- [x] CTA de suporte

---

#### 12.5 Credenciais OAuth (devops)

- [ ] Configurar no `.env` do aquila:
  ```env
  GMAIL_FORWARDING_CLIENT_ID=...
  GMAIL_FORWARDING_CLIENT_SECRET=...
  MICROSOFT_FORWARDING_CLIENT_ID=...
  MICROSOFT_FORWARDING_CLIENT_SECRET=...
  ```
- [ ] No Google Cloud Console: adicionar `{API_URL}/stores/ai/email/forwarding/gmail/callback` como redirect URI autorizado
- [ ] No Azure App Registration: adicionar `{API_URL}/stores/ai/email/forwarding/microsoft/callback`

---

### Fase 13 — Onboarding: trialEmailsLimit no admin

- [x] Adicionar campo `trialEmailsLimit` no form de criação/edição de plano no dashflyadmin (`ai-plan-form-dialog.tsx`)
  - [x] Label: "Limite de emails no trial"
  - [x] Descrição: "Quantos emails o assistente pode enviar durante o período de teste grátis"
  - [x] Default: 50

---

### Fase 14 — Políticas e FAQ: Qualidade das Respostas

**Contexto e motivação:**

Políticas de troca, política de envio e FAQ são os dados mais impactantes para a qualidade das respostas da IA. Sem elas, o assistente responde de forma genérica — "consulte nossa política de trocas" — sem saber nada sobre os prazos, condições e exceções da loja específica. Com elas, o assistente responde com precisão real.

O problema atual: esses campos existem nas configurações, mas:
1. **Não aparecem no onboarding** — o merchant termina o setup sem nunca ser sugerido a preencher
2. **Nas settings, são campos longos sem contexto** — merchant abre e não sabe por onde começar
3. **A IA pode gerá-las automaticamente** — mas o botão "Gerar com IA" fica escondido numa aba de configurações que muitos nunca visitam

**Impacto na qualidade:**

| Cenário | Exemplo real de resposta |
|---|---|
| Sem política de troca | "Por favor, consulte nossa política de trocas em nosso site." |
| Com política de troca | "Você tem 7 dias para trocar desde a entrega. Produtos em promoção não são elegíveis para troca. Para iniciar, basta nos enviar o número do pedido." |

---

#### 14.1 — Novo step no onboarding: Políticas

Adicionar step 5 ao onboarding, entre Identidade e Resumo. O step atual de Resumo vira step 6, Sucesso vira step 7. TOTAL_STEPS passa de 7 para 8, SUCCESS_STEP = 7.

**UX do step:**

```
┌──────────────────────────────────────────────────────────────────┐
│  ● ● ● ● ● ○ ○                                            5 de 7 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Como o assistente deve responder sobre sua loja?                │
│  Quanto mais contexto você der, mais preciso ele será.           │
│  A IA gera tudo para você — revise e ajuste se quiser.           │
│                                                                  │
│  ┌── Qualidade das respostas ────────────────────────────────┐   │
│  │  ○○○  Básica — respostas genéricas                        │   │
│  │  ●○○  Boa — com identidade da loja                        │   │  ← dinâmico
│  │  ●●○  Muito boa — com políticas                           │   │
│  │  ●●●  Ótima — contexto completo                           │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ── Política de trocas ──────────────────────────────────────    │
│  [textarea: prazo, condições, exceções...]                       │
│  [Gerar com IA ✦]                                               │
│                                                                  │
│  ── Política de envio ───────────────────────────────────────    │
│  [textarea: prazo, frete, regiões...]                            │
│  [Gerar com IA ✦]                                               │
│                                                                  │
│  ── FAQ personalizado ──────────────────────────────────────     │
│  [textarea: perguntas frequentes da sua loja]                    │
│  [Gerar com IA ✦]                                               │
│                                                                  │
│  [← Voltar]          [Configurar depois]   [Próximo →]          │
└──────────────────────────────────────────────────────────────────┘
```

**Comportamento dos botões "Gerar com IA":**
- Chama o endpoint SSE correspondente: `POST /ai-content/:storeId/generate/exchange-policy`, `/shipping-policy`, `/faq`
- Requer `AiFeatureGuard` (já tem subscription em step 5, pois plan foi selecionado no step 0)
- Texto aparece progressivamente no textarea via `useStreamingContent` hook
- Botão vira "Gerando..." com spinner durante streaming
- Ao finalizar, merchant pode editar livremente antes de avançar

**Indicador de qualidade (dinâmico):**
- 0 campos preenchidos → "Básica — respostas genéricas" (sem cor)
- 1 campo → "Boa — com contexto parcial" (amarelo)
- 2 campos → "Muito boa" (laranja)
- 3 campos → "Ótima — contexto completo" (verde)
- O indicador atualiza em tempo real conforme os campos têm conteúdo

**Salvamento:**
- `handleSubmit` chama `PATCH /ai-settings/:storeId` com `{ exchangePolicy, shippingPolicy, faq }` 
- Só envia os campos que foram preenchidos (omite vazios para não sobrescrever configs anteriores)
- "Configurar depois" avança sem salvar (os campos ficam vazios no backend)

**Mudanças no onboarding:**
- `TOTAL_STEPS = 8`, `SUCCESS_STEP = 7`
- `step === 5` → novo step de políticas
- `step === 6` → resumo (era 5)
- `step === 7` → sucesso (era 6)
- Adicionar `savedPolicies` state para exibir no resumo (step 6)
- No resumo, mostrar card "Políticas" com indicador de quantas foram preenchidas

**No step de sucesso:**
- Se policies ficaram vazias, adicionar item no "O que acontece agora?":
  - "Configure suas políticas de troca e envio para respostas mais precisas →" (link para settings)

**Implementação:**
- [x] Atualizar `TOTAL_STEPS = 8` e `SUCCESS_STEP = 7` no onboarding
- [x] Deslocar steps 5→6 (resumo) e 6→7 (sucesso) no JSX
- [x] Adicionar step 5 (políticas) com três textareas + botões "Gerar com IA"
- [x] Implementar indicador de qualidade dinâmico (estado derivado do conteúdo dos campos)
- [x] Usar `useStreamingContent` hook existente para cada campo
- [x] `handlePoliciesSubmit` salva via `updateSettings.mutate` só campos não-vazios
- [x] Atualizar card do resumo para incluir status de políticas
- [x] Adicionar CTA de policies no step de sucesso quando ficarem vazias

---

#### 14.2 — Settings: destaque visual para políticas não preenchidas

Na aba de configurações existente (`CustomTextsForm`), adicionar contexto de impacto:

```
┌─────────────────────────────────────────────────────────────────┐
│ Políticas e FAQ                                                 │
│ Esses textos são injetados diretamente no prompt da IA.         │
│ São o maior diferencial entre respostas genéricas e precisas.  │
├─────────────────────────────────────────────────────────────────┤
│ ⚠ Política de trocas não preenchida                             │  ← se vazia
│   Sem isso, o assistente não sabe suas condições de troca.      │
│   [Gerar com IA ✦]                                             │
│                                                                 │
│ ✅ Política de envio  (284 caracteres)                          │  ← se preenchida
│   [Editar]  [Regenerar com IA ✦]                               │
└─────────────────────────────────────────────────────────────────┘
```

- [x] Adicionar badge de status por campo: vazio → badge amarelo "Não configurado", preenchido → verde com contagem de caracteres
- [x] Para campos vazios: exibir mensagem de impacto + botão "Gerar com IA" em destaque
- [x] Para campos preenchidos: botão "Regenerar" menor, não destaque

---

#### 14.3 — Overview: banner de qualidade para merchant novo

No `page.tsx` do dashboard (overview), se policies ficarem todas vazias após o onboarding, exibir um banner de qualidade:

```
┌──────────────────────────────────────────────────────────────────┐
│  ✦ Melhore as respostas do assistente                            │
│  Configure suas políticas de troca, envio e FAQ para que o       │
│  assistente responda com precisão sobre sua loja.               │
│  [Configurar agora →]            [Dispensar]                    │
└──────────────────────────────────────────────────────────────────┘
```

- [x] Verificar se `settings.exchangePolicy`, `settings.shippingPolicy` e `settings.faq` estão todos vazios
- [x] Exibir banner amarelo/neutro (não alarme — é melhoria, não erro) na overview
- [x] "Dispensar" salva flag no `localStorage` para não mostrar mais (não é erro crítico)
- [x] Banner não exibido se pelo menos 1 política estiver preenchida

---

### Fase 15 — Verificação de Encaminhamento

**Contexto:** Hoje o fluxo manual de forwarding marca como `configured` com base na palavra do usuário. A verificação real envolve o backend enviar um email de teste para o `fromAddress` da loja; se o encaminhamento estiver ativo, esse email chega no inbound do Dashfly e o token é detectado automaticamente — sem o usuário digitar nada.

**Pré-requisito backend:** Fase A do `aquila/TASKS.md` (endpoint `send-verification` + detecção automática no processador de inbound).

**Onde aparece:** aba "Encaminhamento" nas settings + step 2 do onboarding (para emails no estado `pending` ou `awaiting_confirmation`).

#### 15.1 — Serviço e hook

- [ ] Adicionar `sendForwardingVerification(storeId, inboundEmailId)` em `forwarding.service.ts`
  - `POST /stores/:storeId/ai/email/forwarding/:inboundEmailId/send-verification`
- [ ] Adicionar `useSendForwardingVerification(storeId)` em `useForwarding.ts`
  - `onSuccess`: invalida `['inbound-emails', storeId]` (status pode ter mudado)
- [ ] Adicionar campo `forwardingVerificationSentAt: string | null` ao tipo `InboundEmail`

#### 15.2 — Componente `ForwardingSetup` — novo estado "verificando"

Após o usuário clicar "Já configurei o encaminhamento" no fluxo manual, em vez de marcar como `configured` direto, iniciar a verificação automática:

```
┌──────────────────────────────────────────────────────────────┐
│  ✅ Instruções seguidas? Vamos confirmar automaticamente.    │
│                                                              │
│  Enviamos um email de teste para suporte@loja.com.           │
│  Se o encaminhamento estiver ativo, confirmaremos em         │
│  instantes — sem precisar fazer nada.                        │
│                                                              │
│  ⏳ Aguardando verificação...          [Reenviar email]      │
└──────────────────────────────────────────────────────────────┘
```

- [ ] No fluxo manual, substituir `onConfirmManual` (que marcava direto como `configured`) por `useSendForwardingVerification`
- [ ] Mostrar estado "Aguardando verificação..." com spinner após envio
- [ ] Polling a cada 5s em `useInboundEmails(storeId)` enquanto status for `awaiting_confirmation`
  - Usar `refetchInterval: status === 'awaiting_confirmation' ? 5000 : false`
  - Parar polling quando status mudar para `configured`
- [ ] Ao confirmar: mostrar badge verde "Encaminhamento verificado!" + parar polling
- [ ] Botão "Reenviar email" — chama `sendForwardingVerification` novamente (respeitando rate limit do backend)
- [ ] Timeout visual: se em 5 minutos não confirmar, mostrar mensagem "Ainda não detectamos o encaminhamento. Verifique se as instruções foram seguidas corretamente."

#### 15.3 — Onboarding: step 2 adaptado

- [ ] No step 2 do onboarding, se email estiver em `awaiting_confirmation`:
  - Substituir o formulário pelo estado de "aguardando" (igual ao 15.2)
  - Botão "Próximo" fica disponível assim que `forwardingStatus === 'configured'`
  - Permitir avançar manualmente com "Configurar depois" (link discreto) — não bloquear indefinidamente

---

### Fase 16 — Verificação de DNS + Feature Gating

**Contexto:** SPF determina se o Dashfly tem permissão para enviar emails pelo domínio da loja. Sem SPF verificado, os emails enviados vão para spam ou são rejeitados. A solução é verificar via DNS lookup no backend e bloquear o envio de emails outbound até que o SPF esteja confirmado.

**Pré-requisito backend:** Fase B do `aquila/TASKS.md` (endpoint `dns/verify` + feature guard + campos `spfVerified`/`dkimVerified` no inbound email).

**Decisão de design:** não forçar onboarding. Em vez disso, gates específicos por feature + banners contextuais.

#### 16.1 — Serviço e hook

- [ ] Adicionar `verifyDns(storeId)` em `forwarding.service.ts`
  - `POST /stores/:storeId/ai/email/dns/verify`
  - Retorna `{ spf: boolean, dkim: boolean, checkedAt: string }`
- [ ] Adicionar `useVerifyDns(storeId)` em `useForwarding.ts`
  - `onSuccess`: invalida `['inbound-emails', storeId]`
- [ ] Atualizar tipo `InboundEmail`:
  ```ts
  spfVerified: boolean;
  dkimVerified: boolean;
  dnsCheckedAt: string | null;
  ```

#### 16.2 — Aba DNS nas settings: status real + botão verificar

Substituir o conteúdo estático do `DnsSettingsSection` por um componente com estado:

```
┌──────────────────────────────────────────────────────────────┐
│  SPF — permissão de envio                                    │
│  ❌ Não verificado          [Verificar agora]                │
│  Tipo TXT · Nome @ · Valor: v=spf1 include:sendgrid.net ~all │
│  ⚠ Se já tiver SPF, adicione include:sendgrid.net ao existente│
├──────────────────────────────────────────────────────────────┤
│  DKIM — assinatura digital                                   │
│  ✅ Verificado · Checado há 2 horas                          │
│  Tipo CNAME · s1._domainkey → s1.domainkey.sendgrid.net      │
└──────────────────────────────────────────────────────────────┘
```

- [ ] Receber `emails: InboundEmail[]` como prop no `DnsSettingsSection`
- [ ] Mostrar status real por registro: `spfVerified` / `dkimVerified` com badge verde/vermelho
- [ ] Mostrar `dnsCheckedAt` como tempo relativo ("checado há X horas")
- [ ] Botão "Verificar agora" chama `useVerifyDns` com spinner durante a verificação
- [ ] Após verificar: atualizar badges sem reload de página
- [ ] Se `spfVerified === false`: card de aviso vermelho "Envio de emails bloqueado — configure o SPF para ativar as respostas automáticas"
- [ ] Se `spfVerified === true && dkimVerified === false`: aviso amarelo (não bloqueante) "DKIM melhora a entregabilidade — recomendado configurar"
- [ ] Propagação: manter mensagem "Pode levar até 24h para propagar. Se você acabou de configurar, tente novamente em alguns minutos."

#### 16.3 — Feature gating: bloquear features sem SPF

Abas e features afetadas quando `spfVerified === false`:

- [ ] **Aba "Respostas"** — toggle "Resposta automática ativa" desabilitado com tooltip: "Configure o SPF primeiro para ativar o envio automático"
- [ ] **Aba "Recuperar carrinhos"** — toggle principal desabilitado com mesmo aviso
- [ ] **Aba "Após a venda"** — toggles de envio desabilitados
- [ ] **Aba "Clientes inativos"** — toggle principal desabilitado
- [ ] Em cada aba afetada: banner discreto no topo com link direto para aba DNS:
  ```
  ⚠ SPF não verificado — emails não serão enviados até você configurar o domínio.
  [Ir para DNS / SPF / DKIM →]
  ```

#### 16.4 — Banner no dashboard (overview)

- [ ] Se `spfVerified === false` E `settings.isActive === true`: mostrar banner de aviso vermelho no dashboard (mais urgente que o banner de forwarding)
  ```
  ❌ Envio de emails bloqueado — SPF não configurado
  O assistente pode receber emails, mas não consegue responder.
  [Configurar DNS agora →]
  ```
- [ ] Banner de forwarding não configurado já existe (Fase 12.3) — manter
- [ ] Ordenação dos banners: SPF (mais crítico) > Forwarding > Políticas

---

### Fase 17 — Refinamento Visual das Configurações

**Contexto:** A página de settings e seus componentes internos acumularam texto excessivamente pequeno (`text-xs`, `text-[10px]`, `text-[11px]`) e densidade visual alta. O resultado é uma interface difícil de ler e pouco convidativa — especialmente para lojistas sem perfil técnico.

**Princípio:** o tamanho base de texto do produto deve ser `text-sm` (14px). `text-xs` (12px) é reservado para metadados e labels secundários. Tamanhos menores (`text-[10px]`, `text-[11px]`) devem ser eliminados exceto em badges/chips onde espaço é genuinamente restrito.

#### 17.1 — Escala tipográfica das settings

- [ ] **Nav lateral de tabs:** labels de `text-sm` já corretos — revisar ícones e espaçamentos internos
- [ ] **Header do painel (título da tab):** subir de `text-sm` para `text-base` no título; descrição sobe de `text-xs` para `text-sm`
- [ ] **Seções internas (section headers):** título de `text-sm font-semibold` → `text-base font-semibold`; descrição da seção de `text-xs` → `text-sm`
- [ ] **Formulários** (`AssistantIdentityForm`, `EmailSettingsForm`, etc.): labels de `text-xs` → `text-sm`; placeholders herdam automaticamente
- [ ] **`BlacklistEditor`:** tags/chips mantêm `text-xs` (espaço genuinamente restrito); descrição sobe para `text-sm`
- [ ] **`InboundEmailsManager`:** label do email e inboundAddress de `text-sm`/`text-xs` → `text-sm`/`text-xs` (já ok); `ForwardingStatusBadge` de `text-[11px]` → `text-xs`
- [ ] **`DnsSettingsSection`:** corpo explicativo de `text-xs` → `text-sm`; valores de registros DNS mantêm `text-xs font-mono` (espaço restrito)
- [ ] **`CustomTextsForm`:** descrições de impacto de `text-xs` → `text-sm`

#### 17.2 — Respiração e espaçamento

- [ ] Aumentar `gap` entre seções dentro do painel: `gap-8` → `gap-10` nas sections com `border-t`
- [ ] Padding do painel de conteúdo: `px-5 py-5` → `px-6 py-6`
- [ ] Header do painel: `px-5 py-4` → `px-6 py-5`
- [ ] Inputs e textareas: altura mínima confortável — garantir `py-2.5` em todos (alguns estão em `py-2`)
- [ ] Botões de ação primários dentro de formulários: `py-2` → `py-2.5`

#### 17.3 — Consistência visual

- [ ] Todos os `text-[10px]` e `text-[11px]` nos componentes de settings devem virar `text-xs` no mínimo
- [ ] Revisar `ForwardingSetup.tsx` — texto instrucional de `text-xs` → `text-sm`
- [ ] Verificar `CartAttemptsEditor`, `PostPurchaseForm`, `ReengagementForm` — mesma régua

---

### Ordem de Implementação Recomendada (Atualizada)

```
✅ Fase 0–9 (concluídas)

Prioridade alta (produto funcional):
  Fase 10: Backend F10-04 (remover AiFeatureGuard do forwarding) →
  Fase 11.1 (fix piscar onboarding) →
  Fase 14.1 (políticas no onboarding — maior ganho de qualidade) →
  Fase 12.0 (backend: migration forwarding status) →
  Fase 12.1–12.3 (frontend forwarding)

Prioridade média:
  Fase 14.2 (destaque políticas nas settings) →
  Fase 14.3 (banner overview) →
  Fase 10 (multi-loja) →
  Fase 11.2 e 11.3 (bugs menores) →
  Fase 12.4 (DNS/SPF/DKIM settings) →
  Fase 13 (trialEmailsLimit no admin)
```

---

### Status Geral

| Projeto | Fase | Status |
|---|---|:---:|
| hermes | Fase 0 — Setup | ✅ |
| hermes | Fase 1 — Auth | ✅ |
| hermes | Fase 2 — Layout | ✅ |
| hermes | Fase 3 — Overview | ✅ |
| hermes | Fase 4 — Conversas | ✅ |
| hermes | Fase 5 — Automações | ✅ |
| hermes | Fase 6 — Configurações | ✅ |
| hermes | Fase 7 — Assinatura | ✅ |
| hermes | Fase 8 — Unsubscribe | ✅ |
| dashflyadmin | Fase 9 — Planos AI | ✅ |
| hermes | Fase 10 — Multi-loja | ✅ |
| hermes | Fase 11 — Correções críticas | 11.1–11.3 ✅ |
| hermes | Fase 12 — Config. de email (refatoração) | 12.1–12.4 ✅ · 12.5 devops |
| dashflyadmin | Fase 13 — trialEmailsLimit no admin | ✅ |
| hermes | Fase 14 — Políticas e FAQ no onboarding | 14.1–14.3 ✅ |
| hermes | Fase 15 — Verificação de encaminhamento | [ ] pendente backend F11 |
| hermes | Fase 16 — Verificação DNS + feature gate SPF | [ ] pendente backend F12 |
| hermes | Fase 17 — Refinamento visual das settings | [ ] pendente |

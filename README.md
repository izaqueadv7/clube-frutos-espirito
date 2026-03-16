# Clube Frutos do Espirito

Plataforma web + PWA completa para gestao do Clube de Desbravadores Frutos do Espirito.

## 1) Arquitetura do projeto

- Frontend: Next.js (App Router) + React + TypeScript + TailwindCSS
- Backend: Next.js Route Handlers (`app/api/**`)
- Banco: PostgreSQL
- ORM: Prisma
- Autenticacao: NextAuth (Credentials + JWT session)
- Deploy: Vercel
- PWA: Service Worker customizado, `manifest.webmanifest`, icones, splash, modo offline e push subscription

Arquitetura por camadas:

- `app/**`: paginas e layouts (publico, autenticacao e area logada)
- `components/**`: UI e componentes de modulo
- `lib/**`: auth, prisma client, permissoes, validacoes e helpers
- `app/api/**`: endpoints protegidos por role
- `prisma/**`: schema e seed
- `public/**`: assets PWA e service worker

## 2) Schema de banco de dados

Schema Prisma completo em [prisma/schema.prisma](./prisma/schema.prisma), incluindo tabelas solicitadas:

- `users`
- `pathfinders`
- `parents`
- `specialties`
- `pathfinder_specialties`
- `classes`
- `class_requirements`
- `pathfinder_progress`
- `events`
- `announcements`
- `attendance`

Extras de producao:

- `parent_pathfinders` (vinculo pai-filho)
- `password_reset_tokens`
- `push_subscriptions`

## 3) Estrutura de pastas

```txt
portal-frutos-do-espirito/
  app/
    (public)/
    (auth)/
    (dashboard)/
    api/
  components/
    ui/
    dashboard/
    forms/
    pwa/
  pages/
    api/
  api/
  prisma/
  public/
    icons/
    splash/
  styles/
  lib/
  data/
  types/
  docs/
```

## 4) Frontend completo (modulos implementados)

Publico:

- Home com hero, descricao do clube, verso da semana, proximos eventos, avisos e CTA de login
- Layout responsivo mobile-first

Autenticacao:

- Login por email/senha
- Recuperacao de senha (`forgot-password` + `reset-password`)
- Rotas protegidas por middleware

Portal Pathfinder:

- Dashboard com perfil, classe atual, progresso, especialidades, proximo evento e verso do dia
- Modulo de classes com requisitos e progresso
- Modulo de especialidades com status (Pending/In progress/Completed)
- Calendario de eventos
- Avisos
- Modulo biblico com livros, navegacao por capitulo, busca e devocional diario

Portal Parent:

- Visualizacao de progresso do filho
- Especialidades e frequencia
- Classe atual e percentual de evolucao

Painel Leader:

- Cadastro de pathfinder
- Criacao de evento
- Publicacao de aviso
- Visao administrativa rapida

## 5) Backend API

Endpoints principais:

- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET|POST /api/pathfinders`
- `GET|POST|PATCH /api/specialties`
- `GET|POST /api/classes`
- `GET|POST /api/progress`
- `GET|POST /api/events`
- `GET|POST /api/announcements`
- `GET|POST /api/attendance`
- `POST /api/notifications/subscribe`
- `POST /api/notifications/test`

## 6) Setup de autenticacao

- Config em [lib/auth.ts](./lib/auth.ts)
- NextAuth Credentials provider
- Senha com hash `bcryptjs`
- Sessao JWT com role em `session.user.role`
- Middleware com protecao por role em [middleware.ts](./middleware.ts)

## 7) Configuracao PWA

Arquivos principais:

- [public/manifest.webmanifest](./public/manifest.webmanifest)
- [public/sw.js](./public/sw.js)
- [public/offline.html](./public/offline.html)
- [public/icons/icon-192.png](./public/icons/icon-192.png)
- [public/icons/icon-512.png](./public/icons/icon-512.png)
- [public/splash/apple-splash-1170-2532.png](./public/splash/apple-splash-1170-2532.png)
- [public/splash/apple-splash-2048-2732.png](./public/splash/apple-splash-2048-2732.png)

Funcionalidades:

- Service Worker com cache e fallback offline
- Add to Home Screen
- Manifest + icones maskable
- Splash screen (iOS startup images)
- Push notifications (assinatura salva em banco)

## 8) Deploy em producao (Vercel)

### Variaveis de ambiente

Copie `.env.example` para `.env.local` e ajuste:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- (opcional SMTP para email real)

### Comandos locais

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

### Deploy

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

No painel da Vercel:

1. Configure as mesmas env vars em Project Settings > Environment Variables.
2. Aponte `DATABASE_URL` para PostgreSQL de producao (ex: Neon, Supabase, Railway, Render).
3. Execute migracoes de producao:

```bash
npx prisma migrate deploy
```

## 9) Como gerar URL publica

1. Suba o projeto para GitHub.
2. Importe o repositorio na Vercel.
3. Configure variaveis de ambiente.
4. Clique em Deploy.
5. A Vercel gera automaticamente uma URL publica (`https://seu-projeto.vercel.app`).
6. Opcional: configure dominio proprio em Settings > Domains.

## Credenciais seed (desenvolvimento)

- Lider: `lider@frutos.com` / `Leader@123`
- Pathfinder: `desbravador@frutos.com` / `Pathfinder@123`
- Parent: `pai@frutos.com` / `Parent@123`

## Observacoes de producao

- Troque todas as senhas padrao apos o primeiro acesso.
- Configure envio real de email para recuperacao (SMTP provider).
- Para push real, integre Web Push (VAPID) ou FCM no endpoint `/api/notifications/test`.

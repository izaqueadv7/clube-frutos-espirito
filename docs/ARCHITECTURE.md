# Architecture Notes

## Stack

- Next.js App Router
- Route Handlers as backend
- Prisma + PostgreSQL
- NextAuth with JWT session
- TailwindCSS design system

## Role model

- PATHFINDER: visualiza progresso, classes, especialidades, eventos, avisos e biblia
- LEADER: administra membros, classes, especialidades, eventos, avisos e frequencia
- PARENT: acompanha progresso e frequencia do filho vinculado

## Security

- Password hashing with bcrypt
- Protected pages through middleware
- Role checks in API and UI layer
- Password reset token expiry

## PWA lifecycle

- Service worker registers in root layout
- Static assets and core pages cached
- Offline fallback page for navigation failures
- Push payload handler + click action to portal pages

# Notas de Migración - Hunt Tickets

Este proyecto es una copia de `hunt-web` con los siguientes cambios aplicados:

## ✅ Cambios Realizados

### 1. **Supabase Auth Removido**
- ❌ Eliminado todo el directorio `app/(auth)/` (login, sign-up, confirm, etc.)
- ❌ Eliminados componentes de autenticación originales
- ✅ Creado nuevo `components/auth-button.tsx` simplificado
- ✅ Usuario siempre "autenticado" como usuario mock (Juan Pérez)

### 2. **Supabase Database Desconectado**
- ❌ Eliminado `lib/supabase/client.ts`
- ❌ Eliminado `lib/supabase/server.ts`
- ❌ Eliminado `lib/supabase/middleware.ts`
- ❌ Eliminado `middleware.ts` (token refresh)
- ❌ Eliminado todo el directorio `lib/supabase/actions/`
- ❌ Eliminado todo el directorio `lib/supabase/queries/`

### 3. **Data DUMMY Implementada**
Creada estructura completa de datos dummy en `lib/dummy-data/`:

```
lib/dummy-data/
├── cities.ts          - 5 ciudades
├── events.ts          - 3 eventos activos
├── producers.ts       - 3 productores
├── profiles.ts        - 3 perfiles de usuario + CURRENT_USER
├── tickets.ts         - 6 tipos de tickets
├── transactions.ts    - 3 transacciones de ejemplo
├── venues.ts          - 3 venues
└── index.ts           - Exportador central
```

**Características de los datos DUMMY:**
- URLs de imágenes de Unsplash (placeholders)
- Eventos con fechas futuras
- Relaciones completas entre eventos, venues, productores y tickets
- Usuario por defecto: Juan Pérez (admin)

### 4. **Helpers Mock Creados**

#### `lib/auth/mock-auth.ts`
- `getUser()` - Siempre retorna CURRENT_USER
- `isAuthenticated()` - Siempre retorna true
- `getCurrentUserId()` - Retorna "user-1"
- `isAdmin()` - Retorna true
- `signOut()` - No hace nada (mock)

#### `lib/db/mock-db.ts`
Funciones que reemplazan queries de Supabase:
- `getAllActiveEvents()` - Retorna todos los eventos dummy
- `getEventById(id)` - Busca evento por ID
- `getPopularEvents()` - Retorna top 3 eventos
- `getCities()` - Retorna ciudades dummy
- `getAllProducers()` - Retorna productores
- `getTicketsByEventId(id)` - Filtra tickets por evento
- `createTransaction(data)` - Crea transacción mock
- Y más...

### 5. **API Routes Actualizadas**

#### `/api/events/popular`
- Usa `getPopularEvents()` de mock-db
- Retorna data dummy en lugar de consultar Supabase

#### `/api/transactions/create`
- Usa `getUser()` de mock-auth
- Usa `getTicketById()` y `createTransaction()` de mock-db
- Mantiene lógica de cálculo de totales e integración con Bold

### 6. **Configuración Actualizada**

#### `package.json`
- ❌ Removido `@supabase/ssr`
- ❌ Removido `@supabase/supabase-js`

#### `next.config.ts`
- ❌ Removido loader personalizado de Supabase
- ✅ Configurado para Unsplash y placeholder.com
- Mantiene optimizaciones de caché (30 días)

#### `.env.local`
- ❌ Removido `NEXT_PUBLIC_SUPABASE_URL`
- ❌ Removido `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- ❌ Removido `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Mantenido `NEXT_PUBLIC_BOLD_API_KEY`
- ✅ Mantenido `BOLD_SECRET_KEY`

## 🎯 Rutas Funcionales

### Rutas Públicas (con data DUMMY)
- ✅ `/` - Home con eventos populares
- ✅ `/eventos` - Listado de todos los eventos
- ✅ `/eventos/[eventId]` - Detalle de evento
- ✅ `/productor` - Página de productor
- ✅ `/sobre-nosotros` - Sobre nosotros
- ✅ `/terminos-y-condiciones` - Términos
- ✅ `/payment/confirm` - Confirmación de pago (mock)

### Rutas Protegidas (siempre autenticado como user-1)
- ✅ `/profile/user-1` - Perfil de usuario
- ✅ `/profile/user-1/tickets` - Mis tickets
- ✅ `/profile/user-1/ajustes` - Ajustes
- ✅ `/profile/user-1/administrador` - Dashboard admin
- ✅ `/profile/user-1/administrador/event/[eventId]/*` - Gestión de eventos
- ✅ `/profile/user-1/administrador/marcas` - Marcas/productores
- ✅ `/profile/user-1/administrador/usuarios` - Gestión de usuarios

### Rutas Eliminadas
- ❌ `/login` - Eliminado
- ❌ `/sign-up` - Eliminado
- ❌ `/confirm` - Eliminado
- ❌ Todo el grupo `(auth)`

## 🚀 Próximos Pasos

1. **Instalar dependencias:**
   ```bash
   cd "/Users/macbook/Desktop/Code Projects/hunt"
   npm install
   ```

2. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

3. **Integrar better-auth (MANUAL):**
   - Instalar better-auth según documentación
   - Reemplazar funciones en `lib/auth/mock-auth.ts`
   - Configurar variables de entorno en `.env.local`
   - Actualizar `components/auth-button.tsx` con lógica real

4. **Conectar base de datos (FUTURO):**
   - Definir schema de base de datos
   - Actualizar funciones en `lib/db/mock-db.ts`
   - Implementar queries reales

## 📝 Notas Importantes

- **Navegación completa:** Todas las rutas son navegables con data dummy
- **Sin errores de compilación:** El proyecto debe compilar sin errores
- **Imágenes:** Todas las imágenes usan Unsplash placeholders
- **Usuario mock:** Siempre autenticado como Juan Pérez (user-1, admin)
- **Transacciones:** Las compras crean transacciones mock pero no persisten

## 🔧 Archivos Clave

- `lib/dummy-data/` - Todos los datos dummy
- `lib/auth/mock-auth.ts` - Lógica de autenticación mock
- `lib/db/mock-db.ts` - Lógica de base de datos mock
- `components/auth-button.tsx` - Botón de autenticación simplificado

---

**Generado:** 2025-11-19
**Proyecto original:** hunt-web
**Proyecto migrado:** hunt

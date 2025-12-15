# Sistema de Referidos, Rebates y Pagos

Sistema completo de recompensas para productores de eventos en Hunt Tickets. Permite ganar comisiones por referir otros productores y obtener rebates por ventas propias.

## 📁 Estructura de Archivos

```
lib/referrals/
├── types.ts          # Definiciones de tipos TypeScript
├── currency.ts       # Utilidades de formateo de moneda
├── date-utils.ts     # Utilidades de manejo de fechas
├── mock-data.ts      # Generadores de datos mock
└── README.md         # Esta documentación

config/
└── referrals.ts      # Configuración centralizada del sistema

components/
├── referral-tabs.tsx          # Componente de tabs principal
├── referral-admin-content.tsx # Tab de referidos
├── payments-content.tsx       # Tab de pagos
├── rebate-content.tsx         # Tab de rebates
├── error-card.tsx             # Componente de errores
├── loading-skeleton.tsx       # Componentes de loading
└── empty-state.tsx            # Estados vacíos

app/.../referidos/
├── page.tsx          # Página principal
├── error.tsx         # Error boundary
└── loading.tsx       # Loading state
```

## 🎯 Características Principales

### 1. **Referidos**
- Código de referido único por organización
- Tracking de productores referidos
- Comisiones del 5% sobre el ingreso neto de Hunt
- Estadísticas en tiempo real

### 2. **Rebates**
- 2.5% de rebate sobre ventas brutas de eventos propios
- Historial completo de rebates
- Gráficos de tendencias

### 3. **Pagos**
- Ciclos de facturación mensuales
- Corte: último día del mes
- Pago: primer día hábil del mes siguiente (evita festivos colombianos)
- Historial de pagos completo

## 🔧 Uso

### Importar Tipos

```typescript
import type {
  ReferralData,
  PaymentData,
  RebateData,
  ReferredProducer,
  BillingCycle,
  RebateRecord,
} from "@/lib/referrals/types";
```

### Formatear Moneda

```typescript
import { formatCurrency, formatCompactCurrency } from "@/lib/referrals/currency";

formatCurrency(1250000);        // "$1.250.000"
formatCompactCurrency(1250000); // "$1.3M"
```

### Utilidades de Fechas

```typescript
import {
  getLastDayOfMonth,
  formatDateString,
  formatPeriod,
  formatShortMonth,
} from "@/lib/referrals/date-utils";

getLastDayOfMonth(2024, 0);           // Jan 31, 2024
formatDateString(new Date());         // "2024-12-11"
formatPeriod(new Date());             // "diciembre 2024"
formatShortMonth(new Date());         // "dic 24"
```

### Generar Mock Data

```typescript
import {
  generateReferralData,
  generatePaymentData,
  generateRebateData,
} from "@/lib/referrals/mock-data";

const referralData = generateReferralData();
const paymentData = generatePaymentData();
const rebateData = generateRebateData();
```

## ⚙️ Configuración

Todas las configuraciones están centralizadas en `/config/referrals.ts`:

```typescript
import {
  COMMISSION_RATES,
  PAYMENT_SCHEDULE,
  REFERRAL_CONFIG,
  MOCK_DATA_CONFIG,
  REFERRAL_FEATURES,
  REFERRAL_UI_CONFIG,
} from "@/config/referrals";

// Tasas de comisión
COMMISSION_RATES.HUNT_BASE_RATE;      // 5%
COMMISSION_RATES.REFERRAL_RATE;       // 5%
COMMISSION_RATES.REBATE_RATE;         // 2.5%

// Feature flags
REFERRAL_FEATURES.ENABLE_REFERRALS;   // true
REFERRAL_FEATURES.ENABLE_REBATES;     // true
```

## 🎨 Componentes UI

### ErrorCard

```tsx
import { ErrorCard } from "@/components/error-card";

<ErrorCard
  title="Error al cargar datos"
  message="No pudimos cargar la información"
  onRetry={() => refetch()}
/>
```

### LoadingSkeleton

```tsx
import { ReferralsLoadingSkeleton } from "@/components/loading-skeleton";

<ReferralsLoadingSkeleton />
```

### EmptyState

```tsx
import { EmptyState } from "@/components/empty-state";
import { Users } from "lucide-react";

<EmptyState
  icon={Users}
  title="No hay referidos"
  description="Comparte tu código para empezar a ganar"
  action={{
    label: "Copiar código",
    onClick: handleCopy,
  }}
/>
```

## 🔗 URL State Management

Los tabs se sincronizan con la URL automáticamente:

- `/referidos?tab=referidos` - Tab de referidos
- `/referidos?tab=rebate` - Tab de rebates
- `/referidos?tab=pagos` - Tab de pagos

## ♿ Accesibilidad

Todos los componentes siguen las mejores prácticas de accesibilidad:

- Roles ARIA apropiados (`tablist`, `tab`, `tabpanel`)
- `aria-selected`, `aria-controls`, `aria-labelledby`
- Navegación por teclado completa
- Iconos con `aria-hidden="true"`
- Labels descriptivos

## 🧪 Testing

### Test Fixtures

Los generadores de mock data están optimizados para testing:

```typescript
// Usa dependency injection para inyectar mock data
<ReferralAdminContent userId="123" data={mockReferralData} />
<PaymentsContent userId="123" data={mockPaymentData} />
<RebateContent userId="123" data={mockRebateData} />
```

## 🚀 Performance

### Optimizaciones Implementadas

1. **Memoization**
   - `useMemo` para datos calculados (chartData, colors, patterns)
   - `useCallback` para event handlers
   - Canvas pattern creado una sola vez

2. **Code Splitting**
   - Componentes lazy-loaded por defecto (Next.js)
   - Imports dinámicos donde sea apropiado

3. **Bundle Size**
   - Utilidades compartidas eliminan duplicación
   - Tree-shaking habilitado

## 📝 Roadmap

### Completado ✅
- Sistema de tipos TypeScript
- Utilidades compartidas (currency, dates)
- Configuración centralizada
- Error boundaries y loading states
- Mock data generators
- Optimizaciones de performance
- URL state management
- Accesibilidad (ARIA)
- Metadata y SEO

### Pendiente 🔄
- Integración con API real
- Analytics tracking
- Error logging (Sentry)
- Unit tests
- E2E tests
- Exportar historial (CSV, PDF)
- Notificaciones de pagos

## 🤝 Contribuir

### Agregar Nueva Feature

1. Actualizar tipos en `/lib/referrals/types.ts`
2. Agregar configuración en `/config/referrals.ts`
3. Crear utilidades necesarias en `/lib/referrals/`
4. Implementar componentes UI
5. Agregar tests
6. Actualizar esta documentación

### Código de Estilo

- TypeScript strict mode
- ESLint + Prettier
- Convenciones de Next.js 15
- React Server Components por defecto
- "use client" solo cuando necesario

## 📚 Referencias

- [Configuración de Festivos Colombianos](/config/README.md)
- [Better Auth Documentation](https://www.better-auth.com)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)

---

**Última actualización:** Diciembre 2024
**Versión:** 1.0.0
**Mantenedor:** Hunt Tickets Team

# Configuración de Festivos Colombianos

Este sistema permite gestionar los festivos colombianos de forma híbrida, combinando:

1. **Festivos base** (hardcodeados en el código)
2. **Festivos personalizados** (desde `custom-holidays.json`)
3. **API externa** (opcional, para actualizaciones automáticas)

## Cómo Funciona

### Sistema Híbrido

El sistema usa un enfoque de 3 capas:

```
API Externa (opcional)
       ↓
Festivos Personalizados (custom-holidays.json)
       ↓
Festivos Base (hardcoded)
```

- Si la API está habilitada y funciona, combina esos festivos con los demás
- Los festivos personalizados se agregan a los festivos base
- Los festivos base siempre están disponibles como fallback

## Configuración de Festivos Personalizados

Edita el archivo `custom-holidays.json` para:

### 1. Agregar Festivos Adicionales

```json
{
  "customHolidays": [
    {
      "name": "Día Cívico Especial",
      "type": "fixed",
      "month": 6,
      "day": 15,
      "enabled": true,
      "comment": "Día adicional específico de la empresa"
    },
    {
      "name": "Festivo Movible Personalizado",
      "type": "movable",
      "month": 3,
      "day": 25,
      "enabled": true,
      "comment": "Se moverá al siguiente lunes si no cae en lunes"
    }
  ]
}
```

### 2. Deshabilitar Festivos Oficiales

```json
{
  "disabledHolidays": {
    "comment": "Lista de festivos que no aplican para tu organización",
    "holidays": [
      "Día de la Raza",
      "Todos los Santos"
    ]
  }
}
```

## Tipos de Festivos

### `fixed` - Festivo Fijo
- **Descripción**: Siempre se celebra en la misma fecha
- **Ejemplo**: Año Nuevo (1 de enero), Navidad (25 de diciembre)
- **Configuración**:
  ```json
  {
    "name": "Día Especial",
    "type": "fixed",
    "month": 12,
    "day": 31,
    "enabled": true
  }
  ```

### `movable` - Festivo Movible (Ley Emiliani)
- **Descripción**: Se mueve al siguiente lunes si no cae en lunes
- **Ejemplo**: Reyes Magos, San José, San Pedro y San Pablo
- **Configuración**:
  ```json
  {
    "name": "Festivo Movible",
    "type": "movable",
    "month": 6,
    "day": 29,
    "enabled": true
  }
  ```

## Uso en el Código

### Opción 1: Usar solo festivos base (más rápido)

```typescript
import { getColombianHolidays, isColombianHoliday } from '@/lib/colombia-holidays';

const holidays = getColombianHolidays(2025);
const isHoliday = isColombianHoliday(new Date('2025-01-01'));
```

### Opción 2: Usar sistema híbrido (personalizado + base)

```typescript
import { getColombianHolidaysEnhanced } from '@/lib/colombia-holidays';

// Con config personalizado, sin API
const holidays = await getColombianHolidaysEnhanced(2025, {
  useCustomConfig: true,
  useAPI: false
});
```

### Opción 3: Usar todo (base + config + API)

```typescript
import { getColombianHolidaysEnhanced } from '@/lib/colombia-holidays';

// Con config personalizado Y API externa
const holidays = await getColombianHolidaysEnhanced(2025, {
  useCustomConfig: true,
  useAPI: true
});
```

## API Externa

El sistema puede consumir la API de festivos colombianos:

- **Endpoint**: `https://api-colombia.com/api/v1/holiday/{year}`
- **Cache**: 24 horas
- **Fallback**: Si falla, usa festivos hardcodeados

### Habilitar/Deshabilitar API

```typescript
// En tu código, controla si usar API
const holidays = await getColombianHolidaysEnhanced(2025, {
  useAPI: true  // Cambiar a false para deshabilitar
});
```

## Variables de Entorno (Opcional)

Puedes agregar en `.env`:

```env
# Habilitar API de festivos
USE_HOLIDAYS_API=true

# URL personalizada de API (opcional)
HOLIDAYS_API_URL=https://tu-api-personalizada.com/holidays
```

## Festivos Colombianos Oficiales (2025)

### Festivos Fijos
- Año Nuevo: 1 de enero
- Día del Trabajo: 1 de mayo
- Día de la Independencia: 20 de julio
- Batalla de Boyacá: 7 de agosto
- Inmaculada Concepción: 8 de diciembre
- Navidad: 25 de diciembre

### Festivos Movibles (se mueven al lunes siguiente)
- Reyes Magos: 6 de enero → 13 de enero (lunes)
- San José: 19 de marzo → 24 de marzo (lunes)
- San Pedro y San Pablo: 29 de junio → 30 de junio (lunes)
- Asunción de la Virgen: 15 de agosto → 18 de agosto (lunes)
- Día de la Raza: 12 de octubre → 13 de octubre (lunes)
- Todos los Santos: 1 de noviembre → 3 de noviembre (lunes)
- Independencia de Cartagena: 11 de noviembre → 17 de noviembre (lunes)

### Festivos Calculados (basados en Semana Santa)
- Jueves Santo
- Viernes Santo
- Ascensión del Señor (39 días después de Pascua) → lunes
- Corpus Christi (60 días después de Pascua) → lunes
- Sagrado Corazón (68 días después de Pascua) → lunes

## Ejemplos de Uso

### Ejemplo 1: Agregar Día de la Empresa

```json
{
  "customHolidays": [
    {
      "name": "Aniversario de la Empresa",
      "type": "fixed",
      "month": 3,
      "day": 15,
      "enabled": true,
      "comment": "Celebración anual de la fundación"
    }
  ]
}
```

### Ejemplo 2: Agregar Festivo Temporal (24 de diciembre 2025)

```json
{
  "customHolidays": [
    {
      "name": "Nochebuena 2025",
      "type": "fixed",
      "month": 12,
      "day": 24,
      "enabled": true,
      "comment": "Solo para 2025, recuerda deshabilitarlo después"
    }
  ]
}
```

### Ejemplo 3: Deshabilitar Festivos No Laborables

```json
{
  "disabledHolidays": {
    "comment": "Festivos que la empresa no observa",
    "holidays": [
      "Día de la Raza",
      "Independencia de Cartagena"
    ]
  }
}
```

## Solución de Problemas

### Los festivos personalizados no se aplican

1. Verifica que `custom-holidays.json` esté en la carpeta `/config`
2. Asegúrate de que `enabled: true`
3. Verifica el formato JSON (no debe tener errores de sintaxis)
4. Reinicia el servidor de desarrollo

### La API no funciona

1. La API puede estar caída - el sistema usará festivos base automáticamente
2. Verifica la conexión a internet
3. Si no necesitas la API, usa `useAPI: false`

### Cambios no se reflejan

1. En desarrollo: reinicia el servidor (`pnpm run dev`)
2. En producción: requiere rebuild y redeploy
3. El cache puede durar 24 horas para datos de API

## Mantenimiento

### Actualizar Festivos Anualmente

1. Edita `custom-holidays.json` a principios de año
2. Verifica festivos movibles basados en Semana Santa
3. Agrega festivos especiales si los hay
4. Deshabilita festivos temporales del año anterior

### Monitoreo

- Los errores de carga se logean en consola (con `console.warn`)
- Si falla todo, siempre hay fallback a festivos hardcodeados
- El sistema es resiliente y nunca dejará de funcionar

# 📧 Sistema de Notificaciones Automáticas - Configuración

Este documento explica cómo configurar el sistema de notificaciones automáticas de vencimiento de suscripciones.

---

## 📋 Tabla de Contenidos

1. [Variables de Entorno](#variables-de-entorno)
2. [Configuración de Resend](#configuración-de-resend)
3. [Tipos de Notificaciones](#tipos-de-notificaciones)
4. [Preview de Notificaciones](#preview-de-notificaciones)
5. [Configuración de Cron Jobs](#configuración-de-cron-jobs)
6. [Testing Manual](#testing-manual)
7. [Troubleshooting](#troubleshooting)

---

## 🔐 Variables de Entorno

Agregá las siguientes variables a tu archivo `.env.local`:

```env
# Resend API Key (para envío de emails)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Email desde el cual se enviarán las notificaciones
# Si usás el dominio verificado de Resend, cambiá esto
NOTIFICATION_FROM_EMAIL=onboarding@resend.dev

# Email del administrador (para notificaciones importantes)
ADMIN_EMAIL=admin@barriomarket.com

# URL pública de la aplicación (para links en emails)
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
# O para desarrollo:
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# Secreto para proteger el endpoint de cron (opcional pero recomendado)
CRON_SECRET=tu_secreto_super_seguro_aqui_12345

# Versión pública del secreto (solo para preview de notificaciones)
# Puede ser el mismo valor que CRON_SECRET en desarrollo
NEXT_PUBLIC_CRON_SECRET=tu_secreto_super_seguro_aqui_12345
```

---

## 📧 Configuración de Resend

### 1. Crear cuenta en Resend

1. Ve a [https://resend.com](https://resend.com)
2. Registrate con tu email
3. Verifica tu cuenta

### 2. Obtener API Key

1. En el dashboard de Resend, ve a **API Keys**
2. Click en **Create API Key**
3. Dale un nombre descriptivo (ej: "BarrioMarket Notifications")
4. Selecciona los permisos: **Sending access**
5. Copia la API key generada
6. Pégala en tu `.env.local` como `RESEND_API_KEY`

### 3. Verificar Dominio (Opcional - Producción)

Para producción, es recomendable verificar tu dominio:

1. En Resend, ve a **Domains**
2. Click en **Add Domain**
3. Ingresa tu dominio (ej: `barriomarket.com`)
4. Sigue las instrucciones para agregar los registros DNS
5. Una vez verificado, cambia `NOTIFICATION_FROM_EMAIL` a algo como:
   ```
   NOTIFICATION_FROM_EMAIL=notificaciones@barriomarket.com
   ```

**Nota:** En desarrollo puedes usar `onboarding@resend.dev` sin verificar dominio.

---

## 🔔 Tipos de Notificaciones

El sistema envía 5 tipos de notificaciones automáticas:

| Tipo                   | Cuándo se envía                                      | Frecuencia                     |
| ---------------------- | ---------------------------------------------------- | ------------------------------ |
| **TRIAL_ENDING**       | 3 y 1 días antes de que termine el período de prueba | Solo en esos días              |
| **PAYMENT_DUE**        | 3 días antes de que venza el pago mensual            | Solo ese día                   |
| **PAYMENT_OVERDUE**    | Cuando el pago está vencido (1-6 días)               | Días 1, 3, 5                   |
| **SUSPENSION_WARNING** | Cuando el pago tiene 7 días de retraso               | Solo día 7                     |
| **SUSPENDED**          | Cuando el pago tiene más de 7 días de retraso        | Cada 7 días (día 8, 15, 22...) |

---

## 🔍 Preview de Notificaciones

**Nueva funcionalidad:** Página de vista previa para validar notificaciones antes de enviarlas.

### Acceso

1. Ingresa como **ADMINISTRADOR**
2. Ve a **Dashboard** → **Preview de Notificaciones**
3. O accede directamente a: `/dashboard/notificaciones-preview`

### Qué muestra

- ✅ **Total de propietarios** activos en el sistema
- 📧 **Notificaciones a enviar** en la próxima ejecución del cron
- ✅ **Propietarios sin notificaciones** (al día)
- 📋 **Lista detallada** de cada propietario con:
  - Estado actual (trial, activo, vencido, suspendido)
  - Días restantes o días de retraso
  - Si recibirá notificación o no

### Casos de uso

**Antes de configurar el cron:**

- Verifica que las notificaciones se calcularían correctamente
- Identifica propietarios que recibirán emails
- Valida las reglas de negocio

**Testing y debugging:**

- Simula la ejecución del cron sin enviar emails
- Verifica cambios en configuración de pagos
- Identifica problemas antes de producción

**Monitoreo continuo:**

- Revisa el estado de todos los propietarios
- Anticipa qué notificaciones se enviarán mañana
- Detecta propietarios en riesgo de suspensión

### Ejemplo de uso

```bash
# 1. Configura las variables de entorno
NEXT_PUBLIC_CRON_SECRET="tu_cron_secret_aqui"

# 2. Accede a la página de preview
# Navega a: /dashboard/notificaciones-preview

# 3. Revisa las estadísticas y notificaciones
# 4. Si todo se ve correcto, habilita el cron en Vercel
```

### 📧 Enviar Emails de Prueba

**Nueva funcionalidad:** Envía emails de prueba para validar la configuración de Resend.

#### Características

- **Seleccionar propietario:** Elige un propietario existente del dropdown
- **Email manual:** O ingresa cualquier email manualmente
- **Tipos de notificación:** Selecciona entre los 8 tipos disponibles
- **Validación instantánea:** Ve si el email se envió correctamente

#### Cómo usar

1. **Opción 1: Seleccionar propietario**

   ```
   1. En el dropdown "Seleccionar Propietario", elige un propietario
   2. Se usará su email y nombre real
   3. Selecciona el tipo de notificación
   4. Click en "Enviar Email de Prueba"
   ```

2. **Opción 2: Email manual**
   ```
   1. Deja el dropdown en "Ninguno"
   2. Ingresa un email en "Ingresar Email Manual"
   3. Selecciona el tipo de notificación
   4. Click en "Enviar Email de Prueba"
   ```

#### Tipos de notificación disponibles

- **Período de prueba terminando (3 días)** - `trial_ending_3`
- **Período de prueba terminando (1 día)** - `trial_ending_1`
- **Pago próximo a vencer (3 días)** - `payment_due_soon`
- **Pago vencido (1 día)** - `payment_overdue_1`
- **Pago vencido (3 días)** - `payment_overdue_3`
- **Pago vencido (5 días)** - `payment_overdue_5`
- **Advertencia de suspensión (7 días)** - `suspension_warning`
- **Cuenta suspendida** - `suspended`

#### Notas importantes

⚠️ **Los emails de prueba incluyen un banner amarillo** que indica claramente que es un email de prueba.

✅ **Validación de email:** El sistema valida que el email sea válido antes de enviar.

🔒 **Solo administradores:** Solo usuarios con rol ADMINISTRADOR pueden enviar emails de prueba.

📧 **Usa Resend:** Los emails de prueba se envían a través de Resend, igual que los reales.

#### Ejemplo de uso

```bash
# Escenario: Validar que los emails lleguen correctamente

# 1. Ve a /dashboard/notificaciones-preview
# 2. En la sección "Enviar Email de Prueba":
#    - Ingresa tu email personal en "Email Manual"
#    - Selecciona "Período de prueba terminando (3 días)"
#    - Click en "Enviar Email de Prueba"
# 3. Revisa tu bandeja de entrada
# 4. Verifica que el email tenga el formato correcto
# 5. Repite con diferentes tipos de notificación
```

---

NEXT_PUBLIC_CRON_SECRET=tu_secreto_aqui

# 2. Accede a la página

http://localhost:3000/dashboard/notificaciones-preview

# 3. Click en "Actualizar" para refrescar el análisis

# 4. Revisa la lista de notificaciones

# Verde = Activo, no requiere notificación

# Amarillo = Advertencia, se notificará

# Rojo = Suspendido o crítico, se notificará

````

---

## ⏰ Configuración de Cron Jobs

Necesitás ejecutar el endpoint `/api/notifications/check` **una vez al día**.

### Opción 1: Vercel Cron Jobs (Recomendado para Vercel)

1. Crea el archivo `vercel.json` en la raíz del proyecto:

```json
{
  "crons": [
    {
      "path": "/api/notifications/check",
      "schedule": "0 9 * * *"
    }
  ]
}
````

2. Agrega el header de autorización en el archivo:

```json
{
  "crons": [
    {
      "path": "/api/notifications/check",
      "schedule": "0 9 * * *",
      "headers": {
        "authorization": "Bearer $CRON_SECRET"
      }
    }
  ]
}
```

3. Asegurate de tener `CRON_SECRET` en tus variables de entorno de Vercel

**Nota:** El schedule `0 9 * * *` significa "todos los días a las 9:00 AM UTC"

### Opción 2: EasyCron (Alternativa gratuita)

1. Registrate en [https://www.easycron.com](https://www.easycron.com)
2. Crea un nuevo cron job:
   - **URL:** `https://tu-dominio.com/api/notifications/check`
   - **Cron Expression:** `0 9 * * *` (9 AM diario)
   - **HTTP Method:** POST
   - **HTTP Headers:** Agrega:
     ```
     Authorization: Bearer tu_cron_secret_aqui
     ```

### Opción 3: GitHub Actions (Para repositorios públicos/privados)

Crea el archivo `.github/workflows/notifications.yml`:

```yaml
name: Enviar Notificaciones Diarias

on:
  schedule:
    # Ejecutar todos los días a las 9:00 AM UTC
    - cron: "0 9 * * *"
  workflow_dispatch: # Permite ejecutar manualmente

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Ejecutar endpoint de notificaciones
        run: |
          curl -X POST https://tu-dominio.com/api/notifications/check \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

Luego agrega `CRON_SECRET` a los secrets del repositorio en GitHub.

### Opción 4: Cron-job.org (Gratis)

1. Registrate en [https://cron-job.org](https://cron-job.org)
2. Crea un nuevo job:
   - **URL:** `https://tu-dominio.com/api/notifications/check`
   - **Schedule:** Daily at 09:00
   - **Request method:** POST
   - **Request headers:**
     ```
     Authorization: Bearer tu_cron_secret
     ```

---

## 🧪 Testing Manual

### 1. Verificar análisis de propietarios (GET)

```bash
curl -X GET https://tu-dominio.com/api/notifications/check \
  -H "Authorization: Bearer tu_cron_secret"
```

Esto te mostrará qué propietarios recibirían notificaciones sin enviarlas realmente.

### 2. Ejecutar notificaciones manualmente (POST)

```bash
curl -X POST https://tu-dominio.com/api/notifications/check \
  -H "Authorization: Bearer tu_cron_secret" \
  -H "Content-Type: application/json"
```

Esto **enviará** las notificaciones reales.

### 3. Test desde el código

También podés crear un script de prueba:

```typescript
// scripts/test-notifications.ts
import { sendNotification } from "@/lib/notification-utils";

const testOwner = {
  id: "test-id",
  email: "tu-email@example.com",
  fullName: "Test Owner",
  phone: "+5491123456789",
  becameOwnerAt: new Date(),
  subscriptionPaidUntil: null,
};

async function test() {
  const result = await sendNotification("TRIAL_ENDING", testOwner, {
    daysRemaining: 3,
    monthlyFee: 5000,
  });

  console.log("Resultado:", result);
}

test();
```

---

## 🎨 Personalización de Emails

Para personalizar los emails, editá el archivo:

```
lib/notification-utils.ts
```

En la función `generateEmailContent()` podés modificar:

- Colores
- Textos
- Estructura HTML
- Tono del mensaje

---

## 🔍 Monitoreo y Logs

Los logs de notificaciones se pueden ver en:

1. **Consola del servidor:**

   ```
   🔔 Iniciando verificación de notificaciones...
   📧 Enviando notificación TRIAL_ENDING a user@email.com
   ✅ Verificación completada: 5 notificaciones enviadas
   ```

2. **Dashboard de Resend:**

   - Ve a [https://resend.com/emails](https://resend.com/emails)
   - Verás todos los emails enviados, abiertos, etc.

3. **Logs de la API:**
   - Cada ejecución del cron retorna un JSON con el resumen
   - Podés guardarlo en una base de datos si querés historial

---

## 🐛 Troubleshooting

### No se envían emails

**Posibles causas:**

1. **API Key inválida**

   - Verificá que `RESEND_API_KEY` esté correcta
   - Regenerá la key en Resend si es necesario

2. **Email inválido**

   - Asegurate que los propietarios tengan emails válidos en la BD
   - Verificá que `NOTIFICATION_FROM_EMAIL` sea correcto

3. **Límite de Resend alcanzado**
   - Plan gratuito: 100 emails/día
   - Plan Pro: 50,000 emails/mes

### Cron job no se ejecuta

1. **Verificá la configuración del cron**

   - Revisá el schedule expression
   - Asegurate que el timezone sea correcto

2. **Headers de autorización**

   - Verificá que `CRON_SECRET` coincida en ambos lados

3. **Logs del proveedor**
   - Revisá los logs de Vercel/EasyCron/etc.

### Emails van a spam

1. **Verifica tu dominio en Resend**
2. **Agrega registros SPF/DKIM**
3. **Usa un email corporativo en `from`**

---

## 📊 Métricas Recomendadas

Para producción, considera guardar:

- ✅ Cantidad de notificaciones enviadas por día
- ✅ Tasa de apertura de emails (Resend lo provee)
- ✅ Propietarios que regularizaron tras notificación
- ✅ Tiempo promedio entre notificación y pago

---

## 🚀 Próximos Pasos

Después de configurar las notificaciones, considera:

1. **Dashboard de estadísticas** - Ver métricas de pagos
2. **Notificaciones en la app** - Alertas dentro del dashboard
3. **WhatsApp automatizado** - Integración con API de WhatsApp Business
4. **Recordatorios personalizados** - Por negocio o monto

---

## 📞 Soporte

Si tenés problemas con la configuración:

1. Revisá los logs del servidor
2. Verificá las variables de entorno
3. Probá el endpoint GET primero
4. Contactá a soporte técnico

---

**¡Listo! 🎉** Tu sistema de notificaciones está configurado y funcionando.

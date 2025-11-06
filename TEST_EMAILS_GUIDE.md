# 📧 Guía de Prueba de Emails

## Funcionalidad Agregada

Se agregó una nueva sección en la página de **Preview de Notificaciones** que te permite enviar emails de prueba para validar la configuración del sistema de notificaciones.

## 🚀 Cómo Usarlo

### 1. Acceder a la Página

1. Inicia sesión como **ADMINISTRADOR**
2. Ve al **Dashboard**
3. Click en **"Preview de Notificaciones"**
4. Scrollea hasta la sección **"Enviar Email de Prueba"** (con ícono verde 📧)

### 2. Enviar un Email de Prueba

Tienes dos opciones:

#### Opción A: Seleccionar un Propietario Existente

```
1. En el dropdown "Seleccionar Propietario":
   - Elige un propietario de la lista
   - El sistema usará su email y nombre real

2. Selecciona el tipo de notificación:
   - Período de prueba terminando (3 o 1 días)
   - Pago próximo a vencer
   - Pago vencido (1, 3 o 5 días)
   - Advertencia de suspensión
   - Cuenta suspendida

3. Click en "Enviar Email de Prueba"
```

#### Opción B: Usar un Email Manual

```
1. Deja el dropdown en "Ninguno (usar email manual)"

2. En el campo "O Ingresar Email Manual":
   - Escribe cualquier email válido (ejemplo: tu email personal)

3. Selecciona el tipo de notificación

4. Click en "Enviar Email de Prueba"
```

### 3. Validar el Resultado

- ✅ **Éxito:** Verás un mensaje verde confirmando el envío
- ❌ **Error:** Verás un mensaje rojo con el detalle del error
- 📧 **Revisa tu bandeja:** El email debería llegar en segundos

## 📋 Tipos de Notificación Disponibles

| Tipo                   | Descripción                         | Uso Recomendado                      |
| ---------------------- | ----------------------------------- | ------------------------------------ |
| **trial_ending_3**     | Período de prueba termina en 3 días | Prueba recordatorios tempranos       |
| **trial_ending_1**     | Período de prueba termina en 1 día  | Prueba recordatorios urgentes        |
| **payment_due_soon**   | Pago vence en 3 días                | Prueba recordatorios pre-vencimiento |
| **payment_overdue_1**  | Pago vencido hace 1 día             | Prueba primer recordatorio           |
| **payment_overdue_3**  | Pago vencido hace 3 días            | Prueba recordatorio intermedio       |
| **payment_overdue_5**  | Pago vencido hace 5 días            | Prueba recordatorio final            |
| **suspension_warning** | Advertencia de suspensión (día 7)   | Prueba advertencia crítica           |
| **suspended**          | Cuenta suspendida                   | Prueba notificación de suspensión    |

## 🔍 Qué Validar en los Emails

Cuando recibas los emails de prueba, verifica:

1. **Banner de Prueba:**

   - Debe aparecer un banner amarillo que dice "⚠️ EMAIL DE PRUEBA"
   - Esto te asegura que los emails de prueba son claramente identificables

2. **Formato y Diseño:**

   - El email debe verse profesional
   - Los colores deben variar según la urgencia (verde → amarillo → rojo)
   - Debe ser responsive (verse bien en móvil y desktop)

3. **Contenido:**

   - El asunto debe incluir "[PRUEBA]"
   - El nombre del propietario debe aparecer correctamente
   - Los días/fechas deben tener sentido
   - Los botones de acción deben funcionar

4. **Entrega:**
   - El email debe llegar en segundos
   - No debe ir a spam
   - El remitente debe ser el configurado en `NOTIFICATION_FROM_EMAIL`

## ⚙️ Requisitos Previos

Antes de probar, asegúrate de tener configurado:

```env
# En tu archivo .env o .env.local

# API Key de Resend (obtén una en https://resend.com)
RESEND_API_KEY="re_..."

# Email del remitente (debe estar verificado en Resend)
NOTIFICATION_FROM_EMAIL="notificaciones@tudominio.com"

# Email del admin para contacto
ADMIN_EMAIL="admin@tudominio.com"

# URL de tu aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Secret para el cron (puede ser cualquier string)
CRON_SECRET="tu_secret_aqui"
NEXT_PUBLIC_CRON_SECRET="tu_secret_aqui"
```

## 🎯 Flujo de Prueba Recomendado

### Prueba Completa

```bash
# 1. Probar con tu email personal
Envía todos los 8 tipos de notificación a tu email
Verifica que todos lleguen correctamente

# 2. Probar con un propietario real
Selecciona un propietario de prueba
Envía un tipo de notificación que tenga sentido para su estado
Pregúntale si le llegó correctamente

# 3. Validar diferentes escenarios
- Email inexistente (debería fallar con error claro)
- Email sin @ (debería validar formato)
- Sin seleccionar nada (botón debería estar deshabilitado)

# 4. Verificar en Resend Dashboard
Ingresa a https://resend.com/emails
Verifica que los emails aparezcan en el log
Revisa las métricas de entrega
```

## 🐛 Troubleshooting

### El email no llega

1. **Verifica Resend:**

   - ¿Está configurado `RESEND_API_KEY`?
   - ¿El dominio del remitente está verificado?
   - ¿Hay saldo/cuota disponible?

2. **Revisa Spam:**

   - Algunos proveedores marcan emails automatizados como spam
   - Agrega el remitente a tus contactos

3. **Verifica la consola:**
   - Abre las DevTools del navegador
   - Ve a la pestaña Network
   - Busca la llamada a `/api/notifications/test`
   - Revisa si hay errores

### Error al enviar

1. **"No autorizado":**

   - Asegúrate de estar logueado como ADMINISTRADOR

2. **"Email no válido":**

   - Verifica que el email tenga formato correcto (tiene @ y dominio)

3. **"Error de Resend":**
   - Revisa que la API key sea válida
   - Verifica que el email del remitente esté verificado

## 📝 Notas Adicionales

- **Límite de Resend:** La cuenta gratuita tiene límite de 100 emails/día
- **No afecta a propietarios:** Los emails de prueba NO se registran en la base de datos
- **Solo administradores:** Esta funcionalidad solo está disponible para usuarios con rol ADMINISTRADOR
- **Desarrollo local:** Funciona tanto en desarrollo como en producción

## ✅ Lista de Verificación

Antes de habilitar el cron en producción:

- [ ] Envié emails de prueba a mi email personal
- [ ] Todos los 8 tipos de notificación llegaron correctamente
- [ ] Los emails no fueron a spam
- [ ] El formato y diseño se ven profesionales
- [ ] Los botones de acción funcionan
- [ ] Probé con un propietario real y le llegó
- [ ] Verifiqué en el dashboard de Resend que todo funciona
- [ ] Los emails tienen el banner de "PRUEBA" claramente visible

---

## 🎉 ¡Listo!

Ahora puedes enviar emails de prueba para validar tu configuración antes de habilitar el cron automático.

Si todo funciona correctamente, procede a configurar el cron en Vercel para automatizar las notificaciones.

# 🎨 NeoBiz Pulse - Guía de Colores y Uso

## Paleta de Colores Implementada

### 🌞 Modo Claro

| Color      | Hex       | Variable CSS   | Uso Principal                           |
| ---------- | --------- | -------------- | --------------------------------------- |
| Background | `#F8FAFC` | `--background` | Fondo principal de la app               |
| Foreground | `#0F172A` | `--foreground` | Texto principal                         |
| Primary    | `#2563EB` | `--primary`    | Botones principales, enlaces, CTAs      |
| Secondary  | `#7C3AED` | `--secondary`  | Elementos secundarios, badges           |
| Accent     | `#10B981` | `--accent`     | Estados de éxito, highlights            |
| Muted      | `#E2E8F0` | `--muted`      | Fondos secundarios, texto deshabilitado |
| Border     | `#CBD5E1` | `--border`     | Bordes de elementos                     |
| Card       | `#FFFFFF` | `--card`       | Tarjetas, contenedores elevados         |

### 🌙 Modo Oscuro

| Color      | Hex       | Variable CSS   | Uso Principal                         |
| ---------- | --------- | -------------- | ------------------------------------- |
| Background | `#0F172A` | `--background` | Fondo principal oscuro                |
| Foreground | `#F8FAFC` | `--foreground` | Texto claro                           |
| Primary    | `#3B82F6` | `--primary`    | Botones principales (más brillante)   |
| Secondary  | `#A78BFA` | `--secondary`  | Elementos secundarios (púrpura suave) |
| Accent     | `#34D399` | `--accent`     | Verde brillante para destacar         |
| Muted      | `#1E293B` | `--muted`      | Fondos secundarios oscuros            |
| Border     | `#334155` | `--border`     | Bordes sutiles                        |
| Card       | `#1E293B` | `--card`       | Superficies elevadas                  |

## 🎯 Ejemplos de Uso

### Botones

#### Botón Primary (Acción principal)

```tsx
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Crear Negocio
</Button>
```

#### Botón Secondary (Acción secundaria)

```tsx
<Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
  Ver Más
</Button>
```

#### Botón Accent (Éxito/Confirmación)

```tsx
<Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
  Confirmar
</Button>
```

#### Botón con Gradiente

```tsx
<Button className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all">
  Premium Action
</Button>
```

### Tarjetas

#### Tarjeta Básica

```tsx
<Card className="bg-card border-border hover:shadow-lg transition-all">
  <CardHeader>
    <CardTitle className="text-foreground">Título</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Contenido de la tarjeta
  </CardContent>
</Card>
```

#### Tarjeta con Borde Primary

```tsx
<Card className="bg-card border-2 border-primary/20 hover:border-primary/50 transition-colors">
  <CardContent>Contenido destacado</CardContent>
</Card>
```

### Badges

#### Badge Primary

```tsx
<Badge className="bg-primary/10 text-primary border-primary/20">Nuevo</Badge>
```

#### Badge Secondary

```tsx
<Badge className="bg-secondary/10 text-secondary border-secondary/20">
  Premium
</Badge>
```

#### Badge Accent (Éxito)

```tsx
<Badge className="bg-accent/10 text-accent border-accent/20">Activo</Badge>
```

### Inputs

#### Input con estilo NeoBiz

```tsx
<Input
  className="bg-background border-border text-foreground 
             placeholder:text-muted-foreground 
             focus:border-primary focus:ring-primary/20"
  placeholder="Escribe aquí..."
/>
```

### Alertas y Estados

#### Alerta de Éxito

```tsx
<div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
  <p className="text-accent font-medium">¡Operación exitosa!</p>
</div>
```

#### Alerta de Información

```tsx
<div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
  <p className="text-primary font-medium">Información importante</p>
</div>
```

#### Alerta de Advertencia

```tsx
<div className="p-4 bg-warning-500/10 border border-warning-500/20 rounded-lg">
  <p className="text-warning-600 dark:text-warning-500 font-medium">
    Atención requerida
  </p>
</div>
```

### Navegación

#### Navbar con NeoBiz Pulse

```tsx
<nav className="bg-background/80 backdrop-blur-xl border-b border-border">
  <Link className="text-foreground hover:text-primary transition-colors">
    Inicio
  </Link>
</nav>
```

#### Link Activo

```tsx
<Link className="text-primary font-medium border-b-2 border-primary">
  Dashboard
</Link>
```

### Texto y Tipografía

#### Título Principal

```tsx
<h1 className="text-4xl font-bold text-foreground">Bienvenido a NegociosApp</h1>
```

#### Texto Secundario

```tsx
<p className="text-muted-foreground">Descripción o texto secundario</p>
```

#### Texto Destacado

```tsx
<span className="text-primary font-semibold">Texto importante</span>
```

### Fondos y Superficies

#### Fondo con Gradiente Sutil

```tsx
<div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5">
  Contenido con fondo gradiente
</div>
```

#### Superficie Elevada

```tsx
<div className="bg-card shadow-lg rounded-xl border border-border p-6">
  Contenido elevado
</div>
```

### Dividers

#### Separador Horizontal

```tsx
<hr className="border-border my-6" />
```

#### Separador con Texto

```tsx
<div className="flex items-center gap-4 my-6">
  <hr className="flex-1 border-border" />
  <span className="text-muted-foreground text-sm">O</span>
  <hr className="flex-1 border-border" />
</div>
```

## 🎨 Clases Personalizadas Disponibles

### Gradientes

- `.gradient-primary` - Gradiente azul a púrpura
- `.gradient-accent` - Gradiente verde a azul

### Animaciones

- `.animate-shimmer` - Efecto de brillo animado

### Scrollbar

- Scrollbar personalizado automático en toda la app

## 📱 Responsive Design

Los colores se ajustan automáticamente según el modo (claro/oscuro) y el tamaño de pantalla:

```tsx
<div
  className="bg-background text-foreground 
                sm:bg-card sm:border sm:border-border sm:rounded-lg"
>
  Responsive container
</div>
```

## 🔄 Cambio de Tema

El tema se gestiona automáticamente con `next-themes`. Los usuarios pueden cambiar entre modo claro y oscuro usando el componente `ThemeToggle`.

## ✨ Mejores Prácticas

1. **Consistencia**: Usa siempre las variables del tema en lugar de colores hardcodeados
2. **Contraste**: Asegúrate de que el texto tenga suficiente contraste (usa `foreground` sobre `background`)
3. **Jerarquía**:
   - `primary` para acciones principales
   - `secondary` para acciones secundarias
   - `accent` para destacar éxitos o elementos importantes
4. **Hover States**: Usa `/90` o `/80` para estados hover (ej: `hover:bg-primary/90`)
5. **Bordes**: Usa `border-border` para bordes consistentes
6. **Sombras**: Combina sombras con hover para feedback visual

## 🎯 Accesibilidad

Todos los colores cumplen con WCAG 2.1 AA para contraste:

- Texto normal: mínimo 4.5:1
- Texto grande: mínimo 3:1
- Componentes UI: mínimo 3:1

## 🚀 Ventajas de NeoBiz Pulse

- ✅ Profesional y moderno
- ✅ Excelente contraste en ambos modos
- ✅ Colores vibrantes pero no sobrecargados
- ✅ Consistencia visual en toda la aplicación
- ✅ Fácil de mantener y extender
- ✅ Optimizado para negocios y productividad

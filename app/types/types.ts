// ============================================
// TIPOS BASADOS EN EL SCHEMA DE PRISMA
// ============================================

// Enums
export type OrderState =
  | "REGISTRADA"
  | "PENDIENTE_PAGO"
  | "PAGADA"
  | "PREPARANDO"
  | "ENVIADA"
  | "ENTREGADA"
  | "CANCELADA";

export type Role = "ADMINISTRADOR" | "PROPIETARIO" | "CLIENTE";

export type RoleRequestStatus = "PENDIENTE" | "APROBADA" | "RECHAZADA";

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "OVERDUE" | "SUSPENDED";

export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

export type BusinessStatus =
  | "ABIERTO"
  | "CERRADO_TEMPORAL"
  | "CERRADO_PERMANENTE";

export type AppUser = {
  // Identificador único del usuario
  id: string;

  // ID de Clerk (autenticación externa)
  clerkId: string | null;

  // Correo electrónico del usuario
  email: string | null;

  // Nombre del usuario
  name: string | null;

  // Teléfono del usuario
  phone: string | null;

  // Rol del usuario (ADMINISTRADOR, PROPIETARIO, CLIENTE)
  role: Role;

  // Negocios que posee el usuario (Relación)
  businesses?: Business[];

  // Órdenes realizadas por el usuario (Relación)
  orders?: Order[];

  // Fecha de creación del usuario
  createdAt: Date;

  // Fecha de última actualización del usuario
  updatedAt: Date;
};

export type OrderEvent = {
  // Identificador único del evento
  id: string;

  // ID de la orden asociada al evento
  orderId: string;

  // Relación con la orden (opcional cuando solo se usa el ID)
  order?: Order;

  // ID del usuario que realizó el evento
  actorId: string | null;

  // Tipo de evento
  type: string;

  // Nota adicional del evento
  note: string | null;

  // Fecha de creación del evento
  createdAt: Date;
};

export type Order = {
  // Identificador único de la orden
  id: string;

  // ID del negocio asociado a la orden
  businessId: string;

  // Relación con el negocio (opcional cuando solo se usa el ID)
  business?: Business;

  // ID del cliente que realiza la orden
  customerId: string;

  // Relación con el usuario cliente (opcional cuando solo se usa el ID)
  customer?: AppUser;

  // Ítems incluidos en la orden (Relación)
  items?: OrderItem[];

  // Total de la orden
  total: number;

  // Indica si la orden requiere envío
  shipping: boolean;

  // Latitud de la dirección de envío
  lat: number | null;

  // Longitud de la dirección de envío
  lng: number | null;

  // Dirección textual de envío
  addressText: string | null;

  // Estado actual de la orden
  state: OrderState;

  // Comprobante de pago
  paymentProof: string | null;

  // Nota adicional de la orden
  note: string | null;

  // Eventos asociados a la orden (Relación)
  events?: OrderEvent[];

  // Fecha de creación de la orden
  createdAt: Date;

  // Fecha de última actualización de la orden
  updatedAt: Date;
};

export type OrderItem = {
  // Identificador único del ítem
  id: string;

  // ID de la orden a la que pertenece el ítem
  orderId: string;

  // Relación con la orden (opcional cuando solo se usa el ID)
  order?: Order;

  // ID del producto incluido en el ítem
  productId: string;

  // Relación con el producto (opcional cuando solo se usa el ID)
  product?: Product;

  // Cantidad de productos en el ítem
  quantity: number;

  // Precio unitario del producto en el ítem
  unitPrice: number;
};

export type Product = {
  // Identificador único del producto
  id: string;

  // ID del negocio al que pertenece el producto
  businessId: string;

  // Relación con el negocio (opcional cuando solo se usa el ID)
  business?: Business;

  // ID de la categoría del producto
  categoryId: string | null;

  // Relación con la categoría (opcional cuando solo se usa el ID)
  category?: ProductCategory;

  // Nombre del producto
  name: string;

  // Descripción del producto
  description: string | null;

  // Precio del producto
  price: number;

  // Stock disponible del producto
  stock: number;

  // Código SKU del producto
  sku: string | null;

  // Indica si el producto está disponible
  available: boolean;

  // Imágenes del producto (JSON)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: any;

  // Ítems de orden que incluyen este producto (Relación)
  orderItems?: OrderItem[];

  // Fecha de creación del producto
  createdAt: Date;

  // Fecha de última actualización del producto
  updatedAt: Date;
};

export type ProductCategory = {
  // Identificador único de la categoría
  id: string;

  // Nombre de la categoría
  name: string;

  // Descripción de la categoría
  description: string | null;

  // Icono o emoji representativo de la categoría
  icon: string | null;

  // Orden de visualización de la categoría
  order: number;

  // Productos que pertenecen a esta categoría (Relación)
  products?: Product[];

  // Fecha de creación de la categoría
  createdAt: Date;

  // Fecha de última actualización de la categoría
  updatedAt: Date;
};

export type Business = {
  // Identificador único del negocio
  id: string;

  // ID del propietario del negocio
  ownerId: string;

  // Relación con el usuario propietario (opcional cuando solo se usa el ID)
  owner?: AppUser | { id: string; name: string | null; email: string | null };

  // Nombre del negocio
  name: string;

  // Slug único para el negocio
  slug: string;

  // Descripción del negocio
  description: string | null;

  // Rubro o categoría del negocio
  rubro: string;

  // URL de la imagen o logo del negocio
  img: string | null;

  // Teléfono de WhatsApp del negocio
  whatsappPhone: string | null;

  // Alias para pagos del negocio
  aliasPago: string | null;

  // Dirección textual del negocio
  addressText: string | null;

  // Latitud de la ubicación del negocio
  lat: number | null;

  // Longitud de la ubicación del negocio
  lng: number | null;

  // Indica si el negocio ofrece servicio de envío a domicilio
  hasShipping: boolean;

  // Valor del envío del negocio (deprecado - usar shippingRanges)
  shippingCost: number | null;

  // Distancia máxima de envío en kilómetros (null = sin límite)
  maxShippingDistance: number | null;

  // Rangos de costos de envío por distancia (JSON)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shippingRanges: any;

  // Estado actual del negocio
  status: BusinessStatus;

  // Motivo por el cual el negocio está cerrado
  closedReason: string | null;

  // Horarios de atención del negocio (JSON)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schedule: any;

  // Días especiales de cierre (JSON)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specialClosedDays: any;

  // Indica si el negocio acepta pedidos fuera del horario de atención
  acceptOrdersOutsideHours: boolean;

  // Tiempo estimado de preparación de pedidos (en minutos)
  preparationTime: number | null;

  // Productos ofrecidos por el negocio (Relación)
  products?: Product[];

  // Órdenes asociadas al negocio (Relación)
  orders?: Order[];

  // Promociones del negocio (Relación)
  promotions?: Promotion[];

  // Fecha de creación del negocio
  createdAt: Date;

  // Fecha de última actualización del negocio
  updatedAt: Date;
};

// Tipo para negocios en el dashboard de gestión
export type BusinessWithRelations = Business & {
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
  _count: {
    products: number;
  };
};

// Tipo para solicitudes de cambio de rol
export type RoleRequest = {
  // Identificador único de la solicitud
  id: string;

  // ID del usuario que solicita el cambio de rol
  userId: string;

  // Relación con el usuario (opcional cuando solo se usa el ID)
  user?: AppUser & {
    fullName: string | null;
    email: string | null;
    avatar: string | null;
  };

  // Rol solicitado
  requestedRole: Role;

  // Descripción o motivo de la solicitud
  description: string;

  // Estado de la solicitud
  status: RoleRequestStatus;

  // ID del administrador que procesó la solicitud
  reviewedBy: string | null;

  // Fecha en que fue revisada la solicitud
  reviewedAt: Date | null;

  // Motivo del rechazo o aprobación
  reviewNote: string | null;

  // Fecha de creación de la solicitud
  createdAt: Date;

  // Fecha de última actualización de la solicitud
  updatedAt: Date;
};

// Tipo para pagos de suscripción
export type Payment = {
  // Identificador único del pago
  id: string;

  // ID del propietario que realizó el pago
  ownerId: string;

  // Relación con el usuario propietario (opcional)
  owner?: {
    id: string;
    fullName: string | null;
    email: string | null;
  };

  // Monto del pago
  amount: number;

  // Mes y año al que corresponde el pago
  periodMonth: string;

  // Estado del pago
  status: PaymentStatus;

  // URL del comprobante de pago
  proofUrl: string | null;

  // ID público de Cloudinary del comprobante
  proofPublicId: string | null;

  // Nota del propietario
  ownerNote: string | null;

  // Nota del administrador
  adminNote: string | null;

  // ID del administrador que revisó
  reviewedBy: string | null;

  // Fecha de revisión
  reviewedAt: Date | string | null;

  // Fecha de creación
  createdAt: Date | string;

  // Fecha de actualización
  updatedAt: Date | string;
};

// Tipo para configuración de pagos
export type PaymentConfig = {
  // Identificador único
  id: string;

  // Monto mensual de la suscripción
  monthlyFee: number;

  // Banco receptor
  bankName: string;

  // Alias bancario para transferencias
  bankAlias: string;

  // CBU/CVU para transferencias
  bankCbu: string;

  // Titular de la cuenta
  accountHolder: string;

  // Tipo de cuenta
  accountType: string | null;

  // Email de contacto para pagos
  supportEmail: string;

  // Teléfono de WhatsApp para consultas
  supportPhone: string;

  // Fecha de creación
  createdAt: Date | string;

  // Fecha de actualización
  updatedAt: Date | string;
};

// Tipo para promociones
export type Promotion = {
  // Identificador único de la promoción
  id: string;

  // ID del negocio al que pertenece
  businessId: string;

  // Relación con el negocio (opcional)
  business?: Business;

  // Nombre de la promoción
  name: string;

  // Descripción de la promoción
  description: string | null;

  // Precio de la promoción
  price: number;

  // URL de la imagen de la promoción
  image: string | null;

  // Indica si está activa
  isActive: boolean;

  // Fecha de inicio
  startDate: Date | string | null;

  // Fecha de fin
  endDate: Date | string | null;

  // Stock disponible (null = ilimitado)
  stock: number | null;

  // Productos incluidos en la promoción (Relación)
  products?: PromotionProduct[];

  // Fecha de creación
  createdAt: Date | string;

  // Fecha de actualización
  updatedAt: Date | string;
};

// Tipo para productos dentro de una promoción
export type PromotionProduct = {
  // Identificador único
  id: string;

  // ID de la promoción
  promotionId: string;

  // Relación con la promoción (opcional)
  promotion?: Promotion;

  // ID del producto
  productId: string;

  // Relación con el producto (opcional)
  product?: Product;

  // Cantidad de este producto en la promoción
  quantity: number;

  // Fecha de creación
  createdAt: Date | string;
};

// Tipo para promociones con productos incluidos
export type PromotionWithProducts = Promotion & {
  products: (PromotionProduct & {
    product: Product;
  })[];
};

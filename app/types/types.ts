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
  owner?: AppUser;

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

  // Valor del envío del negocio
  shippingCost: number | null;

  // Productos ofrecidos por el negocio (Relación)
  products?: Product[];

  // Órdenes asociadas al negocio (Relación)
  orders?: Order[];

  // Fecha de creación del negocio
  createdAt: Date;

  // Fecha de última actualización del negocio
  updatedAt: Date;
};

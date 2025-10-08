// Nota: Deberás tener los tipos 'AppUser', 'Product' y 'Order' definidos
// para que este Type funcione completamente.
type OrderState =
  | "REGISTRADA"
  | "PENDIENTE_PAGO"
  | "PAGADA"
  | "PREPARANDO"
  | "ENVIADA"
  | "ENTREGADA"
  | "CANCELADA";

type Role = "ADMINISTRADOR" | "PROPIETARIO" | "CLIENTE";

type AppUser = {
  // Identificador único del usuario
  id: string;

  // ID de Clerk (autenticación externa) (opcional: String?)
  clerkId?: string;

  // Correo electrónico del usuario (opcional: String?)
  email?: string;

  // Nombre del usuario (opcional: String?)
  name?: string;

  // Teléfono del usuario (opcional: String?)
  phone?: string;

  // Rol del usuario (Asume que Role es un enum o string)
  role: Role;

  // Negocios que posee el usuario (Relación)
  businesses: Business[];

  // Órdenes realizadas por el usuario (Relación)
  orders: Order[];

  // Fecha de creación del usuario
  createdAt: Date;

  // Fecha de última actualización del usuario
  updatedAt: Date;
};

type OrderEvent = {
  // Identificador único del evento
  id: string;

  // ID de la orden asociada al evento
  orderId: string;
  // Relación con la orden
  order: Order;

  // ID del usuario que realizó el evento (opcional: String?)
  actorId?: string;
  // Nota: Si OrderEvent no tiene una relación directa con AppUser, solo necesitas el ID.

  // Tipo de evento (ej: 'CREADA', 'PAGO_RECIBIDO', 'CANCELADA')
  type: string;

  // Nota adicional del evento (opcional: String?)
  note?: string;

  // Fecha de creación del evento
  createdAt: Date;
};

type Order = {
  // Identificador único de la orden
  id: string;

  // ID del negocio asociado a la orden
  businessId: string;
  // Relación con el negocio
  business: Business;

  // ID del cliente que realiza la orden
  customerId: string;
  // Relación con el usuario cliente
  customer: AppUser;

  // Ítems incluidos en la orden (Relación)
  items: OrderItem[];

  // Total de la orden
  total: number; // Mapea Float de Prisma

  // Indica si la orden requiere envío
  shipping: boolean;

  // Latitud de la dirección de envío (opcional: Float?)
  lat?: number;

  // Longitud de la dirección de envío (opcional: Float?)
  lng?: number;

  // Dirección textual de envío (opcional: String?)
  addressText?: string;

  // Estado actual de la orden (Asume que OrderState es un enum o string)
  state: OrderState;

  // Comprobante de pago (opcional: String?)
  paymentProof?: string;

  // Nota adicional de la orden (opcional: String?)
  note?: string;

  // Eventos asociados a la orden (Relación)
  events: OrderEvent[];

  // Fecha de creación de la orden
  createdAt: Date;

  // Fecha de última actualización de la orden
  updatedAt: Date;
};

type OrderItem = {
  // Identificador único del ítem
  id: string;

  // ID de la orden a la que pertenece el ítem
  orderId: string;
  // Relación con la orden
  order: Order;

  // ID del producto incluido en el ítem
  productId: string;
  // Relación con el producto
  product: Product;

  // Cantidad de productos en el ítem
  quantity: number; // Mapea Int de Prisma

  // Precio unitario del producto en el ítem
  unitPrice: number; // Mapea Float de Prisma
};

type Product = {
  // Identificador único del producto
  id: string;

  // ID del negocio al que pertenece el producto
  businessId: string;
  // Relación con el negocio (opcional si sólo usas el ID)
  business: Business;

  // Nombre del producto
  name: string;

  // Descripción del producto (opcional: String?)
  description?: string;

  // Precio del producto
  price: number; // Mapea Float de Prisma

  // Stock disponible del producto
  stock: number; // Mapea Int de Prisma

  // Código SKU del producto (opcional: String?)
  sku?: string;

  // Indica si el producto está disponible
  available: boolean;

  // Imágenes del producto (Json? - puedes usar 'any' o un tipo de objeto más específico)
  images?: any;
  // Alternativa más precisa si sabes la estructura: images?: { url: string, alt?: string }[]

  // Ítems de orden que incluyen este producto (Relación)
  orderItems: OrderItem[];

  // Fecha de creación del producto
  createdAt: Date;

  // Fecha de última actualización del producto
  updatedAt: Date;
};

export type Business = {
  // Identificador único del negocio
  id: string;

  // ID del propietario del negocio
  ownerId: string;
  // Relación con el usuario propietario (opcional si sólo usas el ID)
  owner: AppUser;

  // Nombre del negocio
  name: string;

  // Slug único para el negocio
  slug: string;

  // Descripción del negocio (opcional: String?)
  description?: string;

  // Rubro o categoría del negocio (Corresponde a 'rubro' en el modelo)
  rubro: string;

  // Teléfono de WhatsApp del negocio (opcional: String?)
  whatsappPhone?: string;

  // Alias para pagos del negocio (opcional: String?)
  aliasPago?: string;

  // Dirección textual del negocio (opcional: String?)
  addressText?: string;

  // Latitud de la ubicación del negocio (opcional: Float?)
  lat?: number;

  // Longitud de la ubicación del negocio (opcional: Float?)
  lng?: number;

  // Productos ofrecidos por el negocio (Relación)
  products: Product[];

  // Órdenes asociadas al negocio (Relación)
  orders: Order[];

  // Fecha de creación del negocio
  createdAt: Date;

  // Fecha de última actualización del negocio
  updatedAt: Date;
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Crear categorías predefinidas del sistema
  const categories = [
    {
      name: "Empanadas",
      description: "Empanadas de diferentes sabores y tipos",
      icon: "🥟",
      order: 1,
    },
    {
      name: "Pizzas",
      description: "Pizzas artesanales y tradicionales",
      icon: "🍕",
      order: 2,
    },
    {
      name: "Hamburguesas",
      description: "Hamburguesas caseras y gourmet",
      icon: "🍔",
      order: 3,
    },
    {
      name: "Sandwiches",
      description: "Sandwiches y sándwiches premium",
      icon: "🥪",
      order: 4,
    },
    {
      name: "Pastas",
      description: "Pastas frescas y salsas",
      icon: "🍝",
      order: 5,
    },
    {
      name: "Carnes",
      description: "Cortes de carne y parrilla",
      icon: "🥩",
      order: 6,
    },
    {
      name: "Pollo",
      description: "Platos con pollo y aves",
      icon: "🍗",
      order: 7,
    },
    {
      name: "Pescados y Mariscos",
      description: "Pescados frescos y mariscos",
      icon: "🐟",
      order: 8,
    },
    {
      name: "Ensaladas",
      description: "Ensaladas frescas y saludables",
      icon: "🥗",
      order: 9,
    },
    {
      name: "Sopas",
      description: "Sopas y caldos caseros",
      icon: "🍲",
      order: 10,
    },
    {
      name: "Postres",
      description: "Postres, tortas y dulces",
      icon: "🍰",
      order: 11,
    },
    {
      name: "Helados",
      description: "Helados artesanales y comerciales",
      icon: "🍦",
      order: 12,
    },
    {
      name: "Panadería",
      description: "Pan, facturas y productos de panadería",
      icon: "🥐",
      order: 13,
    },
    {
      name: "Pastelería",
      description: "Tortas, tartas y productos de pastelería",
      icon: "🎂",
      order: 14,
    },
    {
      name: "Bebidas Sin Alcohol",
      description: "Gaseosas, jugos, aguas",
      icon: "🥤",
      order: 15,
    },
    {
      name: "Bebidas Alcohólicas",
      description: "Cervezas, vinos, tragos",
      icon: "🍺",
      order: 16,
    },
    {
      name: "Cafetería",
      description: "Café, té e infusiones",
      icon: "☕",
      order: 17,
    },
    {
      name: "Desayunos y Meriendas",
      description: "Opciones para desayuno y merienda",
      icon: "🥞",
      order: 18,
    },
    {
      name: "Comida Rápida",
      description: "Comida rápida y snacks",
      icon: "🌭",
      order: 19,
    },
    {
      name: "Comida Vegana",
      description: "Opciones 100% veganas",
      icon: "🥬",
      order: 20,
    },
    {
      name: "Comida Vegetariana",
      description: "Opciones vegetarianas",
      icon: "🥕",
      order: 21,
    },
    {
      name: "Comida Saludable",
      description: "Opciones fitness y saludables",
      icon: "🥑",
      order: 22,
    },
    {
      name: "Comida Internacional",
      description: "Platos de cocinas del mundo",
      icon: "🌍",
      order: 23,
    },
    {
      name: "Comida Mexicana",
      description: "Tacos, burritos y más",
      icon: "🌮",
      order: 24,
    },
    {
      name: "Comida China",
      description: "Platos de cocina china",
      icon: "🥡",
      order: 25,
    },
    {
      name: "Comida Japonesa",
      description: "Sushi, ramen y más",
      icon: "🍱",
      order: 26,
    },
    {
      name: "Comida Italiana",
      description: "Pastas, pizzas y más",
      icon: "🇮🇹",
      order: 27,
    },
    {
      name: "Minutas",
      description: "Milanesas, papas fritas y minutas",
      icon: "🍽️",
      order: 28,
    },
    {
      name: "Frutos Secos",
      description: "Almendras, nueces y frutos secos",
      icon: "🥜",
      order: 29,
    },
    {
      name: "Snacks",
      description: "Papas fritas, palitos y snacks",
      icon: "🍿",
      order: 30,
    },
    {
      name: "Productos de Almacén",
      description: "Productos de almacén y despensa",
      icon: "🛒",
      order: 31,
    },
    {
      name: "Frutas y Verduras",
      description: "Frutas y verduras frescas",
      icon: "🍎",
      order: 32,
    },
    {
      name: "Lácteos",
      description: "Leche, quesos y lácteos",
      icon: "🥛",
      order: 33,
    },
    {
      name: "Fiambrería",
      description: "Jamón, queso, salame y fiambres",
      icon: "🧀",
      order: 34,
    },
    {
      name: "Congelados",
      description: "Productos congelados",
      icon: "❄️",
      order: 35,
    },
    {
      name: "Artículos de Limpieza",
      description: "Productos de limpieza para el hogar",
      icon: "🧹",
      order: 36,
    },
    {
      name: "Artículos de Higiene",
      description: "Productos de higiene personal",
      icon: "🧴",
      order: 37,
    },
    {
      name: "Otros",
      description: "Otros productos y servicios",
      icon: "📦",
      order: 99,
    },
  ];

  console.log("📂 Creando categorías predefinidas...");
  for (const category of categories) {
    const created = await prisma.productCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
    console.log(`✅ Categoría creada: ${created.icon} ${created.name}`);
  }

  // Crear un usuario propietario de prueba
  const owner = await prisma.appUser.upsert({
    where: { email: "propietario@test.com" },
    update: {},
    create: {
      email: "propietario@test.com",
      name: "Juan Propietario",
      phone: "+5491234567890",
      role: "PROPIETARIO",
    },
  });

  console.log("✅ Usuario propietario creado:", owner.name);

  // Crear un negocio de prueba
  const business = await prisma.business.upsert({
    where: { slug: "panaderia-el-hornero" },
    update: {},
    create: {
      name: "Panadería El Hornero",
      slug: "panaderia-el-hornero",
      description: "Panadería artesanal con productos frescos todos los días",
      rubro: "Alimentación",
      whatsappPhone: "+5491234567890",
      aliasPago: "panaderia.hornero",
      addressText: "Av. Principal 123, Ciudad",
      lat: -34.6037,
      lng: -58.3816,
      ownerId: owner.id,
    },
  });

  console.log("✅ Negocio creado:", business.name);

  // Obtener categorías para asignar a los productos
  const panaderiaCategory = await prisma.productCategory.findUnique({
    where: { name: "Panadería" },
  });
  const pasteleriaCategory = await prisma.productCategory.findUnique({
    where: { name: "Pastelería" },
  });

  // Crear productos de prueba
  const products = [
    {
      name: "Pan Francés",
      description:
        "Pan francés tradicional, crujiente por fuera y suave por dentro",
      price: 350,
      stock: 50,
      available: true,
      businessId: business.id,
      categoryId: panaderiaCategory?.id,
    },
    {
      name: "Medialunas de Manteca",
      description: "Medialunas dulces recién horneadas",
      price: 150,
      stock: 100,
      available: true,
      businessId: business.id,
      categoryId: panaderiaCategory?.id,
    },
    {
      name: "Facturas Surtidas",
      description: "Docena de facturas variadas",
      price: 1200,
      stock: 30,
      available: true,
      businessId: business.id,
      categoryId: panaderiaCategory?.id,
    },
    {
      name: "Pan Integral",
      description: "Pan integral con semillas",
      price: 450,
      stock: 25,
      available: true,
      businessId: business.id,
      categoryId: panaderiaCategory?.id,
    },
    {
      name: "Torta de Chocolate",
      description: "Torta de chocolate casera (porción)",
      price: 800,
      stock: 15,
      available: true,
      businessId: business.id,
      categoryId: pasteleriaCategory?.id,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log("✅ Producto creado:", created.name);
  }

  // Crear otro negocio de ejemplo
  const restaurant = await prisma.business.upsert({
    where: { slug: "restaurante-la-esquina" },
    update: {},
    create: {
      name: "Restaurante La Esquina",
      slug: "restaurante-la-esquina",
      description: "Comida casera y platos del día",
      rubro: "Gastronomía",
      whatsappPhone: "+5491234567891",
      aliasPago: "resto.esquina",
      addressText: "Calle Secundaria 456, Ciudad",
      lat: -34.6097,
      lng: -58.3756,
      ownerId: owner.id,
    },
  });

  console.log("✅ Restaurante creado:", restaurant.name);

  // Obtener más categorías
  const minutasCategory = await prisma.productCategory.findUnique({
    where: { name: "Minutas" },
  });
  const ensaladasCategory = await prisma.productCategory.findUnique({
    where: { name: "Ensaladas" },
  });
  const pizzasCategory = await prisma.productCategory.findUnique({
    where: { name: "Pizzas" },
  });

  const restaurantProducts = [
    {
      name: "Milanesa con Papas",
      description: "Milanesa de carne con papas fritas",
      price: 2500,
      stock: 20,
      available: true,
      businessId: restaurant.id,
      categoryId: minutasCategory?.id,
    },
    {
      name: "Ensalada César",
      description: "Ensalada césar con pollo grillado",
      price: 1800,
      stock: 15,
      available: true,
      businessId: restaurant.id,
      categoryId: ensaladasCategory?.id,
    },
    {
      name: "Pizza Napolitana",
      description: "Pizza napolitana para 2 personas",
      price: 3200,
      stock: 10,
      available: true,
      businessId: restaurant.id,
      categoryId: pizzasCategory?.id,
    },
  ];

  for (const product of restaurantProducts) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log("✅ Producto de restaurante creado:", created.name);
  }

  console.log("🎉 Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

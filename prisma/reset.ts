import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Iniciando limpieza de la base de datos...\n");

  try {
    // PASO 1: Eliminar todos los datos de las tablas (en orden correcto para respetar las relaciones)
    console.log("📋 Eliminando datos de tablas relacionadas...");

    // Eliminar eventos de órdenes
    const deletedOrderEvents = await prisma.orderEvent.deleteMany({});
    console.log(`   ✓ OrderEvents eliminados: ${deletedOrderEvents.count}`);

    // Eliminar items de órdenes
    const deletedOrderItems = await prisma.orderItem.deleteMany({});
    console.log(`   ✓ OrderItems eliminados: ${deletedOrderItems.count}`);

    // Eliminar órdenes
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`   ✓ Orders eliminadas: ${deletedOrders.count}`);

    // Eliminar productos
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`   ✓ Products eliminados: ${deletedProducts.count}`);

    // Eliminar negocios
    const deletedBusinesses = await prisma.business.deleteMany({});
    console.log(`   ✓ Businesses eliminados: ${deletedBusinesses.count}`);

    // Eliminar pagos
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`   ✓ Payments eliminados: ${deletedPayments.count}`);

    // Eliminar solicitudes de rol
    const deletedRoleRequests = await prisma.roleRequest.deleteMany({});
    console.log(`   ✓ RoleRequests eliminadas: ${deletedRoleRequests.count}`);

    // Eliminar imágenes subidas
    const deletedImages = await prisma.uploadedImage.deleteMany({});
    console.log(`   ✓ UploadedImages eliminadas: ${deletedImages.count}`);

    // Eliminar usuarios
    const deletedUsers = await prisma.appUser.deleteMany({});
    console.log(`   ✓ AppUsers eliminados: ${deletedUsers.count}`);

    // Eliminar categorías existentes (las recrearemos)
    const deletedCategories = await prisma.productCategory.deleteMany({});
    console.log(
      `   ✓ ProductCategories eliminadas: ${deletedCategories.count}`
    );

    console.log("\n✅ Todos los datos eliminados correctamente\n");

    // PASO 2: Recrear datos genéricos del sistema
    console.log("🌱 Creando datos genéricos del sistema...\n");

    // Crear categorías de productos
    console.log("📦 Creando categorías de productos...");
    const categories = await prisma.productCategory.createMany({
      data: [
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
          icon: "�",
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
          icon: "�",
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
          icon: "�",
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
      ],
    });
    console.log(`   ✓ ${categories.count} categorías creadas\n`);

    // Crear o actualizar configuración de pagos
    console.log("💳 Creando configuración de pagos...");
    const paymentConfig = await prisma.paymentConfig.upsert({
      where: { id: "payment_config" },
      update: {},
      create: {
        id: "payment_config",
        monthlyFee: 5000,
        bankName: "Banco Ejemplo",
        bankAlias: "BARRIOMARKET.PAGOS",
        bankCbu: "0000000000000000000000",
        accountHolder: "BarrioMarket S.A.",
        accountType: "Cuenta Corriente",
        supportEmail: "pagos@barriomarket.com",
        supportPhone: "5491123456789",
      },
    });
    console.log(`   ✓ Configuración de pagos creada\n`);

    console.log("✅ Base de datos inicializada correctamente!\n");
    console.log("📊 Resumen:");
    console.log(`   - ${categories.count} categorías de productos`);
    console.log(`   - 1 configuración de pagos`);
    console.log(`   - 0 usuarios (base limpia)`);
    console.log(`   - 0 negocios (base limpia)`);
    console.log(`   - 0 productos (base limpia)`);
    console.log(`   - 0 órdenes (base limpia)\n`);

    console.log("🎉 ¡Listo! La base de datos está limpia y lista para usar.");
  } catch (error) {
    console.error("\n❌ Error durante la limpieza:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

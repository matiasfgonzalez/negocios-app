import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

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

  // Crear productos de prueba
  const products = [
    {
      name: "Pan Francés",
      description:
        "Pan francés tradicional, crujiente por fuera y suave por dentro",
      price: 350.0,
      stock: 50,
      available: true,
      businessId: business.id,
    },
    {
      name: "Medialunas de Manteca",
      description: "Medialunas dulces recién horneadas",
      price: 150.0,
      stock: 100,
      available: true,
      businessId: business.id,
    },
    {
      name: "Facturas Surtidas",
      description: "Docena de facturas variadas",
      price: 1200.0,
      stock: 30,
      available: true,
      businessId: business.id,
    },
    {
      name: "Pan Integral",
      description: "Pan integral con semillas",
      price: 450.0,
      stock: 25,
      available: true,
      businessId: business.id,
    },
    {
      name: "Torta de Chocolate",
      description: "Torta de chocolate casera (porción)",
      price: 800.0,
      stock: 15,
      available: true,
      businessId: business.id,
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

  const restaurantProducts = [
    {
      name: "Milanesa con Papas",
      description: "Milanesa de carne con papas fritas",
      price: 2500.0,
      stock: 20,
      available: true,
      businessId: restaurant.id,
    },
    {
      name: "Ensalada César",
      description: "Ensalada césar con pollo grillado",
      price: 1800.0,
      stock: 15,
      available: true,
      businessId: restaurant.id,
    },
    {
      name: "Pizza Napolitana",
      description: "Pizza napolitana para 2 personas",
      price: 3200.0,
      stock: 10,
      available: true,
      businessId: restaurant.id,
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

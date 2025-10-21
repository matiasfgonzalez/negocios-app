import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de producción...");

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

  console.log("📂 Creando categorías...");
  for (const category of categories) {
    const created = await prisma.productCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
    console.log(`✅ ${created.icon} ${created.name}`);
  }

  console.log("🎉 Seed de producción completado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

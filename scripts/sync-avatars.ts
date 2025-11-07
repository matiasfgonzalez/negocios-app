/**
 * Script para sincronizar avatares de usuarios desde Clerk
 *
 * Este script actualiza la columna `avatar` de todos los usuarios
 * con la imagen de perfil que tienen en Clerk.
 *
 * Ejecutar con: npx tsx scripts/sync-avatars.ts
 */

import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../lib/prisma";

async function syncAvatars() {
  console.log("🔄 Iniciando sincronización de avatares desde Clerk...\n");

  try {
    // Obtener todos los usuarios de la base de datos
    const appUsers = await prisma.appUser.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    console.log(
      `📊 Total de usuarios en la base de datos: ${appUsers.length}\n`
    );

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (const appUser of appUsers) {
      if (!appUser.clerkId) {
        console.log(
          `⚠️  Usuario ${
            appUser.email || appUser.id
          } no tiene clerkId, saltando...`
        );
        skipCount++;
        continue;
      }

      try {
        // Obtener el usuario de Clerk
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(appUser.clerkId);

        if (!clerkUser) {
          console.log(
            `⚠️  Usuario ${appUser.clerkId} no encontrado en Clerk, saltando...`
          );
          skipCount++;
          continue;
        }

        const clerkAvatar = clerkUser.imageUrl;

        // Actualizar avatar según el estado
        const hasClerkAvatar = Boolean(clerkAvatar);
        const isSameAvatar = clerkAvatar === appUser.avatar;

        if (hasClerkAvatar && isSameAvatar) {
          console.log(
            `✓  Avatar ya está sincronizado para ${appUser.email || appUser.id}`
          );
          skipCount++;
        } else if (hasClerkAvatar) {
          await prisma.appUser.update({
            where: { id: appUser.id },
            data: { avatar: clerkAvatar },
          });

          console.log(
            `✅ Avatar actualizado para ${
              appUser.email || appUser.name || appUser.id
            }`
          );
          console.log(`   Nuevo avatar: ${clerkAvatar.substring(0, 60)}...\n`);
          successCount++;
        } else {
          console.log(
            `⚠️  Usuario ${
              appUser.email || appUser.id
            } no tiene imagen en Clerk`
          );
          skipCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error al sincronizar ${appUser.email || appUser.id}:`,
          error
        );
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Resumen de sincronización:");
    console.log("=".repeat(60));
    console.log(`✅ Actualizados exitosamente: ${successCount}`);
    console.log(`⚠️  Saltados (sin cambios/sin clerkId): ${skipCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error fatal durante la sincronización:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
try {
  await syncAvatars();
  console.log("\n✨ Sincronización completada");
  process.exit(0);
} catch (error) {
  console.error("\n💥 Error fatal:", error);
  process.exit(1);
}

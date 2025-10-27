import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SSOCallback() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Create/update user in our database
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/me`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to sync user with database");
    }
  } catch (error) {
    console.error("Error syncing user:", error);
  }

  // Obtener usuario de la base de datos para verificar rol
  const appUser = await prisma.appUser.findUnique({
    where: { clerkId: user.id },
  });

  if (!appUser) {
    return redirect("/");
  }

  // Redirect based on role from database
  switch (appUser.role) {
    case "ADMINISTRADOR":
      return redirect("/dashboard");
    case "PROPIETARIO":
      return redirect("/dashboard");
    case "CLIENTE":
      return redirect("/dashboard");
    default:
      return redirect("/");
  }
}

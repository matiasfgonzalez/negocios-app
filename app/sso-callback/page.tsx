import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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

  // Redirect based on role
  const role = user.publicMetadata.role as string;

  switch (role) {
    case "admin":
      return redirect("/admin");
    case "propietario":
      return redirect("/propietario");
    case "cliente":
      return redirect("/cliente");
    default:
      return redirect("/");
  }
}

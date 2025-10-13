"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Shield } from "lucide-react";

export default function CustomUserMenu() {
  const router = useRouter();
  const { signOut, user } = useClerk();

  const handleSignOut = () => {
    signOut(() => router.push("/"));
  };

  const getUserInitials = () => {
    const firstName = user?.firstName || "";
    const lastName = user?.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserRole = () => {
    return (user?.publicMetadata?.role as string) || "usuario";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="cursor-pointer relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.imageUrl}
              alt={user?.firstName || "Usuario"}
            />
            <AvatarFallback className="bg-primary-500 text-white text-xs font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl"
        align="end"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
            <p className="text-xs leading-none text-primary-600 dark:text-primary-400 capitalize">
              {getUserRole()}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem
          className="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
          onClick={() => router.push("/dashboard")}
        >
          <Shield className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
          onClick={() => router.push("/profile")}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400"
          onClick={() => router.push("/settings")}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

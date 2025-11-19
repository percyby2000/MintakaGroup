"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User, Menu } from "lucide-react"
import { logout } from "@/app/actions/auth"
import type { Usuario } from "@/lib/database.types"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  usuario: Usuario
  onLogout: () => void
}

export function Header({ usuario, onLogout }: HeaderProps) {
  const roleColors = {
    admin: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-100",
    worker: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-100",
    customer: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-100",
  } as Record<string, string>

  const roleLabels = {
    admin: "Administrador",
    worker: "Técnico",
    customer: "Cliente",
  } as Record<string, string>

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  return (
    <header className="border-b border-orange-200 dark:border-orange-800 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-backdrop-blur:bg-white/95 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <a href="/" className="inline-flex items-center">
              <img src="/logo.png" alt="MINTAKA logo" className="h-10 sm:h-10 w-auto" />
            </a>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {usuario.full_name}
                </span>
              </div>
              <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${roleColors[usuario.rol]}`}>
                {roleLabels[usuario.rol]}
              </span>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-orange-800 dark:hover:bg-orange-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>

          {/* Mobile View - Dropdown Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
                >
                  <Menu className="h-5 w-5 text-orange-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-orange-600" />
                      <p className="text-sm font-medium leading-none">{usuario.full_name}</p>
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {usuario.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <span className={`text-xs px-2 py-1 rounded-full ${roleColors[usuario.rol]}`}>
                    {roleLabels[usuario.rol]}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

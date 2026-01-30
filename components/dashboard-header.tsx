"use client";

import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
        >
          <Menu className="w-5 h-5 text-neutral-600" />
        </button>
        <h1 className="text-lg font-semibold text-[#1A1A2E] tracking-tight">
          Graphite
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-neutral-900">{user.name}</p>
            <p className="text-xs text-neutral-500">{user.firm}</p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="text-neutral-600 border-neutral-200 bg-transparent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </Button>
      </div>
    </header>
  );
}

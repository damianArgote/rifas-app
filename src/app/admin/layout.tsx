import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/shared/LinkButton";
import { logout } from "@/lib/actions/auth";
import { LogOut, Settings, Plus, LayoutDashboard } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <a href="/admin" className="font-bold text-lg tracking-tight">
              🎯 Admin
            </a>
            <nav className="hidden md:flex items-center gap-1">
              <LinkButton
                href="/admin"
                variant="ghost"
                size="sm"
                className="inline-flex items-center"
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Dashboard
              </LinkButton>
              <LinkButton
                href="/admin/rifas/nueva"
                variant="ghost"
                size="sm"
                className="inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva Rifa
              </LinkButton>
              <LinkButton
                href="/admin/configuracion"
                variant="ghost"
                size="sm"
                className="inline-flex items-center"
              >
                <Settings className="h-4 w-4 mr-1" />
                Configuración
              </LinkButton>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Admin
            </span>
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-1" />
                Salir
              </Button>
            </form>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          <LinkButton
            href="/admin"
            variant="ghost"
            size="sm"
            className="inline-flex items-center"
          >
            <LayoutDashboard className="h-4 w-4 mr-1" />
            Dashboard
          </LinkButton>
          <LinkButton
            href="/admin/rifas/nueva"
            variant="ghost"
            size="sm"
            className="inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nueva Rifa
          </LinkButton>
          <LinkButton
            href="/admin/configuracion"
            variant="ghost"
            size="sm"
            className="inline-flex items-center"
          >
            <Settings className="h-4 w-4 mr-1" />
            Configuración
          </LinkButton>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

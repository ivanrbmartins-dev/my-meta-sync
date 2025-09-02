import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Target, 
  Calendar, 
  BarChart3, 
  Settings,
  Plus,
  Filter,
  FolderOpen
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, current: true },
  { name: "Metas", href: "/goals", icon: Target, current: false, count: 12 },
  { name: "Calendário", href: "/calendar", icon: Calendar, current: false },
  { name: "Relatórios", href: "/analytics", icon: BarChart3, current: false },
];

const categories = [
  { name: "Profissional", color: "bg-primary", count: 5 },
  { name: "Pessoal", color: "bg-success", count: 3 },
  { name: "Saúde", color: "bg-warning", count: 2 },
  { name: "Financeiro", color: "bg-destructive", count: 2 },
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        {/* Quick Actions */}
        <div className="px-3 py-2">
          <Button className="w-full justify-start bg-gradient-primary hover:opacity-90" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova Meta
          </Button>
        </div>

        {/* Navigation */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navegação
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
                asChild
              >
                <Link to={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                  {item.count && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.count}
                    </Badge>
                  )}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2 px-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Categorias
            </h2>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Filter className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <div className={cn("mr-2 h-3 w-3 rounded-full", category.color)} />
                {category.name}
                <Badge variant="secondary" className="ml-auto text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-3 py-2">
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="font-medium mb-2">Esta Semana</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Concluídas</span>
                <span className="font-medium text-success">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Em andamento</span>
                <span className="font-medium text-primary">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Próximos prazos</span>
                <span className="font-medium text-warning">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGoals } from "@/hooks/use-goals";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3,
  Calendar,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download
} from "lucide-react";
import { format, startOfDay, endOfDay, isToday, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const Reports = () => {
  const { goals, loading } = useGoals();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Filtrar metas baseado no termo de busca
  const filteredGoals = useMemo(() => {
    if (!searchTerm.trim()) return goals;
    
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    return goals.filter(goal => 
      goal.title.toLowerCase().includes(lowercaseSearchTerm) ||
      goal.description?.toLowerCase().includes(lowercaseSearchTerm) ||
      goal.category?.toLowerCase().includes(lowercaseSearchTerm)
    );
  }, [goals, searchTerm]);

  const todayStats = useMemo(() => {
    if (!filteredGoals.length) return {
      totalGoals: 0,
      completedToday: 0,
      inProgress: 0,
      overdue: 0,
      completionRate: 0,
      upcomingDeadlines: 0
    };

    const today = new Date();
    const completedToday = filteredGoals.filter(g => g.status === 'completed').length;
    const inProgress = filteredGoals.filter(g => g.status === 'in_progress').length;
    const overdue = filteredGoals.filter(g => {
      const dueDate = new Date(g.dueDate);
      return dueDate < today && g.status !== 'completed';
    }).length;
    
    const upcomingDeadlines = filteredGoals.filter(g => {
      const dueDate = new Date(g.dueDate);
      const daysUntilDue = differenceInDays(dueDate, today);
      return daysUntilDue <= 7 && daysUntilDue >= 0 && g.status !== 'completed';
    }).length;

    const completionRate = filteredGoals.length > 0 ? Math.round((completedToday / filteredGoals.length) * 100) : 0;

    return {
      totalGoals: filteredGoals.length,
      completedToday,
      inProgress,
      overdue,
      completionRate,
      upcomingDeadlines
    };
  }, [filteredGoals]);

  const categoryStats = useMemo(() => {
    if (!filteredGoals.length) return [];

    const categoryMap = new Map();
    
    filteredGoals.forEach(goal => {
      const category = goal.category || 'Sem categoria';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          name: category,
          total: 0,
          completed: 0,
          inProgress: 0,
          avgProgress: 0
        });
      }
      
      const catData = categoryMap.get(category);
      catData.total++;
      catData.avgProgress += goal.progress;
      
      if (goal.status === 'completed') catData.completed++;
      if (goal.status === 'in_progress') catData.inProgress++;
    });

    return Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      avgProgress: Math.round(cat.avgProgress / cat.total),
      completionRate: Math.round((cat.completed / cat.total) * 100)
    }));
  }, [filteredGoals]);

  const priorityStats = useMemo(() => {
    if (!filteredGoals.length) return { high: 0, medium: 0, low: 0 };

    return {
      high: filteredGoals.filter(g => g.priority === 'high').length,
      medium: filteredGoals.filter(g => g.priority === 'medium').length,
      low: filteredGoals.filter(g => g.priority === 'low').length,
    };
  }, [filteredGoals]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <div className="flex">
          <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] border-r bg-muted/20">
            <Sidebar />
          </aside>
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Faça login para ver seus relatórios
                </h2>
                <p className="text-muted-foreground">
                  Entre na sua conta para acessar relatórios detalhados das suas metas.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <div className="flex">
        <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] border-r bg-muted/20">
          <Sidebar />
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {searchTerm ? `Relatórios - "${searchTerm}"` : "Relatórios"}
                </h1>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? `${filteredGoals.length} ${filteredGoals.length === 1 ? 'meta encontrada' : 'metas encontradas'} - ${format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                    : `Acompanhe seu progresso e desempenho - ${format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSearchTerm("")}
                  >
                    Limpar filtro
                  </Button>
                )}
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Relatório
                </Button>
              </div>
            </div>

            {/* Daily Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Metas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{loading ? "-" : todayStats.totalGoals}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-2xl font-bold text-success">{loading ? "-" : todayStats.completedToday}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {loading ? "Carregando..." : `${todayStats.completionRate}% taxa de conclusão`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{loading ? "-" : todayStats.inProgress}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Próximos Prazos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-warning" />
                    <span className="text-2xl font-bold text-warning">{loading ? "-" : todayStats.upcomingDeadlines}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Próximos 7 dias</p>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {todayStats.overdue > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span className="font-medium text-destructive">
                      Atenção: {todayStats.overdue} meta(s) em atraso
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progress by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Progresso por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                          <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="h-2 bg-muted rounded animate-pulse" />
                      </div>
                    ))
                  ) : categoryStats.length > 0 ? (
                    categoryStats.map((category) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{category.name}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {category.completed}/{category.total}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {category.avgProgress}%
                            </span>
                          </div>
                        </div>
                        <Progress value={category.avgProgress} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma categoria encontrada
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Distribuição por Prioridade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                        <div className="h-6 w-8 bg-muted rounded animate-pulse" />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 rounded-full bg-destructive" />
                          <span>Alta Prioridade</span>
                        </div>
                        <Badge variant="destructive">{priorityStats.high}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 rounded-full bg-warning" />
                          <span>Média Prioridade</span>
                        </div>
                        <Badge variant="secondary">{priorityStats.medium}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 rounded-full bg-success" />
                          <span>Baixa Prioridade</span>
                        </div>
                        <Badge variant="outline">{priorityStats.low}</Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredGoals.length > 0 ? (
                  <div className="space-y-4">
                    {filteredGoals.slice(0, 5).map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/20">
                        <div className={`h-3 w-3 rounded-full ${
                          goal.status === 'completed' ? 'bg-success' :
                          goal.status === 'in_progress' ? 'bg-primary' :
                          goal.status === 'overdue' ? 'bg-destructive' :
                          'bg-muted-foreground'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium">{goal.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {goal.category || 'Sem categoria'} • {goal.progress}% concluído
                          </p>
                        </div>
                        <Badge variant={
                          goal.priority === 'high' ? 'destructive' :
                          goal.priority === 'medium' ? 'secondary' :
                          'outline'
                        }>
                          {goal.priority === 'high' ? 'Alta' :
                           goal.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? `Nenhuma atividade encontrada para "${searchTerm}"` : "Nenhuma atividade encontrada"}
                    </p>
                    {searchTerm && (
                      <Button 
                        className="mt-4" 
                        variant="outline" 
                        onClick={() => setSearchTerm("")}
                      >
                        Limpar busca
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { GoalCard } from "@/components/ui/goal-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGoals } from "@/hooks/use-goals";
import { CalendarIntegrationModal } from "@/components/calendar-integration-modal";
import { GoalCreationModal } from "@/components/goal-creation-modal";
import { AuthModal } from "@/components/auth-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Target, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Calendar,
  Plus,
  ArrowRight,
  LogIn,
  LogOut
} from "lucide-react";
import heroImage from "@/assets/hero-dashboard.png";

const Index = () => {
  const { toast } = useToast();
  const { goals, loading } = useGoals();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const total = goals.length;
    const inProgress = goals.filter(g => g.status === 'in_progress').length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const overdue = goals.filter(g => g.status === 'overdue').length;
    const avgProgress = total > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / total) : 0;
    
    return { total, inProgress, completed, overdue, avgProgress };
  }, [goals]);

  const priorityGoals = useMemo(() => {
    return goals
      .filter(g => g.status !== 'completed')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 4);
  }, [goals]);

  const handleConnectCalendar = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCalendarModalOpen(true);
  };

  const handleCreateGoal = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    console.log("Opening Goal Creation Modal");
    setIsGoalModalOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] border-r bg-muted/20">
          <Sidebar />
        </aside>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-hero px-6 py-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
                <div className="flex flex-col justify-center">
                  <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                    Transforme suas{" "}
                    <span className="text-primary-glow">metas</span>{" "}
                    em realidade
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-white/90">
                    Organize, acompanhe e conquiste seus objetivos com o MetaFlow. 
                    Sincronização automática com Google Agenda para você nunca mais perder um prazo.
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                    <Button 
                      className="bg-white text-primary hover:bg-white/90" 
                      size="lg"
                      onClick={handleCreateGoal}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Criar Primeira Meta
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-white/20 text-white hover:bg-white/10" 
                      size="lg"
                      onClick={handleConnectCalendar}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Conectar Agenda
                    </Button>
                    {!user && (
                      <Button 
                        variant="outline" 
                        className="border-white/20 text-white hover:bg-white/10" 
                        size="lg"
                        onClick={() => setIsAuthModalOpen(true)}
                      >
                        <LogIn className="mr-2 h-5 w-5" />
                        Entrar
                      </Button>
                    )}
                    {user && (
                      <Button 
                        variant="outline" 
                        className="border-white/20 text-white hover:bg-white/10" 
                        size="lg"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Sair
                      </Button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={heroImage}
                    alt="MetaFlow Dashboard"
                    className="rounded-xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="px-6 py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total de Metas"
                  value={loading ? "-" : stats.total}
                  description={loading ? "Carregando..." : `${stats.inProgress} em andamento`}
                  icon={Target}
                  variant="default"
                />
                <StatCard
                  title="Em Andamento"
                  value={loading ? "-" : stats.inProgress}
                  description={loading ? "Carregando..." : `${stats.avgProgress}% progresso médio`}
                  icon={TrendingUp}
                  variant="default"
                />
                <StatCard
                  title="Concluídas"
                  value={loading ? "-" : stats.completed}
                  description={loading ? "Carregando..." : `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% taxa de sucesso`}
                  icon={TrendingUp}
                  variant="success"
                />
                <StatCard
                  title="Atrasadas"
                  value={loading ? "-" : stats.overdue}
                  description={loading ? "Carregando..." : stats.overdue > 0 ? "Requer atenção" : "Tudo em dia"}
                  icon={AlertTriangle}
                  variant={stats.overdue > 0 ? "warning" : "success"}
                />
              </div>
            </div>
          </section>

          {/* Goals Section */}
          <section className="px-6 py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Goals List */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      Suas Metas Prioritárias
                    </h2>
                    <Button variant="outline">
                      Ver Todas
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-48 bg-muted/20 rounded-lg animate-pulse" />
                      ))
                    ) : priorityGoals.length > 0 ? (
                      priorityGoals.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} />
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12">
                        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {user ? "Nenhuma meta encontrada" : "Entre para ver suas metas"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {user 
                            ? "Crie sua primeira meta para começar a acompanhar seu progresso."
                            : "Faça login ou crie uma conta para gerenciar suas metas."
                          }
                        </p>
                        <Button onClick={user ? handleCreateGoal : () => setIsAuthModalOpen(true)}>
                          {user ? (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Criar Primeira Meta
                            </>
                          ) : (
                            <>
                              <LogIn className="mr-2 h-4 w-4" />
                              Entrar
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                        Progresso Semanal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Meta Semanal</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <Progress value={78} className="h-3" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Produtividade</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-3 [&>div]:bg-success" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Pontualidade</span>
                          <span className="font-medium">92%</span>
                        </div>
                        <Progress value={92} className="h-3 [&>div]:bg-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-warning" />
                        Próximos Prazos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <div>
                          <p className="font-medium text-sm">Curso React</p>
                          <p className="text-xs text-muted-foreground">Em 7 dias</p>
                        </div>
                        <div className="h-3 w-3 rounded-full bg-warning" />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div>
                          <p className="font-medium text-sm">Lançar App</p>
                          <p className="text-xs text-muted-foreground">Em 14 dias</p>
                        </div>
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      
      <AuthModal 
        open={isAuthModalOpen} 
        onOpenChange={setIsAuthModalOpen} 
      />
      
      <CalendarIntegrationModal 
        open={isCalendarModalOpen} 
        onOpenChange={setIsCalendarModalOpen} 
      />
      
      <GoalCreationModal 
        open={isGoalModalOpen} 
        onOpenChange={setIsGoalModalOpen} 
      />
      {/* Debug: Modal state = {isGoalModalOpen.toString()} */}
    </div>
  );
};

export default Index;
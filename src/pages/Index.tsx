import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { GoalCard } from "@/components/ui/goal-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CalendarIntegrationModal } from "@/components/calendar-integration-modal";
import { GoalCreationModal } from "@/components/goal-creation-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Calendar,
  Plus,
  ArrowRight
} from "lucide-react";
import heroImage from "@/assets/hero-dashboard.png";

// Mock data for demonstration
const mockGoals = [
  {
    id: "1",
    title: "Concluir Curso de React Advanced",
    description: "Finalizar todas as aulas e projetos práticos do curso avançado de React",
    status: "in_progress" as const,
    priority: "high" as const,
    progress: 75,
    dueDate: "2024-09-15",
    category: "Educacional"
  },
  {
    id: "2", 
    title: "Lançar App MetaFlow",
    description: "Desenvolver e publicar a primeira versão da aplicação de gestão de metas",
    status: "in_progress" as const,
    priority: "high" as const,
    progress: 60,
    dueDate: "2024-10-01",
    category: "Profissional"
  },
  {
    id: "3",
    title: "Emagrecer 5kg",
    description: "Perder peso através de exercícios regulares e alimentação balanceada",
    status: "in_progress" as const,
    priority: "medium" as const,
    progress: 40,
    dueDate: "2024-11-30",
    category: "Saúde"
  },
  {
    id: "4",
    title: "Economizar R$ 10.000",
    description: "Guardar dinheiro para fundo de emergência",
    status: "completed" as const,
    priority: "high" as const,
    progress: 100,
    dueDate: "2024-08-31",
    category: "Financeiro"
  }
];

const Index = () => {
  const { toast } = useToast();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const handleConnectCalendar = () => {
    setIsCalendarModalOpen(true);
  };

  const handleCreateGoal = () => {
    console.log("Opening Goal Creation Modal");
    setIsGoalModalOpen(true);
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
                  value={12}
                  description="+2 esta semana"
                  icon={Target}
                  variant="default"
                />
                <StatCard
                  title="Em Andamento"
                  value={5}
                  description="67% de progresso médio"
                  icon={TrendingUp}
                  variant="default"
                />
                <StatCard
                  title="Concluídas"
                  value={7}
                  description="58% taxa de sucesso"
                  icon={TrendingUp}
                  variant="success"
                />
                <StatCard
                  title="Próximos Prazos"
                  value={3}
                  description="Nos próximos 7 dias"
                  icon={AlertTriangle}
                  variant="warning"
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
                    {mockGoals.slice(0, 4).map((goal) => (
                      <GoalCard key={goal.id} goal={goal} />
                    ))}
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
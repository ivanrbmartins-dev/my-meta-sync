import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Calendar, Clock, AlertTriangle, CheckCircle, Edit, Trash2 } from "lucide-react";
import type { Goal, GoalStatus, GoalPriority } from "@/hooks/use-goals";

export type { GoalStatus, GoalPriority };

interface GoalCardProps {
  goal: Goal;
  className?: string;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
}

const statusConfig = {
  planned: { label: "Planejada", variant: "secondary" as const, icon: Clock, className: "" },
  in_progress: { label: "Em Andamento", variant: "default" as const, icon: Clock, className: "" },
  completed: { label: "Concluída", variant: "outline" as const, icon: CheckCircle, className: "border-success text-success" },
  overdue: { label: "Atrasada", variant: "destructive" as const, icon: AlertTriangle, className: "" },
  paused: { label: "Pausada", variant: "outline" as const, icon: Clock, className: "border-warning text-warning" },
};

const priorityConfig = {
  high: { label: "Alta", variant: "destructive" as const, className: "" },
  medium: { label: "Média", variant: "outline" as const, className: "border-warning text-warning" },
  low: { label: "Baixa", variant: "outline" as const, className: "border-success text-success" },
};

export function GoalCard({ goal, className, onEdit, onDelete }: GoalCardProps) {
  const statusInfo = statusConfig[goal.status];
  const priorityInfo = priorityConfig[goal.priority];
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-card hover:-translate-y-1 cursor-pointer",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-foreground line-clamp-2">{goal.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
          </div>
          <StatusIcon className={cn(
            "h-5 w-5 ml-2 flex-shrink-0",
            goal.status === "completed" && "text-success",
            goal.status === "overdue" && "text-destructive",
            goal.status === "in_progress" && "text-primary",
            goal.status === "planned" && "text-muted-foreground",
            goal.status === "paused" && "text-warning"
          )} />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={statusInfo.variant} 
            className={cn("text-xs", statusInfo.className)}
          >
            {statusInfo.label}
          </Badge>
          <Badge 
            variant={priorityInfo.variant} 
            className={cn("text-xs", priorityInfo.className)}
          >
            Prioridade {priorityInfo.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {goal.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{goal.progress}%</span>
            </div>
            <Progress 
              value={goal.progress} 
              className={cn(
                "h-2",
                goal.status === "completed" && "[&>div]:bg-success",
                goal.status === "overdue" && "[&>div]:bg-destructive",
                goal.status === "in_progress" && "[&>div]:bg-primary"
              )} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Prazo: {new Date(goal.dueDate).toLocaleDateString('pt-BR')}</span>
            </div>
            
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(goal);
                  }}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente a meta "{goal.title}" e todos os seus dados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(goal.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sim, deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
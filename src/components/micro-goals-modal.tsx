import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMicroGoals } from "@/hooks/use-micro-goals";
import { CheckCircle, Circle, Plus, Target, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicroGoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalTitle: string;
}

export function MicroGoalsModal({ open, onOpenChange, goalId, goalTitle }: MicroGoalsModalProps) {
  const { microGoals, loading, createMicroGoal, toggleMicroGoal, deleteMicroGoal } = useMicroGoals(goalId);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    setIsCreating(true);
    const success = await createMicroGoal(goalId, {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
    });

    if (success) {
      setFormData({ title: "", description: "" });
    }
    setIsCreating(false);
  };

  const completedCount = microGoals.filter(mg => mg.is_completed).length;
  const totalCount = microGoals.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Micro Metas - {goalTitle}
          </DialogTitle>
          <DialogDescription>
            Gerencie as pequenas tarefas que compõem esta meta. Cada micro meta concluída atualiza automaticamente o progresso geral.
          </DialogDescription>
          
          {totalCount > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {completedCount}/{totalCount} concluídas ({progressPercentage}%)
              </Badge>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Criar nova micro meta */}
          <Card>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="micro-title">Nova Micro Meta</Label>
                  <Input
                    id="micro-title"
                    placeholder="Ex: Completar módulo 1, Fazer exercícios..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    maxLength={100}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="micro-description">Descrição (opcional)</Label>
                  <Textarea
                    id="micro-description"
                    placeholder="Detalhes sobre esta micro meta..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    maxLength={200}
                    rows={2}
                  />
                </div>
                
                <Button type="submit" disabled={isCreating || !formData.title.trim()} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? "Criando..." : "Adicionar"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de micro metas */}
          <div className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : microGoals.length > 0 ? (
              microGoals.map((microGoal) => (
                <Card key={microGoal.id} className={cn(
                  "transition-all duration-200",
                  microGoal.is_completed && "bg-success/5 border-success/20"
                )}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMicroGoal(microGoal.id, goalId)}
                        className={cn(
                          "h-8 w-8 p-0 rounded-full",
                          microGoal.is_completed 
                            ? "text-success hover:bg-success/10" 
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {microGoal.is_completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-medium text-sm",
                          microGoal.is_completed && "line-through text-muted-foreground"
                        )}>
                          {microGoal.title}
                        </h4>
                        {microGoal.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {microGoal.description}
                          </p>
                        )}
                        {microGoal.completed_at && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-success" />
                            <span className="text-xs text-success">
                              Concluída em {new Date(microGoal.completed_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deletar micro meta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A micro meta "{microGoal.title}" será removida permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMicroGoal(microGoal.id, goalId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma micro meta criada ainda.</p>
                <p className="text-sm">Adicione tarefas pequenas para facilitar o progresso!</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
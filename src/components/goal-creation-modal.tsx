import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useGoals } from "@/hooks/use-goals";
import { Calendar, Target } from "lucide-react";

interface GoalCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalCreationModal({ open, onOpenChange }: GoalCreationModalProps) {
  const { toast } = useToast();
  const { createGoal } = useGoals();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    startDate: "",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.dueDate || !formData.priority) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título, prazo final e prioridade.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const success = await createGoal({
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category || undefined,
      priority: formData.priority as any,
      startDate: formData.startDate || undefined,
      dueDate: formData.dueDate,
    });

    if (success) {
      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "",
        startDate: "",
        dueDate: "",
      });
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Criar Nova Meta
          </DialogTitle>
          <DialogDescription>
            Defina uma nova meta para acompanhar seu progresso e alcançar seus objetivos.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Meta *</Label>
            <Input
              id="title"
              placeholder="Ex: Concluir curso de React"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva sua meta em detalhes..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="educational">Educacional</SelectItem>
                  <SelectItem value="health">Saúde</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="personal">Pessoal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade *</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Prazo Final *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Calendar className="mr-2 h-4 w-4" />
              {isSubmitting ? "Criando..." : "Criar Meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
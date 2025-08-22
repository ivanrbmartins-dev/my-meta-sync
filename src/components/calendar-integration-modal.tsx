import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Shield, CheckCircle } from "lucide-react";

interface CalendarIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarIntegrationModal({ open, onOpenChange }: CalendarIntegrationModalProps) {
  const [email, setEmail] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email do Google para conectar.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simular processo de conexão
    setTimeout(() => {
      setIsConnecting(false);
      onOpenChange(false);
      toast({
        title: "Integração realizada com sucesso!",
        description: `Sua agenda do Google (${email}) foi conectada ao MetaFlow.`,
        duration: 5000,
      });
      setEmail("");
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Integração com Google Agenda
          </DialogTitle>
          <DialogDescription>
            Conecte sua conta do Google para sincronizar automaticamente suas metas com a agenda.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-success" />
              <div className="text-sm">
                <p className="font-medium">Conexão segura</p>
                <p className="text-muted-foreground">Seus dados são protegidos com OAuth 2.0</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email do Google</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isConnecting}
              />
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">O que será sincronizado:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Prazos de metas como eventos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Lembretes automáticos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Blocos de tempo para trabalho</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isConnecting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="min-w-[120px]"
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Conectando...
              </div>
            ) : (
              "Conectar Agenda"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Alerts() {
  const [, navigate] = useLocation();
  const [clinicId, setClinicId] = useState(1);

  // Fetch alerts
  const { data: alerts = [], isLoading, refetch } = trpc.alerts.listByClinic.useQuery({
    clinicId,
    unresolved: true,
  });

  // Mark as resolved mutation
  const markResolved = trpc.alerts.markAsResolved.useMutation({
    onSuccess: () => {
      toast.success("Alerta marcado como resolvido!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao resolver alerta: " + error.message);
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "vaccine":
        return "Vacina";
      case "return":
        return "Retorno";
      case "appointment":
        return "Agendamento";
      default:
        return type;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "vaccine":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "return":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "appointment":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <h1 className="text-2xl font-bold">Alertas</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando alertas...</p>
          </div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum alerta pendente</p>
              <p className="text-sm text-muted-foreground mt-2">Todos os alertas foram resolvidos</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {alerts.filter(a => isOverdue(a.dueDate)).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Próximos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {alerts.filter(a => !isOverdue(a.dueDate)).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`hover:shadow-lg transition-shadow ${
                    isOverdue(alert.dueDate) ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className={`h-5 w-5 ${isOverdue(alert.dueDate) ? "text-red-600" : "text-yellow-600"}`} />
                          <span className={`px-2 py-1 rounded text-xs font-semibold border ${getAlertTypeColor(alert.alertType)}`}>
                            {getAlertTypeLabel(alert.alertType)}
                          </span>
                          {isOverdue(alert.dueDate) && (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                              VENCIDO
                            </span>
                          )}
                        </div>
                        <CardTitle>{alert.title}</CardTitle>
                        <CardDescription>
                          Paciente ID: {alert.patientId} | Tutor ID: {alert.tutorId}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markResolved.mutate(alert.id)}
                        disabled={markResolved.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Resolver
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {alert.description && (
                      <p className="text-muted-foreground">{alert.description}</p>
                    )}
                    <div className="flex justify-between">
                      <span className="font-semibold">Data de Vencimento:</span>
                      <span className={isOverdue(alert.dueDate) ? "text-red-600 font-semibold" : ""}>
                        {formatDate(alert.dueDate)}
                      </span>
                    </div>
                    {alert.notificationSent && (
                      <div className="text-xs text-muted-foreground">
                        Notificação enviada em {alert.notificationSentAt ? formatDate(alert.notificationSentAt) : "N/A"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Appointments() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [clinicId, setClinicId] = useState(1);
  const [formData, setFormData] = useState({
    patientId: "",
    tutorId: "",
    veterinarianId: "",
    appointmentDate: "",
    appointmentTime: "",
    duration: "30",
    reason: "",
    notes: "",
  });

  // Fetch appointments
  const { data: appointments = [], isLoading, refetch } = trpc.appointments.listByClinic.useQuery({
    clinicId,
  });
  
  // Create appointment mutation
  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      setFormData({
        patientId: "",
        tutorId: "",
        veterinarianId: "",
        appointmentDate: "",
        appointmentTime: "",
        duration: "30",
        reason: "",
        notes: "",
      });
      setOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar agendamento: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.veterinarianId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);

    createAppointment.mutate({
      clinicId,
      patientId: parseInt(formData.patientId),
      tutorId: parseInt(formData.tutorId),
      veterinarianId: parseInt(formData.veterinarianId),
      appointmentDate: appointmentDateTime,
      duration: parseInt(formData.duration),
      reason: formData.reason || undefined,
      notes: formData.notes || undefined,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      case "no-show":
        return "Não Compareceu";
      default:
        return status;
    }
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
              <Calendar className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold">Agendamentos</h1>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Agendamento</DialogTitle>
                <DialogDescription>
                  Preencha os dados do agendamento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente *</Label>
                  <Input
                    id="patient"
                    placeholder="ID do paciente"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutor">Tutor *</Label>
                  <Input
                    id="tutor"
                    placeholder="ID do tutor"
                    value={formData.tutorId}
                    onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="veterinarian">Veterinário *</Label>
                  <Input
                    id="veterinarian"
                    placeholder="ID do veterinário"
                    value={formData.veterinarianId}
                    onChange={(e) => setFormData({ ...formData, veterinarianId: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo da Consulta</Label>
                  <Input
                    id="reason"
                    placeholder="Ex: Vacinação"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    placeholder="Notas adicionais"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createAppointment.isPending}>
                  {createAppointment.isPending ? "Criando..." : "Criar Agendamento"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando agendamentos...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        Paciente ID: {appointment.patientId}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(appointment.appointmentDate)}
                      </CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {appointment.reason && <p><span className="font-semibold">Motivo:</span> {appointment.reason}</p>}
                  <p><span className="font-semibold">Duração:</span> {appointment.duration} minutos</p>
                  {appointment.notes && <p><span className="font-semibold">Notas:</span> {appointment.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

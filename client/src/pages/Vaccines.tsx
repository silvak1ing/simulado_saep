import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pill, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Vaccines() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [clinicId, setClinicId] = useState(1);
  const [formData, setFormData] = useState({
    patientId: "",
    vaccineName: "",
    vaccinationDate: "",
    nextDueDate: "",
    veterinarianId: "",
    batchNumber: "",
    notes: "",
  });

  // Fetch vaccines
  const { data: vaccines = [], isLoading, refetch } = trpc.vaccines.listOverdue.useQuery(clinicId);
  
  // Create vaccine mutation
  const createVaccine = trpc.vaccines.create.useMutation({
    onSuccess: () => {
      toast.success("Vacina registrada com sucesso!");
      setFormData({
        patientId: "",
        vaccineName: "",
        vaccinationDate: "",
        nextDueDate: "",
        veterinarianId: "",
        batchNumber: "",
        notes: "",
      });
      setOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao registrar vacina: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.vaccineName || !formData.vaccinationDate || !formData.veterinarianId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createVaccine.mutate({
      clinicId,
      patientId: parseInt(formData.patientId),
      vaccineName: formData.vaccineName,
      vaccinationDate: new Date(formData.vaccinationDate),
      nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate) : undefined,
      veterinarianId: parseInt(formData.veterinarianId),
      batchNumber: formData.batchNumber || undefined,
      notes: formData.notes || undefined,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
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
              <Pill className="h-6 w-6 text-orange-600" />
              <h1 className="text-2xl font-bold">Vacinas</h1>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Vacina
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nova Vacina</DialogTitle>
                <DialogDescription>
                  Registre a vacinação de um paciente
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
                  <Label htmlFor="vaccineName">Nome da Vacina *</Label>
                  <Input
                    id="vaccineName"
                    placeholder="Ex: Raiva, V10, V8"
                    value={formData.vaccineName}
                    onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
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
                    <Label htmlFor="vaccinationDate">Data da Vacinação *</Label>
                    <Input
                      id="vaccinationDate"
                      type="date"
                      value={formData.vaccinationDate}
                      onChange={(e) => setFormData({ ...formData, vaccinationDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextDueDate">Próxima Dose</Label>
                    <Input
                      id="nextDueDate"
                      type="date"
                      value={formData.nextDueDate}
                      onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Número do Lote</Label>
                  <Input
                    id="batchNumber"
                    placeholder="Ex: ABC123456"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
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
                <Button type="submit" className="w-full" disabled={createVaccine.isPending}>
                  {createVaccine.isPending ? "Registrando..." : "Registrar Vacina"}
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
            <p className="text-muted-foreground">Carregando vacinas...</p>
          </div>
        ) : vaccines.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma vacina vencida encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Vacinas Vencidas</h3>
                <p className="text-sm text-yellow-800">
                  {vaccines.length} paciente(s) com vacinas vencidas ou próximas do vencimento
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {vaccines.map((vaccine) => (
                <Card 
                  key={vaccine.id} 
                  className={`hover:shadow-lg transition-shadow ${
                    isOverdue(vaccine.nextDueDate) ? "border-red-200 bg-red-50" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {isOverdue(vaccine.nextDueDate) && (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                          <Pill className="h-5 w-5 text-orange-600" />
                          {vaccine.vaccineName}
                        </CardTitle>
                        <CardDescription>
                          Paciente ID: {vaccine.patientId}
                        </CardDescription>
                      </div>
                      {isOverdue(vaccine.nextDueDate) && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          Vencida
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><span className="font-semibold">Data da Vacinação:</span> {formatDate(vaccine.vaccinationDate)}</p>
                    {vaccine.nextDueDate && (
                      <p><span className="font-semibold">Próxima Dose:</span> {formatDate(vaccine.nextDueDate)}</p>
                    )}
                    {vaccine.batchNumber && <p><span className="font-semibold">Lote:</span> {vaccine.batchNumber}</p>}
                    {vaccine.notes && <p><span className="font-semibold">Notas:</span> {vaccine.notes}</p>}
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

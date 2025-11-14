import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Plus, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MedicalRecords() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [clinicId, setClinicId] = useState(1);
  const [patientId, setPatientId] = useState("");
  const [formData, setFormData] = useState({
    patientId: "",
    veterinarianId: "",
    recordType: "",
    diagnosis: "",
    treatment: "",
    prescription: "",
    observations: "",
  });

  // Fetch medical records
  const { data: records = [], isLoading, refetch } = trpc.medicalRecords.listByPatient.useQuery(
    patientId ? parseInt(patientId) : 0,
    { enabled: !!patientId }
  );
  
  // Create medical record mutation
  const createRecord = trpc.medicalRecords.create.useMutation({
    onSuccess: () => {
      toast.success("Prontuário criado com sucesso!");
      setFormData({
        patientId: "",
        veterinarianId: "",
        recordType: "",
        diagnosis: "",
        treatment: "",
        prescription: "",
        observations: "",
      });
      setOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar prontuário: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId || !formData.veterinarianId || !formData.recordType) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createRecord.mutate({
      clinicId,
      patientId: parseInt(formData.patientId),
      veterinarianId: parseInt(formData.veterinarianId),
      recordType: formData.recordType as any,
      diagnosis: formData.diagnosis || undefined,
      treatment: formData.treatment || undefined,
      prescription: formData.prescription || undefined,
      observations: formData.observations || undefined,
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

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case "consultation":
        return "Consulta";
      case "procedure":
        return "Procedimento";
      case "exam":
        return "Exame";
      case "follow-up":
        return "Acompanhamento";
      default:
        return type;
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
              <FileText className="h-6 w-6 text-red-600" />
              <h1 className="text-2xl font-bold">Prontuários</h1>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Prontuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Prontuário</DialogTitle>
                <DialogDescription>
                  Registre informações de consulta ou procedimento
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
                  <Label htmlFor="veterinarian">Veterinário *</Label>
                  <Input
                    id="veterinarian"
                    placeholder="ID do veterinário"
                    value={formData.veterinarianId}
                    onChange={(e) => setFormData({ ...formData, veterinarianId: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recordType">Tipo de Registro *</Label>
                  <Select value={formData.recordType} onValueChange={(value) => setFormData({ ...formData, recordType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consulta</SelectItem>
                      <SelectItem value="procedure">Procedimento</SelectItem>
                      <SelectItem value="exam">Exame</SelectItem>
                      <SelectItem value="follow-up">Acompanhamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnóstico</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Descreva o diagnóstico"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="treatment">Tratamento</Label>
                  <Textarea
                    id="treatment"
                    placeholder="Descreva o tratamento realizado"
                    value={formData.treatment}
                    onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prescription">Prescrição</Label>
                  <Textarea
                    id="prescription"
                    placeholder="Prescrições e medicamentos"
                    value={formData.prescription}
                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    placeholder="Observações adicionais"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createRecord.isPending}>
                  {createRecord.isPending ? "Criando..." : "Criar Prontuário"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buscar Prontuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o ID do paciente"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
              <Button onClick={() => refetch()}>Buscar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        {!patientId ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Digite um ID de paciente para visualizar prontuários</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando prontuários...</p>
          </div>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum prontuário encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-600" />
                        {getRecordTypeLabel(record.recordType)}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(record.recordDate)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {record.diagnosis && (
                    <div>
                      <p className="font-semibold">Diagnóstico:</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{record.diagnosis}</p>
                    </div>
                  )}
                  {record.treatment && (
                    <div>
                      <p className="font-semibold">Tratamento:</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{record.treatment}</p>
                    </div>
                  )}
                  {record.prescription && (
                    <div>
                      <p className="font-semibold">Prescrição:</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{record.prescription}</p>
                    </div>
                  )}
                  {record.observations && (
                    <div>
                      <p className="font-semibold">Observações:</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{record.observations}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

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
import { ArrowLeft, Plus, PawPrint } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Patients() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [clinicId, setClinicId] = useState(1);
  const [formData, setFormData] = useState({
    tutorId: "",
    name: "",
    species: "",
    breed: "",
    color: "",
    weight: "",
    notes: "",
  });

  // Fetch patients
  const { data: patients = [], isLoading, refetch } = trpc.patients.listByClinic.useQuery(clinicId);
  
  // Create patient mutation
  const createPatient = trpc.patients.create.useMutation({
    onSuccess: () => {
      toast.success("Paciente criado com sucesso!");
      setFormData({
        tutorId: "",
        name: "",
        species: "",
        breed: "",
        color: "",
        weight: "",
        notes: "",
      });
      setOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar paciente: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.species || !formData.tutorId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createPatient.mutate({
      clinicId,
      tutorId: parseInt(formData.tutorId),
      name: formData.name,
      species: formData.species as any,
      breed: formData.breed || undefined,
      color: formData.color || undefined,
      weight: formData.weight || undefined,
      notes: formData.notes || undefined,
    });
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
              <PawPrint className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold">Pacientes</h1>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
                <DialogDescription>
                  Preencha os dados do animal
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="name">Nome do Animal *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Fluffy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="species">Espécie *</Label>
                  <Select value={formData.species} onValueChange={(value) => setFormData({ ...formData, species: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Cão</SelectItem>
                      <SelectItem value="cat">Gato</SelectItem>
                      <SelectItem value="bird">Pássaro</SelectItem>
                      <SelectItem value="rabbit">Coelho</SelectItem>
                      <SelectItem value="hamster">Hamster</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Raça</Label>
                  <Input
                    id="breed"
                    placeholder="Ex: Poodle"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    placeholder="Ex: Branco e preto"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    placeholder="Ex: 5.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
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
                <Button type="submit" className="w-full" disabled={createPatient.isPending}>
                  {createPatient.isPending ? "Criando..." : "Criar Paciente"}
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
            <p className="text-muted-foreground">Carregando pacientes...</p>
          </div>
        ) : patients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum paciente cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <PawPrint className="h-5 w-5 text-blue-600" />
                    {patient.name}
                  </CardTitle>
                  <CardDescription>
                    {patient.species === "dog" && "Cão"}
                    {patient.species === "cat" && "Gato"}
                    {patient.species === "bird" && "Pássaro"}
                    {patient.species === "rabbit" && "Coelho"}
                    {patient.species === "hamster" && "Hamster"}
                    {patient.species === "other" && "Outro"}
                    {patient.breed && ` - ${patient.breed}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {patient.color && <p><span className="font-semibold">Cor:</span> {patient.color}</p>}
                  {patient.weight && <p><span className="font-semibold">Peso:</span> {patient.weight} kg</p>}
                  {patient.microchipId && <p><span className="font-semibold">Microchip:</span> {patient.microchipId}</p>}
                  {patient.notes && <p><span className="font-semibold">Notas:</span> {patient.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

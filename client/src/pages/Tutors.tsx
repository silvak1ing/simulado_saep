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
import { ArrowLeft, Plus, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Tutors() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [clinicId, setClinicId] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });

  // Fetch tutors
  const { data: tutors = [], isLoading, refetch } = trpc.tutors.listByClinic.useQuery(clinicId);
  
  // Create tutor mutation
  const createTutor = trpc.tutors.create.useMutation({
    onSuccess: () => {
      toast.success("Tutor criado com sucesso!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        notes: "",
      });
      setOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar tutor: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createTutor.mutate({
      clinicId,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone,
      cpf: formData.cpf || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      zipCode: formData.zipCode || undefined,
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
              <Users className="h-6 w-6 text-green-600" />
              <h1 className="text-2xl font-bold">Tutores</h1>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tutor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Tutor</DialogTitle>
                <DialogDescription>
                  Preencha os dados do proprietário do animal
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ex: joao@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    placeholder="Ex: (11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="Ex: 123.456.789-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    placeholder="Ex: Rua das Flores, 123"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      placeholder="Ex: São Paulo"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      placeholder="Ex: SP"
                      maxLength={2}
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    placeholder="Ex: 01234-567"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
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
                <Button type="submit" className="w-full" disabled={createTutor.isPending}>
                  {createTutor.isPending ? "Criando..." : "Criar Tutor"}
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
            <p className="text-muted-foreground">Carregando tutores...</p>
          </div>
        ) : tutors.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum tutor cadastrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutors.map((tutor) => (
              <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    {tutor.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {tutor.email && <p><span className="font-semibold">Email:</span> {tutor.email}</p>}
                  {tutor.phone && <p><span className="font-semibold">Telefone:</span> {tutor.phone}</p>}
                  {tutor.cpf && <p><span className="font-semibold">CPF:</span> {tutor.cpf}</p>}
                  {tutor.address && <p><span className="font-semibold">Endereço:</span> {tutor.address}</p>}
                  {tutor.city && <p><span className="font-semibold">Cidade:</span> {tutor.city}</p>}
                  {tutor.notes && <p><span className="font-semibold">Notas:</span> {tutor.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

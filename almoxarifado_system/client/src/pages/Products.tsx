import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Edit2, Trash2, Search, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Textarea } from "@/components/ui/textarea";

interface ProductFormData {
  name: string;
  description: string;
  minStock: number;
}

export default function Products() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    minStock: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Queries e Mutations
  const { data: allProducts = [], refetch: refetchAll } = trpc.products.list.useQuery();
  const { data: searchResults = [] } = trpc.products.search.useQuery(
    { term: searchTerm },
    { enabled: searchTerm.length > 0 }
  );
  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();
  const deleteMutation = trpc.products.delete.useMutation();

  const products = searchTerm.length > 0 ? searchResults : allProducts;

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome do produto é obrigatório";
    }
    if (formData.minStock < 0) {
      newErrors.minStock = "Estoque mínimo não pode ser negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar produto
  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setSuccessMessage(
        editingId ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!"
      );
      setTimeout(() => setSuccessMessage(""), 3000);

      resetForm();
      setIsDialogOpen(false);
      refetchAll();
    } catch (error) {
      setErrors({ submit: "Erro ao salvar produto. Tente novamente." });
    }
  };

  // Editar produto
  const handleEditProduct = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      minStock: product.minStock,
    });
    setIsDialogOpen(true);
  };

  // Deletar produto
  const handleDeleteProduct = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        setSuccessMessage("Produto deletado com sucesso!");
        setTimeout(() => setSuccessMessage(""), 3000);
        refetchAll();
      } catch (error) {
        setErrors({ submit: "Erro ao deletar produto. Tente novamente." });
      }
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({ name: "", description: "", minStock: 0 });
    setErrors({});
    setEditingId(null);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cadastro de Produtos</h1>
            <p className="text-gray-600 mt-2">Gerenciar produtos do almoxarifado</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Atualize os dados do produto"
                    : "Preencha os dados do novo produto"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {errors.submit && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <label className="text-sm font-medium">Nome *</label>
                  <Input
                    placeholder="Nome do produto"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    placeholder="Descrição do produto"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Estoque Mínimo</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minStock: parseInt(e.target.value) || 0,
                      })
                    }
                    className={errors.minStock ? "border-red-500" : ""}
                  />
                  {errors.minStock && (
                    <p className="text-red-500 text-sm mt-1">{errors.minStock}</p>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleDialogChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveProduct}
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mensagens */}
        {successMessage && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Busca */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o nome do produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Cadastrados</CardTitle>
            <CardDescription>
              Total: {products.length} produto(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Nome</th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Descrição
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Quantidade
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Estoque Mínimo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {product.description || "-"}
                        </td>
                        <td className="py-3 px-4">{product.quantity}</td>
                        <td className="py-3 px-4">{product.minStock}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

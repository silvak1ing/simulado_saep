import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, AlertTriangle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MovementFormData {
  productId: number;
  type: "entrada" | "saída";
  quantity: number;
}

export default function Stock() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MovementFormData>({
    productId: 0,
    type: "entrada",
    quantity: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Queries e Mutations
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: lowStockProducts = [] } = trpc.stock.lowStockProducts.useQuery();
  const recordMovementMutation = trpc.stock.recordMovement.useMutation();

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = "Selecione um produto";
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = "Quantidade deve ser maior que 0";
    }

    // Validar saída
    if (formData.type === "saída") {
      const product = products.find((p: any) => p.id === formData.productId);
      if (product && product.quantity < formData.quantity) {
        newErrors.quantity = `Quantidade insuficiente. Disponível: ${product.quantity}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Registrar movimentação
  const handleRecordMovement = async () => {
    if (!validateForm()) return;

    try {
      await recordMovementMutation.mutateAsync({
        productId: formData.productId,
        type: formData.type,
        quantity: formData.quantity,
      });

      setSuccessMessage("Movimentação registrada com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      setErrors({ submit: "Erro ao registrar movimentação. Tente novamente." });
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({ productId: 0, type: "entrada", quantity: 0 });
    setErrors({});
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Ordenar produtos alfabeticamente
  const sortedProducts = [...products].sort((a: any, b: any) =>
    a.name.localeCompare(b.name)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Estoque</h1>
            <p className="text-gray-600 mt-2">
              Registre entrada e saída de produtos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Movimentação</DialogTitle>
                <DialogDescription>
                  Registre uma entrada ou saída de produto
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
                  <label className="text-sm font-medium">Produto *</label>
                  <Select
                    value={formData.productId.toString()}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        productId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger
                      className={errors.productId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedProducts.map((product: any) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                        >
                          {product.name} (Estoque: {product.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.productId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.productId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Tipo *</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saída">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Quantidade *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.quantity}
                    </p>
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
                    onClick={handleRecordMovement}
                    disabled={recordMovementMutation.isPending}
                  >
                    {recordMovementMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Registrar
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

        {/* Alertas de Estoque Baixo */}
        {lowStockProducts.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{lowStockProducts.length} produto(s)</strong> com estoque
              abaixo do mínimo:
              <ul className="mt-2 space-y-1">
                {lowStockProducts.map((product: any) => (
                  <li key={product.id} className="text-sm">
                    • {product.name}: {product.quantity} (mínimo:{" "}
                    {product.minStock})
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Produtos em Estoque */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos em Estoque</CardTitle>
            <CardDescription>
              Listagem de todos os produtos (ordenados alfabeticamente)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum produto cadastrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">
                        Produto
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Quantidade
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Estoque Mínimo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((product: any) => {
                      const isLowStock = product.quantity < product.minStock;
                      return (
                        <tr
                          key={product.id}
                          className={`border-b hover:bg-gray-50 ${
                            isLowStock ? "bg-red-50" : ""
                          }`}
                        >
                          <td className="py-3 px-4 font-medium">
                            {product.name}
                          </td>
                          <td className="py-3 px-4">{product.quantity}</td>
                          <td className="py-3 px-4">{product.minStock}</td>
                          <td className="py-3 px-4">
                            {isLowStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                                <AlertTriangle className="h-3 w-3" />
                                Estoque Baixo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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

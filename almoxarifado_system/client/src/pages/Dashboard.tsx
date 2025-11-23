import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Package, Boxes } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Buscar produtos com estoque baixo
  const { data: lowStockProducts = [] } = trpc.stock.lowStockProducts.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Gerenciamento centralizado do almoxarifado
          </p>
        </div>

        {/* Alertas de Estoque Baixo */}
        {lowStockProducts.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {lowStockProducts.length} produto(s) com estoque abaixo do mínimo.
              Verifique a seção de Gestão de Estoque.
            </AlertDescription>
          </Alert>
        )}

        {/* Cards de Atalhos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cadastro de Produtos</CardTitle>
                  <CardDescription>
                    Gerenciar produtos do almoxarifado
                  </CardDescription>
                </div>
                <Package className="h-8 w-8 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setLocation("/products")}
                className="w-full"
              >
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestão de Estoque</CardTitle>
                  <CardDescription>
                    Entrada e saída de produtos
                  </CardDescription>
                </div>
                <Boxes className="h-8 w-8 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setLocation("/stock")}
                className="w-full"
                variant="secondary"
              >
                Acessar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Usuário Logado</p>
                  <p className="font-semibold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{user?.email || "Não informado"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

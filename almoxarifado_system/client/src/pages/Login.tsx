import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, LogIn } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const { isAuthenticated, loading, error } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">{APP_TITLE}</CardTitle>
          <CardDescription>
            Sistema de Gerenciamento de Almoxarifado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro na autenticação. Por favor, tente novamente.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Faça login com sua conta para acessar o sistema de gerenciamento de estoque.
            </p>
          </div>

          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Fazer Login
          </Button>

          <div className="text-xs text-gray-500 text-center">
            Você será redirecionado para a página de autenticação segura.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

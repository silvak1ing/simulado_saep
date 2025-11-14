import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Patients from "./pages/Patients";
import Tutors from "./pages/Tutors";
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Vaccines from "./pages/Vaccines";
import Alerts from "./pages/Alerts";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/patients"} component={Patients} />
      <Route path={"/tutors"} component={Tutors} />
      <Route path={"/appointments"} component={Appointments} />
      <Route path={"/medical-records"} component={MedicalRecords} />
      <Route path={"/vaccines"} component={Vaccines} />
      <Route path={"/alerts"} component={Alerts} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

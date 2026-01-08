import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { EmployeeSetup } from "./components/EmployeeSetup";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-gray-900 to-black" dir="rtl">
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedApp />
      </Unauthenticated>
      <Toaster position="top-center" />
    </div>
  );
}

function AuthenticatedApp() {
  const employee = useQuery(api.employees.getCurrentEmployee);

  if (employee === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!employee) {
    return <EmployeeSetup />;
  }

  return <Dashboard employee={employee} />;
}

function UnauthenticatedApp() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-6">
            <img 
              src="https://polished-pony-114.convex.cloud/api/storage/474bbac8-4741-42c6-9681-8ab68ae8b470"
              alt="NEW EGYPT GOLD Logo"
              className="w-32 h-32 object-contain mx-auto transform hover:scale-105 transition-transform"
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            NEW EGYPT GOLD
          </h1>
          <p className="text-xl text-gray-300">
            تتبع مبيعاتك وتحصيلاتك بسهولة
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}

import { RouterProvider } from "react-router";
import { router } from "./routes";
import RippleEffect from "./components/RippleEffect";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <RippleEffect />
      <Toaster position="top-center" richColors />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

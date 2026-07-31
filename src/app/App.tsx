import { RouterProvider } from "react-router";
import { router } from "./routes";
import RippleEffect from "./components/RippleEffect";

export default function App() {
  return (
    <>
      <RippleEffect />
      <RouterProvider router={router} />
    </>
  );
}

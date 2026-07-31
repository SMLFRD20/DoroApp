import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Timer from "./pages/Timer";
import Tasks from "./pages/Tasks";
import Statistics from "./pages/Statistics";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import ApiDemoPage from "./pages/ApiDemoPage";
import SecondPage from "./pages/SecondPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/app",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "timer", Component: Timer },
      { path: "tasks", Component: Tasks },
      { path: "statistics", Component: Statistics },
      { path: "profile", Component: Profile },
      { path: "api-demo", Component: ApiDemoPage },
      { path: "second-page", Component: SecondPage },
    ],
  },
]);

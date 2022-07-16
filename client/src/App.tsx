import Landing from "./pages/Landing";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import { AdminRoute } from "./routes/AdminRoute";
import { SnackbarProvider } from "./context/SnackbarContext";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <UserProvider>
      <SnackbarProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<AdminRoute />}>
            <Route path="/dashboard/youtube-videos" element={<Dashboard />} />
            <Route path="/dashboard/generate" element={<Generate />} />
          </Route>
        </Routes>
      </SnackbarProvider>
    </UserProvider>
  );
}

export default App;

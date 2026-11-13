import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import Profile from "../pages/Profile";
import Landing from "../pages/Landing";
import Register from "../pages/Register";
import Login from "../pages/Login";
import OrganizationForm from "../pages/OrganizationForm";
import SelectOrganization from "../pages/SelectOrganization";
import Dashboard from "../pages/Dashboard";
import Donations from "../pages/Donations";
import Requests from "../pages/Requests";
import Volunteers from "../pages/Volunteers";
import Admin from "../pages/Admin";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/organizacao" element={<ProtectedRoute temporary><OrganizationForm /></ProtectedRoute>} />
        <Route path="/selecionar-organizacao" element={<ProtectedRoute temporary><SelectOrganization /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/doacoes" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
        <Route path="/requisicoes" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
        <Route path="/voluntarios" element={<ProtectedRoute roles={["ONG"]}><Volunteers /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Landing />} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

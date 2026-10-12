import { BrowserRouter, Routes, Route } from "react-router-dom";

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
        <Route path="/organizacao" element={<OrganizationForm />} />
        <Route path="/selecionar-organizacao" element={<SelectOrganization />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doacoes" element={<Donations />} />
        <Route path="/requisicoes" element={<Requests />} />
        <Route path="/voluntarios" element={<Volunteers />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

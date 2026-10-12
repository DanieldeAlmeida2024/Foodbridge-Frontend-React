import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="
      flex justify-between items-center 
      px-6 py-4 
      bg-white 
      border-b
      sticky top-0 z-50
    ">
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        FoodBridge
      </h1>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate("/login")}>
          Login
        </Button>

        <Button onClick={() => navigate("/cadastro")}>
          Cadastro
        </Button>
      </div>
    </nav>
  );
}
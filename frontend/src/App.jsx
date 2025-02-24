import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Pesquisa from "./pages/PesquisaViagem";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/pesquisa" element={<Pesquisa />} />
    </Routes>
  );
}

export default App;

import React, { useState } from "react";
import FormularioPesquisa from "./FormularioPesquisa";

function PesquisaViagem() {
  const [form, setForm] = useState({
    nome: "",
    adultos: 1,
    criancas: 0,
    idadesCriancas: [],
    origem: [""],
    destino: [""],
    meses: [],
    conexao: "direto",
    qtdConexoes: 0,
    preferenciaVoo: "rapido",
  });

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#4CAF50" }}>
      <FormularioPesquisa form={form} setForm={setForm} />
    </div>
  );
}

export default PesquisaViagem;

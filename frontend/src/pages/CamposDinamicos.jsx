import React, { useState, useEffect } from "react";
import Select from "react-select";
import styles from "./styles";

function CamposDinamicos({ form, setForm, field, label }) {
  const [cidades, setCidades] = useState([]);
  const [opcoesCidades, setOpcoesCidades] = useState([]);
  const valores = form[field] || [""];

  // Buscar cidades ao carregar o componente
  useEffect(() => {
    fetch("http://localhost:5000/api/cidades")
      .then((response) => response.json())
      .then((data) => {
        setCidades(data);
        const opcoes = data.map((cidade) => ({
          value: cidade.id,
          label: cidade.nome,
        }));
        setOpcoesCidades(opcoes);
      })
      .catch((error) => console.error("Erro ao buscar cidades:", error));
  }, []);

  // Função para atualizar o valor de um campo
  const handleChange = (selectedOption, index) => {
    const newValues = [...valores];
    newValues[index] = selectedOption ? selectedOption.value : "";
    setForm({ ...form, [field]: newValues });
  };

  // Função para adicionar um novo campo
  const addField = () => {
    setForm({ ...form, [field]: [...valores, ""] });
  };

  // Função para remover um campo
  const removeField = (index) => {
    const newValues = [...valores];
    newValues.splice(index, 1);
    setForm({ ...form, [field]: newValues });
  };

  return (
    <div style={{ width: "100%" }}> {/* Contêiner pai com largura total */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>{label}</label>
        {valores.map((valor, index) => (
          <div key={index} style={{ ...styles.inputGroup, width: "100%" }}> {/* Contêiner filho com largura total */}
            {/* Campo de autocompletar com React Select */}
            <Select
              options={opcoesCidades}
              value={opcoesCidades.find((opcao) => opcao.value === valor) || null}
              onChange={(selectedOption) => handleChange(selectedOption, index)}
              placeholder="Digite para buscar uma cidade..."
              isClearable
              noOptionsMessage={() => "Nenhuma cidade encontrada"}
              styles={{
                control: (base) => ({
                  ...base,
                  width: "100%", // Ocupa 100% da largura do contêiner
                  padding: "8px 12px", // Ajuste o padding conforme necessário
                  borderRadius: "5px", // Igual ao campo "Período da pesquisa"
                  border: "1px solid rgb(204, 204, 204)", // Igual ao campo "Período da pesquisa"
                  fontSize: "16px", // Igual ao campo "Período da pesquisa"
                  height: "40px", // Defina a altura manualmente (ajuste conforme necessário)
                  minHeight: "40px", // Garante que a altura não seja menor que 40px
                  boxShadow: "none", // Remove sombra
                }),
                dropdownIndicator: () => ({ display: "none" }), // Remove a seta do dropdown
                indicatorSeparator: () => ({ display: "none" }), // Remove o separador
                menu: (base) => ({
                  ...base,
                  marginTop: "0",
                  width: "100%", // Largura do dropdown igual ao campo
                }),
              }}
            />

            {/* Botão "Remover" apenas para campos adicionados após o primeiro */}
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeField(index)}
                style={styles.removeButton}
              >
                Remover
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addField} style={styles.addButton}>
          + Adicionar
        </button>
      </div>
    </div>
  );
}

export default CamposDinamicos;
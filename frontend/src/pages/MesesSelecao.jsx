import React from "react";
import styles from "./styles";

function MesesSelecao({ form, setForm }) {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Função para selecionar/deselecionar todos os meses
  const toggleTodosMeses = () => {
    if (form.meses.length === meses.length) {
      // Se todos já estão selecionados, deseleciona todos
      setForm({ ...form, meses: [] });
    } else {
      // Seleciona todos os meses
      setForm({ ...form, meses: [...meses] });
    }
  };

  // Função para lidar com a mudança de um checkbox individual
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const newMeses = checked ? [...prev.meses, value] : prev.meses.filter((mes) => mes !== value);
      return { ...prev, meses: newMeses };
    });
  };

  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>Meses</label>
      {/* Botão "Selecionar/Deselecionar Todos" */}
      <button
        type="button"
        onClick={toggleTodosMeses}
        style={styles.toggleButton}
      >
        {form.meses.length === meses.length ? "Deselecionar Todos" : "Selecionar Todos"}
      </button>
      <div style={styles.checkboxContainer}>
        {meses.map((mes) => (
          <label key={mes} style={styles.checkboxItem}>
            <input
              type="checkbox"
              value={mes}
              checked={form.meses.includes(mes)}
              onChange={handleCheckboxChange}
              style={styles.checkboxInput}
            />
            <span style={styles.checkboxLabel}>{mes}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default MesesSelecao;
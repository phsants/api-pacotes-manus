import React, { useState } from "react";
import styles from "./styles";

function PeriodoPesquisa({ form, setForm }) {
  const [tipoPeriodo, setTipoPeriodo] = useState(""); // Estado para armazenar a escolha do período

  // Função para lidar com a mudança no tipo de período
  const handleTipoPeriodoChange = (e) => {
    setTipoPeriodo(e.target.value);
  };

  // Função para lidar com a mudança no dia da semana (semanal)
  const handleDiaSemanaChange = (e) => {
    setForm({ ...form, diaSemana: e.target.value });
  };

  // Função para lidar com a mudança no intervalo de noites
  const handleNoitesChange = (e, tipo) => {
    const newNoites = { ...form.noites, [tipo]: e.target.value };
    setForm({ ...form, noites: newNoites });
  };

  // Função para lidar com a seleção de um dia específico
  const handleDiaEspecificoChange = (dia) => {
    setForm({ ...form, diaEspecifico: dia });
  };

  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>Período da Pesquisa</label>
      <select
        value={tipoPeriodo}
        onChange={handleTipoPeriodoChange}
        style={styles.input}
        required // Torna o campo obrigatório
      >
        <option value="" disabled hidden>Selecione o período</option> {/* Placeholder */}
        <option value="semanal">Semanal</option>
        <option value="diaEspecifico">Dia Específico</option>
        <option value="noites">Mes Completo</option>
      </select>

      {/* Campo para seleção do dia da semana (semanal) */}
      {tipoPeriodo === "semanal" && (
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Dia da Semana</label>
          <select
            value={form.diaSemana || ""}
            onChange={handleDiaSemanaChange}
            style={styles.input}
          >
            <option value="">Selecione o dia</option>
            <option value="Segunda">Segunda-feira</option>
            <option value="Terca">Terça-feira</option>
            <option value="Quarta">Quarta-feira</option>
            <option value="Quinta">Quinta-feira</option>
            <option value="Sexta">Sexta-feira</option>
            <option value="Sabado">Sábado</option>
            <option value="Domingo">Domingo</option>
          </select>
        </div>
      )}

      {/* Calendário simples para dia específico */}
      {tipoPeriodo === "diaEspecifico" && (
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Selecione o Dia</label>
          <div style={styles.calendario}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
              <button
                key={dia}
                type="button"
                onClick={() => handleDiaEspecificoChange(dia)}
                style={{
                  ...styles.diaButton,
                  backgroundColor: form.diaEspecifico === dia ? "#007bff" : "#e3f2fd",
                  color: form.diaEspecifico === dia ? "#fff" : "#333",
                }}
              >
                {dia}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Campos para intervalo de noites (exibido em Semanal e Dia Específico) */}
      {(tipoPeriodo === "semanal" || tipoPeriodo === "diaEspecifico" || tipoPeriodo === "noites") && (
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Intervalo de Noites</label>
          <div style={styles.inputGroup}>
            <input
              type="number"
              placeholder="Mínimo"
              value={form.noites?.min || ""}
              onChange={(e) => handleNoitesChange(e, "min")}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Máximo"
              value={form.noites?.max || ""}
              onChange={(e) => handleNoitesChange(e, "max")}
              style={styles.input}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PeriodoPesquisa;
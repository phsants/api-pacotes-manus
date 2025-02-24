import React from "react";
import CamposDinamicos from "./CamposDinamicos";
import MesesSelecao from "./MesesSelecao";
import PeriodoPesquisa from "./PeriodoPesquisa";
import styles from "./styles";

function FormularioPesquisa({ form, setForm }) {
  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Pesquisa de Pacotes de Viagem</h2>
        <form style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Nome do Cliente</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              style={styles.input}
            />
          </div>

          <CamposDinamicos form={form} setForm={setForm} field="origem" label="Saindo de" />
          <CamposDinamicos form={form} setForm={setForm} field="destino" label="Destino" />

          <MesesSelecao form={form} setForm={setForm} />

          <PeriodoPesquisa form={form} setForm={setForm} />

          <button type="submit" style={styles.button}>
            Pesquisar
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormularioPesquisa;
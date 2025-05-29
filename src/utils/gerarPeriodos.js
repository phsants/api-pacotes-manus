function gerarPeriodos(meses, tipo_periodo, diaEspecifico, diasSemana, noitesMin, noitesMax) {
  const periodos = [];
  const anoAtual = new Date().getFullYear();

  meses.forEach((mes) => {
    const primeiroDiaMes = new Date(`${anoAtual}-${mes}-01`);
    const ultimoDiaMes = new Date(anoAtual, mes, 0);

    if (tipo_periodo === "Semanal") {
      diasSemana.forEach((dia) => {
        let data = new Date(primeiroDiaMes);
        while (data <= ultimoDiaMes) {
          if (data.toLocaleDateString("pt-BR", { weekday: "long" }) === dia) {
            for (let noites = noitesMin; noites <= noitesMax; noites++) {
              periodos.push({ data: data.toISOString().split("T")[0], noites });
            }
          }
          data.setDate(data.getDate() + 1);
        }
      });
    }

    if (tipo_periodo === "Dia Específico") {
      let data = new Date(anoAtual, mes - 1, diaEspecifico);
      if (data >= primeiroDiaMes && data <= ultimoDiaMes) {
        for (let noites = noitesMin; noites <= noitesMax; noites++) {
          periodos.push({ data: data.toISOString().split("T")[0], noites });
        }
      }
    }

    if (tipo_periodo === "Mês Completo") {
      let data = new Date(primeiroDiaMes);
      while (data <= ultimoDiaMes) {
        for (let noites = noitesMin; noites <= noitesMax; noites++) {
          periodos.push({ data: data.toISOString().split("T")[0], noites });
        }
        data.setDate(data.getDate() + 1);
      }
    }
  });

  return periodos;
}

module.exports = { gerarPeriodos };

const pool = require("../db");

const getPesquisas = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pesquisas ORDER BY criado_em DESC");
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar pesquisas:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar pesquisas" });
  }
};

const getPesquisaDetalhe = async (req, res) => {
  const { id } = req.params;
  try {
    const pesquisa = await pool.query("SELECT * FROM pesquisas WHERE id = $1", [id]);
    const origensDestinos = await pool.query("SELECT * FROM origens_destinos WHERE pesquisa_id = $1", [id]);
    const agendamentos = await pool.query("SELECT * FROM agendamentos WHERE pesquisa_id = $1", [id]);

    res.json({
      success: true,
      data: {
        pesquisa: pesquisa.rows[0],
        origensDestinos: origensDestinos.rows,
        agendamentos: agendamentos.rows,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes da pesquisa:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar detalhes da pesquisa" });
  }
};

const configurarAgendamento = async (req, res) => {
  const { id } = req.params;
  const { dias_semana, horarios, frequencia, ativo } = req.body;

  try {
    await pool.query(
      `INSERT INTO agendamentos (pesquisa_id, dias_semana, horarios, frequencia, ativo)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (pesquisa_id) DO UPDATE SET dias_semana = $2, horarios = $3, frequencia = $4, ativo = $5`,
      [id, dias_semana, horarios, frequencia, ativo]
    );

    res.json({ success: true, message: "Agendamento atualizado" });
  } catch (error) {
    console.error("Erro ao salvar agendamento:", error);
    res.status(500).json({ success: false, error: "Erro ao salvar agendamento" });
  }
};

const rodarPesquisa = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("UPDATE pesquisas SET status = 'pendente' WHERE id = $1", [id]);
    res.json({ success: true, message: "Pesquisa marcada como pendente" });
  } catch (error) {
    console.error("Erro ao marcar pesquisa:", error);
    res.status(500).json({ success: false, error: "Erro ao atualizar status da pesquisa" });
  }
};

module.exports = {
  getPesquisas,
  getPesquisaDetalhe,
  configurarAgendamento,
  rodarPesquisa,
};

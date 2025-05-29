const pool = require("../db");

const { gerarPeriodos } = require("../utils/gerarPeriodos");

const salvarPesquisa = async (req, res) => {
  const {
    cliente_nome, origens, destinos, meses_selecionados, tipo_periodo,
    dia_especifico, dias_semana, noites_min, noites_max, apartamento,
    adultos, criancas, bebes, idades_criancas, idades_bebes, tipo_voo
  } = req.body;

  try {
    const pesquisaResult = await pool.query(
      `INSERT INTO pesquisas
        (cliente_nome, meses_selecionados, tipo_periodo, dia_especifico, dias_semana,
         noites_min, noites_max, apartamento, adultos, criancas, bebes, status, tipo_voo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pendente', $12)
       RETURNING id`,
      [cliente_nome, meses_selecionados, tipo_periodo, dia_especifico,
       dias_semana, noites_min, noites_max, apartamento, adultos, criancas, bebes, tipo_voo]
    );

    const pesquisaId = pesquisaResult.rows[0].id;

    for (const origem of origens) {
      for (const destino of destinos) {
        await pool.query(
          `INSERT INTO origens_destinos
           (pesquisa_id, origem, destino, nome_hotel, hotel_por_preco)
           VALUES ($1, $2, $3, $4, $5)`,
          [pesquisaId, origem.nome, destino.nome, destino.hotel || null, destino.hotel_por_preco ?? false]
        );
      }
    }

    if (criancas > 0 && Array.isArray(idades_criancas)) {
      for (const idade of idades_criancas) {
        await pool.query(
          `INSERT INTO idades_criancas (pesquisa_id, idade) VALUES ($1, $2)`,
          [pesquisaId, idade]
        );
      }
    }

    if (bebes > 0 && Array.isArray(idades_bebes)) {
      for (const idade of idades_bebes) {
        await pool.query(
          `INSERT INTO idades_bebes (pesquisa_id, idade) VALUES ($1, $2)`,
          [pesquisaId, idade]
        );
      }
    }

    if (["Semanal", "Dia Específico", "Mês Completo"].includes(tipo_periodo)) {
      const periodos = gerarPeriodos(meses_selecionados, tipo_periodo, dia_especifico, dias_semana, noites_min, noites_max);
      for (const { data, noites } of periodos) {
        await pool.query(
          `INSERT INTO periodos_pesquisa (pesquisa_id, data_pesquisa, noites) VALUES ($1, $2, $3)`,
          [pesquisaId, data, noites]
        );
      }
    }

    res.status(201).json({ message: "Pesquisa salva com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar pesquisa:", error);
    res.status(500).json({ error: "Erro ao salvar pesquisa" });
  }
};

const getPesquisas = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pesquisas ORDER BY data_criacao DESC");
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar pesquisas:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar pesquisas" });
  }
};

const getPesquisaDetalhe = async (req, res) => {
  const { id } = req.params;

  try {
    const pesquisaResult = await pool.query(
      "SELECT * FROM pesquisas WHERE id = $1",
      [id]
    );

    if (pesquisaResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Pesquisa não encontrada" });
    }

    const pesquisa = pesquisaResult.rows[0];

    const origensDestinosResult = await pool.query(
      "SELECT * FROM origens_destinos WHERE pesquisa_id = $1",
      [id]
    );

    let agendamentos = [];
    try {
      const agendamentoResult = await pool.query(
        "SELECT * FROM agendamentos WHERE pesquisa_id = $1",
        [id]
      );
      agendamentos = agendamentoResult.rows;
    } catch (error) {
      console.warn("Tabela agendamentos não encontrada ou erro na query. Ignorando.");
    }

    res.json({
      success: true,
      data: {
        pesquisa,
        origensDestinos: origensDestinosResult.rows,
        agendamentos,
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
    // Verificar se a pesquisa existe
    const pesquisaResult = await pool.query(
      "SELECT id FROM pesquisas WHERE id = $1",
      [id]
    );

    if (pesquisaResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Pesquisa não encontrada" });
    }

    // Criar tabela agendamentos se não existir (opcional mas útil pra ambiente dev/teste)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        pesquisa_id INTEGER PRIMARY KEY REFERENCES pesquisas(id) ON DELETE CASCADE,
        dias_semana TEXT[],
        horarios TEXT,
        frequencia TEXT,
        ativo BOOLEAN,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserir ou atualizar o agendamento
    await pool.query(
      `INSERT INTO agendamentos (pesquisa_id, dias_semana, horarios, frequencia, ativo)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (pesquisa_id)
       DO UPDATE SET
         dias_semana = EXCLUDED.dias_semana,
         horarios = EXCLUDED.horarios,
         frequencia = EXCLUDED.frequencia,
         ativo = EXCLUDED.ativo,
         atualizado_em = CURRENT_TIMESTAMP
      `,
      [id, dias_semana, horarios, frequencia, ativo]
    );

    res.json({ success: true, message: "Agendamento salvo/atualizado com sucesso" });
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

const excluirPesquisa = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM pesquisas WHERE id = $1", [id]);
    res.json({ success: true, message: "Pesquisa excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir pesquisa:", error);
    res.status(500).json({ success: false, error: "Erro ao excluir pesquisa" });
  }
};

const atualizarPesquisa = async (req, res) => {
  const { id } = req.params;
  const {
    cliente_nome, origens, destinos, meses_selecionados, tipo_periodo,
    dia_especifico, dias_semana, noites_min, noites_max, apartamento,
    adultos, criancas, bebes, idades_criancas, idades_bebes, tipo_voo, status
  } = req.body;

  try {
    // Atualiza tabela pesquisas
    await pool.query(
      `UPDATE pesquisas SET
        cliente_nome = $1,
        meses_selecionados = $2,
        tipo_periodo = $3,
        dia_especifico = $4,
        dias_semana = $5,
        noites_min = $6,
        noites_max = $7,
        apartamento = $8,
        adultos = $9,
        criancas = $10,
        bebes = $11,
        tipo_voo = $12,
        status = $13,
        atualizado_em = now()
      WHERE id = $14`,
      [
        cliente_nome, meses_selecionados, tipo_periodo, dia_especifico,
        dias_semana, noites_min, noites_max, apartamento, adultos,
        criancas, bebes, tipo_voo, status, id
      ]
    );

    // Deleta origens_destinos antigos
    await pool.query(`DELETE FROM origens_destinos WHERE pesquisa_id = $1`, [id]);

    // Insere novamente origens_destinos
    for (const origem of origens) {
      for (const destino of destinos) {
        await pool.query(
          `INSERT INTO origens_destinos
           (pesquisa_id, origem, destino, nome_hotel, hotel_por_preco)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, origem.nome, destino.nome, destino.hotel || null, destino.hotel_por_preco ?? false]
        );
      }
    }

    // Limpa e reinsere idades das crianças
    await pool.query(`DELETE FROM idades_criancas WHERE pesquisa_id = $1`, [id]);
    if (criancas > 0 && Array.isArray(idades_criancas)) {
      for (const idade of idades_criancas) {
        await pool.query(
          `INSERT INTO idades_criancas (pesquisa_id, idade) VALUES ($1, $2)`,
          [id, idade]
        );
      }
    }

    // Limpa e reinsere idades dos bebês
    await pool.query(`DELETE FROM idades_bebes WHERE pesquisa_id = $1`, [id]);
    if (bebes > 0 && Array.isArray(idades_bebes)) {
      for (const idade of idades_bebes) {
        await pool.query(
          `INSERT INTO idades_bebes (pesquisa_id, idade) VALUES ($1, $2)`,
          [id, idade]
        );
      }
    }

    // Limpa e reinsere períodos
    await pool.query(`DELETE FROM periodos_pesquisa WHERE pesquisa_id = $1`, [id]);
    if (["Semanal", "Dia Específico", "Mês Completo"].includes(tipo_periodo)) {
      const periodos = gerarPeriodos(meses_selecionados, tipo_periodo, dia_especifico, dias_semana, noites_min, noites_max);
      for (const { data, noites } of periodos) {
        await pool.query(
          `INSERT INTO periodos_pesquisa (pesquisa_id, data_pesquisa, noites) VALUES ($1, $2, $3)`,
          [id, data, noites]
        );
      }
    }

    res.json({ success: true, message: "Pesquisa atualizada com sucesso!" });

  } catch (error) {
    console.error("Erro ao atualizar pesquisa:", error);
    res.status(500).json({ success: false, error: "Erro ao atualizar pesquisa" });
  }
};

module.exports = {
  getPesquisas,
  getPesquisaDetalhe,
  configurarAgendamento,
  rodarPesquisa,
  salvarPesquisa,
  excluirPesquisa,
  atualizarPesquisa,
};
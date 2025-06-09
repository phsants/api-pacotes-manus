const pool = require("../db");

// Controllers existentes com melhorias
const getCidades = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        cidades.id,
        cidades.nome,
        estados.nome AS estado
      FROM cidades
      LEFT JOIN estados ON cidades.id_estado = estados.id
      ORDER BY cidades.nome
    `);

    const cidades = result.rows.map(cidade => ({
      id: cidade.id,
      nome: cidade.nome ? cidade.nome.toString().trim() : "",
      estado: cidade.estado
    }));

    res.json(cidades);
  } catch (err) {
    console.error("Erro ao buscar cidades:", err);
    res.status(500).json({ error: "Erro ao buscar cidades" });
  }
};

const getAeroportos = async (req, res) => {
  const { cidade_id } = req.params;

  if (!cidade_id || isNaN(parseInt(cidade_id))) {
    return res.status(400).json({ error: "ID de cidade inválido" });
  }

  try {
    const result = await pool.query(
      "SELECT id, codigo, nome FROM aeroportos WHERE cidade_id = $1 ORDER BY nome",
      [cidade_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar aeroportos:", err);
    res.status(500).json({ error: "Erro ao buscar aeroportos" });
  }
};

const getHoteis = async (req, res) => {
  try {
    const {
      origem,
      destino,
      nome_hotel,
      preco_min,
      preco_max,
      conexao,
      periodo,
      data_inicio,
      data_fim
    } = req.query;

    let query = `
      SELECT
        origem,
        destino,
        data_ida,
        data_volta,
        nome_hotel,
        tipo_quarto,
        refeicao,
        preco_total_pacote,
        preco_por_pessoa,
        criado_em AS data_pesquisa,
        id_execucao
      FROM hoteis
    `;

    const conditions = [];
    const values = [];

    if (origem) {
      const origens = Array.isArray(origem) ? origem : [origem];
      const placeholders = origens.map((_, idx) => `$${values.length + idx + 1}`);
      conditions.push(`origem IN (${placeholders.join(', ')})`);
      values.push(...origens);
    }

    if (destino) {
      const destinos = Array.isArray(destino) ? destino : [destino];
      const placeholders = destinos.map((_, idx) => `$${values.length + idx + 1}`);
      conditions.push(`destino IN (${placeholders.join(', ')})`);
      values.push(...destinos);
    }

    if (nome_hotel) {
      const hoteis = Array.isArray(nome_hotel) ? nome_hotel : [nome_hotel];
      const placeholders = hoteis.map((_, idx) => `$${values.length + idx + 1}`);
      conditions.push(`nome_hotel IN (${placeholders.join(', ')})`);
      values.push(...hoteis);
    }

    if (preco_min) {
      conditions.push(`preco_total_pacote >= $${values.length + 1}`);
      values.push(Number(preco_min));
    }

    if (preco_max) {
      conditions.push(`preco_total_pacote <= $${values.length + 1}`);
      values.push(Number(preco_max));
    }

    if (conexao) {
      if (conexao === 'direto') {
        conditions.push(`id_execucao IN (
          SELECT id_execucao
          FROM voos
          GROUP BY id_execucao
          HAVING COUNT(*) = 1
        )`);
      } else if (conexao === 'conexao') {
        conditions.push(`id_execucao IN (
          SELECT id_execucao
          FROM voos
          GROUP BY id_execucao
          HAVING COUNT(*) > 1
        )`);
      }
    }

    // Filtro por intervalo manual de datas de pesquisa
    if (data_inicio) {
      conditions.push(`criado_em >= $${values.length + 1}`);
      values.push(new Date(data_inicio));
    }

    if (data_fim) {
      conditions.push(`criado_em <= $${values.length + 1}`);
      values.push(new Date(data_fim));
    }


    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY criado_em DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar hotéis com filtros:", err);
    res.status(500).json({ error: "Erro ao buscar hotéis com filtros" });
  }
};

const getVoosByExecucao = async (req, res) => {
  const { id_execucao } = req.params;

  if (!id_execucao) {
    return res.status(400).json({ error: "Parâmetro 'id_execucao' é obrigatório." });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        companhia,
        numero_voo,
        tipo_aviao,
        classe,
        partida_data,
        partida_hora,
        partida_aeroporto,
        chegada_data,
        chegada_hora,
        chegada_aeroporto
      FROM voos
      WHERE id_execucao = $1
      ORDER BY partida_data ASC, partida_hora ASC
      `,
      [id_execucao]
    );

    const voos = result.rows;

    if (voos.length === 0) {
      return res.status(404).json({ error: "Nenhum voo encontrado para o 'id_execucao' fornecido." });
    }

    // Função para converter data e hora em objeto Date
    const parseDateTime = (data, hora) => {
      const [dia, mes, ano] = data.split("/").map(Number);
      const [horaPartida, minutoPartida] = hora.split(":").map(Number);
      return new Date(ano, mes - 1, dia, horaPartida, minutoPartida);
    };

    // Adiciona campos de data/hora completas para ordenação precisa
    voos.forEach(voo => {
      voo.partidaDateTime = parseDateTime(voo.partida_data, voo.partida_hora);
      voo.chegadaDateTime = parseDateTime(voo.chegada_data, voo.chegada_hora);
    });

    // Ordena os voos por data/hora de partida
    voos.sort((a, b) => a.partidaDateTime - b.partidaDateTime);

    // Determina a data de ida (primeira data de partida)
    const dataIda = voos[0].partida_data;

    // Separa os voos de ida e volta com base na data de ida
    const trechoIda = voos.filter(voo => voo.partida_data === dataIda);
    const trechoVolta = voos.filter(voo => voo.partida_data !== dataIda);

    // Remove os campos auxiliares antes de retornar
    trechoIda.forEach(voo => {
      delete voo.partidaDateTime;
      delete voo.chegadaDateTime;
    });
    trechoVolta.forEach(voo => {
      delete voo.partidaDateTime;
      delete voo.chegadaDateTime;
    });

    res.json({
      ida: trechoIda,
      volta: trechoVolta
    });
  } catch (err) {
    console.error("Erro ao buscar voos:", err);
    res.status(500).json({ error: "Erro ao buscar voos." });
  }
};

module.exports = { getCidades, getAeroportos, getHoteis, getVoosByExecucao };

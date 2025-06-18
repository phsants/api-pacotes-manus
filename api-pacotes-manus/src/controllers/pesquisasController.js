const { getPool } = require("../db");

// Controllers existentes com melhorias
const getCidades = async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    
    const result = await request.query(`
      SELECT
        cidades.id,
        cidades.nome,
        estados.nome AS estado
      FROM cidades
      LEFT JOIN estados ON cidades.id_estado = estados.id
      ORDER BY cidades.nome
    `);

    const cidades = result.recordset.map(cidade => ({
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
    const pool = await getPool();
    const request = pool.request();
    request.input('cidade_id', cidade_id);
    
    const result = await request.query(
      "SELECT id, codigo, nome FROM aeroportos WHERE cidade_id = @cidade_id ORDER BY nome"
    );
    
    res.json(result.recordset);
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
      data_inicio,
      data_fim,
      mes_ida,
      ano_ida
    } = req.query;

    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT
        h.origem,
        h.destino,
        h.data_ida,
        h.data_volta,
        h.nome_hotel,
        h.tipo_quarto,
        h.refeicao,
        h.preco_total_pacote,
        h.preco_por_pessoa,
        h.criado_em AS data_pesquisa,
        h.id_execucao,
        ISNULL(v.qtd_conexoes, 0) AS conexoes,
        CASE
          WHEN ISNULL(v.qtd_conexoes, 0) = 0 THEN 'Direto'
          ELSE 'Com Conexão'
        END AS tipo_conexao
      FROM hoteis h
      LEFT JOIN (
        SELECT
          id_execucao,
          CASE
            WHEN COUNT(*) <= 2 THEN 0
            ELSE COUNT(*) - 2
          END AS qtd_conexoes
        FROM voos
        GROUP BY id_execucao
      ) v ON h.id_execucao = v.id_execucao
    `;

    const conditions = [];
    let paramIndex = 1;

    if (origem) {
      const origens = Array.isArray(origem) ? origem : [origem];
      const placeholders = [];
      origens.forEach((o, idx) => {
        const paramName = `origem${paramIndex + idx}`;
        request.input(paramName, o);
        placeholders.push(`@${paramName}`);
      });
      conditions.push(`h.origem IN (${placeholders.join(', ')})`);
      paramIndex += origens.length;
    }

    if (destino) {
      const destinos = Array.isArray(destino) ? destino : [destino];
      const placeholders = [];
      destinos.forEach((d, idx) => {
        const paramName = `destino${paramIndex + idx}`;
        request.input(paramName, d);
        placeholders.push(`@${paramName}`);
      });
      conditions.push(`h.destino IN (${placeholders.join(', ')})`);
      paramIndex += destinos.length;
    }

    if (nome_hotel) {
      const hoteis = Array.isArray(nome_hotel) ? nome_hotel : [nome_hotel];
      const placeholders = [];
      hoteis.forEach((h, idx) => {
        const paramName = `hotel${paramIndex + idx}`;
        request.input(paramName, h);
        placeholders.push(`@${paramName}`);
      });
      conditions.push(`h.nome_hotel IN (${placeholders.join(', ')})`);
      paramIndex += hoteis.length;
    }

    if (preco_min) {
      request.input('preco_min', Number(preco_min));
      conditions.push(`h.preco_total_pacote >= @preco_min`);
    }

    if (preco_max) {
      request.input('preco_max', Number(preco_max));
      conditions.push(`h.preco_total_pacote <= @preco_max`);
    }

    // 🎯 Filtro de conexão (corrigido com h.id_execucao)
    if (conexao) {
      if (conexao === 'direto') {
        conditions.push(`h.id_execucao IN (
          SELECT id_execucao
          FROM voos
          GROUP BY id_execucao
          HAVING COUNT(*) = 1
        )`);
      } else if (conexao === 'conexao') {
        conditions.push(`h.id_execucao IN (
          SELECT id_execucao
          FROM voos
          GROUP BY id_execucao
          HAVING COUNT(*) > 1
        )`);
      }
    }

    // 🔥 Filtro por data de pesquisa
    if (data_inicio) {
      request.input('data_inicio', new Date(data_inicio));
      conditions.push(`h.criado_em >= @data_inicio`);
    }

    if (data_fim) {
      request.input('data_fim', new Date(data_fim));
      conditions.push(`h.criado_em <= @data_fim`);
    }

    // 📅 Filtro de mês e ano da data de IDA
    if (mes_ida && ano_ida) {
      request.input('mes_ida', Number(mes_ida));
      request.input('ano_ida', Number(ano_ida));
      conditions.push(`
        MONTH(CONVERT(date, h.data_ida, 103)) = @mes_ida AND
        YEAR(CONVERT(date, h.data_ida, 103)) = @ano_ida
      `);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY h.criado_em DESC';

    const result = await request.query(query);
    res.json(result.recordset);
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
    const pool = await getPool();
    const request = pool.request();
    request.input('id_execucao', id_execucao);
    
    const result = await request.query(
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
      WHERE id_execucao = @id_execucao
      ORDER BY partida_data ASC, partida_hora ASC
      `
    );

    const voos = result.recordset;

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


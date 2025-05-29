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

const getVoos = async (req, res) => {
  // Implementar filtros baseados em query params
  const {
    origem,
    destino,
    data_ida,
    data_volta,
    preco_min,
    preco_max,
    companhia,
    conexoes,
    hotel,
    categoria_hotel
  } = req.query;

  try {
    let query = `
      SELECT
        v.id,
        v.origem,
        v.destino,
        v.data_ida,
        v.data_volta,
        v.companhia,
        v.numero_voo,
        v.tipo_aviao,
        v.classe,
        v.partida_data,
        v.partida_hora,
        v.partida_aeroporto,
        v.chegada_data,
        v.chegada_hora,
        v.chegada_aeroporto,
        v.criado_em AS data_pesquisa,
        p.cliente_nome,
        p.tipo_voo,
        p.adultos,
        p.criancas,
        p.bebes,
        p.apartamento,
        h.nome_hotel,
        h.preco_por_pessoa AS preco,
        h.preco_total_pacote,
        EXTRACT(EPOCH FROM (h.data_volta::timestamp - h.data_ida::timestamp)) / 60 AS tempo_voo,
        CASE WHEN POSITION(',' IN v.numero_voo) > 0 THEN 1 ELSE 0 END AS qtd_conexoes,
        CASE
          WHEN h.nome_hotel ILIKE '%5%' THEN 5
          WHEN h.nome_hotel ILIKE '%4%' THEN 4
          WHEN h.nome_hotel ILIKE '%3%' THEN 3
          ELSE 0
        END AS categoria_hotel
      FROM voos v
      LEFT JOIN pesquisas p ON v.pesquisa_id = p.id
      LEFT JOIN hoteis h ON h.pesquisa_id = v.pesquisa_id
        AND h.origem = v.origem
        AND h.destino = v.destino
        AND h.data_ida = v.data_ida
        AND h.data_volta = v.data_volta
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Adicionar filtros condicionais
    if (origem) {
      query += ` AND v.origem = $${paramIndex++}`;
      params.push(origem);
    }

    if (destino) {
      query += ` AND v.destino = $${paramIndex++}`;
      params.push(destino);
    }

    if (data_ida) {
      query += ` AND v.data_ida = $${paramIndex++}`;
      params.push(data_ida);
    }

    if (data_volta) {
      query += ` AND v.data_volta = $${paramIndex++}`;
      params.push(data_volta);
    }

    if (preco_min) {
      query += ` AND h.preco_total_pacote >= $${paramIndex++}`;
      params.push(parseFloat(preco_min));
    }

    if (preco_max) {
      query += ` AND h.preco_total_pacote <= $${paramIndex++}`;
      params.push(parseFloat(preco_max));
    }

    if (companhia) {
      query += ` AND v.companhia = $${paramIndex++}`;
      params.push(companhia);
    }

    if (conexoes === 'direto') {
      query += ` AND POSITION(',' IN v.numero_voo) = 0`;
    } else if (conexoes === 'conexao') {
      query += ` AND POSITION(',' IN v.numero_voo) > 0`;
    }

    if (hotel === 'true' || hotel === true) {
      query += ` AND h.nome_hotel IS NOT NULL`;

      if (categoria_hotel) {
        query += ` AND (
          CASE
            WHEN h.nome_hotel ILIKE '%5%' THEN 5
            WHEN h.nome_hotel ILIKE '%4%' THEN 4
            WHEN h.nome_hotel ILIKE '%3%' THEN 3
            ELSE 0
          END
        ) = $${paramIndex++}`;
        params.push(parseInt(categoria_hotel));
      }
    }

    query += ` ORDER BY v.criado_em DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar voos:", error);
    res.status(500).json({ error: "Erro ao buscar voos" });
  }
};

module.exports = { getCidades, getAeroportos, getVoos };

const pool = require("../db");

const getCidades = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nome FROM cidades");
    const cidades = result.rows.map(cidade => ({
      id: cidade.id,
      nome: cidade.nome ? cidade.nome.toString().trim() : "",
    }));
    res.json(cidades);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar cidades");
  }
};

const getAeroportos = async (req, res) => {
  const { cidade_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT codigo, nome FROM aeroportos WHERE cidade_id = $1",
      [cidade_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar aeroportos");
  }
};

const getVoos = async (req, res) => {
  try {
    const query = `
      SELECT
        v.id,
        v.origem,
        v.destino,
        v.data_ida AS data_saida,
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
        EXTRACT(EPOCH FROM (h.data_volta - h.data_ida)) / 60 AS tempo_voo,
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
      ORDER BY v.criado_em DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar voos:", error);
    res.status(500).json({ error: "Erro ao buscar voos" });
  }
};

module.exports = { getCidades, getAeroportos, getVoos };

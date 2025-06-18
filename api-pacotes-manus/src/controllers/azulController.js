const { getPool } = require("../db");

const { gerarPeriodos } = require("../utils/gerarPeriodos");

const salvarPesquisa = async (req, res) => {
  const {
    cliente_nome, origens, destinos, meses_selecionados, tipo_periodo,
    dia_especifico, dias_semana, noites_min, noites_max, apartamento,
    adultos, criancas, bebes, idades_criancas, idades_bebes, tipo_voo
  } = req.body;

  try {
    const pool = await getPool();
    const request = pool.request();

    // Mapear apartamento string para número
    const apartamentoMap = {
      'Standard': 1,
      'Premium': 2,
      'Deluxe': 3,
      'Econômica': 1,
      'Executiva': 2,
      'Primeira Classe': 3
    };
    const apartamentoId = apartamentoMap[apartamento] || 1;

    // 🔥 Transformar arrays em strings (se necessário)
    const mesesString = Array.isArray(meses_selecionados)
      ? meses_selecionados.join(',')
      : (meses_selecionados || '');

    const diasSemanaString = Array.isArray(dias_semana)
      ? dias_semana.join(',')
      : (dias_semana || '');

    // Adicionar parâmetros
    request.input('cliente_nome', cliente_nome);
    request.input('meses_selecionados', mesesString);
    request.input('tipo_periodo', tipo_periodo);
    request.input('dia_especifico', dia_especifico || '');
    request.input('dias_semana', diasSemanaString);
    request.input('noites_min', noites_min);
    request.input('noites_max', noites_max);
    request.input('apartamento', apartamentoId);
    request.input('adultos', adultos);
    request.input('criancas', criancas);
    request.input('bebes', bebes);
    request.input('tipo_voo', tipo_voo);

    const pesquisaResult = await request.query(
      `INSERT INTO pesquisas
        (cliente_nome, meses_selecionados, tipo_periodo, dia_especifico, dias_semana,
         noites_min, noites_max, apartamento, adultos, criancas, bebes, status, tipo_voo)
       OUTPUT INSERTED.id
       VALUES (@cliente_nome, @meses_selecionados, @tipo_periodo, @dia_especifico,
               @dias_semana, @noites_min, @noites_max, @apartamento, @adultos, @criancas, @bebes, 'pendente', @tipo_voo)`
    );

    const pesquisaId = pesquisaResult.recordset[0].id;

    // Origens e Destinos
    for (const origem of origens) {
      for (const destino of destinos) {
        const request2 = pool.request();
        request2.input('pesquisa_id', pesquisaId);
        request2.input('origem', origem.nome);
        request2.input('destino', destino.nome);
        request2.input('nome_hotel', destino.hotel || null);
        request2.input('hotel_por_preco', destino.hotel_por_preco ?? false);

        await request2.query(
          `INSERT INTO origens_destinos
           (pesquisa_id, origem, destino, nome_hotel, hotel_por_preco)
           VALUES (@pesquisa_id, @origem, @destino, @nome_hotel, @hotel_por_preco)`
        );
      }
    }

    // Idades das crianças
    if (criancas > 0 && Array.isArray(idades_criancas)) {
      for (const idade of idades_criancas) {
        const request3 = pool.request();
        request3.input('pesquisa_id', pesquisaId);
        request3.input('idade', idade);

        await request3.query(
          `INSERT INTO idades_criancas (pesquisa_id, idade) VALUES (@pesquisa_id, @idade)`
        );
      }
    }

    // Idades dos bebês
    if (bebes > 0 && Array.isArray(idades_bebes)) {
      for (const idade of idades_bebes) {
        const request4 = pool.request();
        request4.input('pesquisa_id', pesquisaId);
        request4.input('idade', idade);

        await request4.query(
          `INSERT INTO idades_bebes (pesquisa_id, idade) VALUES (@pesquisa_id, @idade)`
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
    const pool = await getPool();
    const request = pool.request();
    const result = await request.query("SELECT * FROM pesquisas ORDER BY data_criacao DESC");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Erro ao buscar pesquisas:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar pesquisas" });
  }
};

const getPesquisaDetalhe = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('id', id);

    const pesquisaResult = await request.query(
      "SELECT * FROM pesquisas WHERE id = @id"
    );

    if (pesquisaResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: "Pesquisa não encontrada" });
    }

    const pesquisa = pesquisaResult.recordset[0];

    // 🔥 Tratamento dos campos que eram string
    const mesesArray = pesquisa.meses_selecionados
      ? pesquisa.meses_selecionados.split(',').map(m => m.trim())
      : [];

    const diasSemanaArray = pesquisa.dias_semana
      ? pesquisa.dias_semana.split(',').map(d => d.trim())
      : [];

    const request2 = pool.request();
    request2.input('id', id);
    const origensDestinosResult = await request2.query(
      "SELECT * FROM origens_destinos WHERE pesquisa_id = @id"
    );

    let agendamentos = [];
    try {
      const request3 = pool.request();
      request3.input('id', id);
      const agendamentoResult = await request3.query(
        "SELECT * FROM agendamentos WHERE pesquisa_id = @id"
      );
      agendamentos = agendamentoResult.recordset.map(item => ({
        ...item,
        dias_semana: item.dias_semana ? JSON.parse(item.dias_semana) : []
      }));
    } catch (error) {
      console.warn("Tabela agendamentos não encontrada ou erro na query. Ignorando.");
    }

    res.json({
      success: true,
      data: {
        pesquisa: {
          ...pesquisa,
          meses_selecionados: mesesArray,
          dias_semana: diasSemanaArray
        },
        origensDestinos: origensDestinosResult.recordset,
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
    const pool = await getPool();
    
    // Verificar se a pesquisa existe
    const request = pool.request();
    request.input('id', id);
    const pesquisaResult = await request.query(
      "SELECT id FROM pesquisas WHERE id = @id"
    );

    if (pesquisaResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: "Pesquisa não encontrada" });
    }

    // Criar tabela agendamentos se não existir
    const request2 = pool.request();
    await request2.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='agendamentos' AND xtype='U')
      CREATE TABLE agendamentos (
        pesquisa_id INTEGER PRIMARY KEY REFERENCES pesquisas(id) ON DELETE CASCADE,
        dias_semana NVARCHAR(MAX),
        horarios NVARCHAR(MAX),
        frequencia NVARCHAR(50),
        ativo BIT,
        atualizado_em DATETIME DEFAULT GETDATE()
      )
    `);

    // Inserir ou atualizar o agendamento
    const request3 = pool.request();
    request3.input('pesquisa_id', id);
    request3.input('dias_semana', JSON.stringify(dias_semana));
    request3.input('horarios', horarios);
    request3.input('frequencia', frequencia);
    request3.input('ativo', ativo);
    
    await request3.query(
      `MERGE agendamentos AS target
       USING (SELECT @pesquisa_id AS pesquisa_id) AS source
       ON target.pesquisa_id = source.pesquisa_id
       WHEN MATCHED THEN
         UPDATE SET
           dias_semana = @dias_semana,
           horarios = @horarios,
           frequencia = @frequencia,
           ativo = @ativo,
           atualizado_em = GETDATE()
       WHEN NOT MATCHED THEN
         INSERT (pesquisa_id, dias_semana, horarios, frequencia, ativo)
         VALUES (@pesquisa_id, @dias_semana, @horarios, @frequencia, @ativo);`
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
    const pool = await getPool();
    const request = pool.request();
    request.input('id', id);
    await request.query("UPDATE pesquisas SET status = 'pendente' WHERE id = @id");
    res.json({ success: true, message: "Pesquisa marcada como pendente" });
  } catch (error) {
    console.error("Erro ao marcar pesquisa:", error);
    res.status(500).json({ success: false, error: "Erro ao atualizar status da pesquisa" });
  }
};

const excluirPesquisa = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('id', id);
    await request.query("DELETE FROM pesquisas WHERE id = @id");
    res.json({ success: true, message: "Pesquisa excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir pesquisa:", error);
    res.status(500).json({ success: false, error: "Erro ao excluir pesquisa" });
  }
};

const atualizarPesquisa = async (req, res) => {
  const { id } = req.params;
  const {
    cliente_nome, meses_selecionados, tipo_periodo,
    dia_especifico, dias_semana, noites_min, noites_max, apartamento,
    adultos, criancas, bebes, idades_criancas, idades_bebes, tipo_voo, status
  } = req.body;

  try {
    const pool = await getPool();

    // 🔥 Conversão de arrays para string
    const mesesString = Array.isArray(meses_selecionados)
      ? meses_selecionados.join(',')
      : (meses_selecionados || '');

    const diasSemanaString = Array.isArray(dias_semana)
      ? dias_semana.join(',')
      : (dias_semana || '');

    const request = pool.request();
    request.input('cliente_nome', cliente_nome);
    request.input('meses_selecionados', mesesString);
    request.input('tipo_periodo', tipo_periodo);
    request.input('dia_especifico', dia_especifico);
    request.input('dias_semana', diasSemanaString);
    request.input('noites_min', noites_min);
    request.input('noites_max', noites_max);
    request.input('apartamento', apartamento);
    request.input('adultos', adultos);
    request.input('criancas', criancas);
    request.input('bebes', bebes);
    request.input('tipo_voo', tipo_voo);
    request.input('status', status);
    request.input('id', id);

    await request.query(
      `UPDATE pesquisas SET
        cliente_nome = @cliente_nome,
        meses_selecionados = @meses_selecionados,
        tipo_periodo = @tipo_periodo,
        dia_especifico = @dia_especifico,
        dias_semana = @dias_semana,
        noites_min = @noites_min,
        noites_max = @noites_max,
        apartamento = @apartamento,
        adultos = @adultos,
        criancas = @criancas,
        bebes = @bebes,
        tipo_voo = @tipo_voo,
        status = @status,
        atualizado_em = GETDATE()
      WHERE id = @id`
    );

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


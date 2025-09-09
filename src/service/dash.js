const db = require('../configs/pg')


// Dash 1: Resumo (abertas, atrasadas, vencem_hoje, concluidas_mes, faturamento_mes, ticket_medio_mes)
const sql_resumo = `
  WITH open_status AS (
    SELECT s.stt_id, s.stt_nome
    FROM t_status s
    WHERE s.stt_nome NOT IN ('FINALIZADA','CANCELADA')
  ),
  abertas AS (
    SELECT o.ord_id, o.ord_data, os.stt_nome
    FROM t_ordem o
    JOIN open_status os ON os.stt_id = o.stt_id
  ),
  mes AS (
    SELECT date_trunc('month', CURRENT_DATE)::date AS dt_ini,
           (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date AS dt_fim
  ),
  pagos_mes AS (
    SELECT p.ord_id, SUM(p.opg_valor) AS total_pago
    FROM t_ordpag p, mes m
    WHERE p.opg_pago = 'S'
      AND p.opg_vencimento >= m.dt_ini
      AND p.opg_vencimento <  m.dt_fim
    GROUP BY p.ord_id
  )
  SELECT
    (SELECT COUNT(1) FROM abertas) AS abertas,
    (SELECT COUNT(1) FROM abertas a WHERE a.ord_data < CURRENT_DATE) AS atrasadas,
    (SELECT COUNT(1) FROM abertas a WHERE a.ord_data = CURRENT_DATE) AS vencem_hoje,
    (SELECT COUNT(1) FROM abertas a WHERE a.stt_nome = 'AGUARDANDO APROVAÇÃO') AS agr_aprovacao,
    (SELECT COUNT(1)
       FROM t_ordem o
       JOIN t_status s ON s.stt_id = o.stt_id
      WHERE s.stt_nome = 'FINALIZADA'
        AND date_trunc('month', o.ord_data) = date_trunc('month', CURRENT_DATE)) AS concluidas_mes,
    COALESCE((SELECT SUM(total_pago) FROM pagos_mes), 0)::numeric(12,2) AS faturamento_mes,
    COALESCE((SELECT AVG(total_pago) FROM pagos_mes), 0)::numeric(12,2) AS ticket_medio_mes;
`

// Dash 2: Por responsável
const sql_por_responsavel_base = `
  SELECT COALESCE(u.usu_nome, '— Sem responsável —') AS responsavel,
         COUNT(1) AS total
    FROM t_ordem o
    LEFT JOIN t_usuresponsavel u ON u.usu_id = o.ord_responsavel
   GROUP BY COALESCE(u.usu_nome, '— Sem responsável —')
   ORDER BY total DESC, responsavel
`

// Dash 3: Backlog por idade (apenas abertas)
const sql_backlog_aging = `
  WITH abertas AS (
    SELECT o.ord_id, o.ord_data
      FROM t_ordem o
      JOIN t_status s ON s.stt_id = o.stt_id
     WHERE s.stt_nome NOT IN ('FINALIZADA','CANCELADA')
  )
  SELECT faixa, COUNT(*) AS total
    FROM (
      SELECT CASE
               WHEN CURRENT_DATE - a.ord_data <= 2  THEN '0-2'
               WHEN CURRENT_DATE - a.ord_data <= 7  THEN '3-7'
               WHEN CURRENT_DATE - a.ord_data <= 14 THEN '8-14'
               ELSE '>14'
             END AS faixa
        FROM abertas a
    ) x
   GROUP BY faixa
   ORDER BY CASE faixa
              WHEN '0-2'  THEN 1
              WHEN '3-7'  THEN 2
              WHEN '8-14' THEN 3
              ELSE 4
            END;
`

// Dash 4: Hoje + Amanhã
const sql_hoje_e_amanha = `
  SELECT *
  FROM (
    SELECT
      o.ord_id,
      c.cli_nome AS cliente,
      e.cli_endereco AS endereco,
      COALESCE(u.usu_nome, '—') AS responsavel,
      o.ord_data,
      o.ord_hora,
      s.stt_nome AS status
    FROM t_ordem o
    JOIN t_status   s ON s.stt_id   = o.stt_id
    JOIN t_cliente  c ON c.cli_id   = o.cli_id
    JOIN t_endercli e ON e.end_id   = o.end_id
    LEFT JOIN t_usuresponsavel u ON u.usu_id = o.ord_responsavel
    WHERE s.stt_nome NOT IN ('FINALIZADA','CANCELADA', 'AGUARDANDO APROVAÇÃO')
      AND o.ord_data = CURRENT_DATE

    UNION ALL

    SELECT
      o.ord_id,
      c.cli_nome AS cliente,
      e.cli_endereco AS endereco,
      COALESCE(u.usu_nome, '—') AS responsavel,
      o.ord_data,
      o.ord_hora,
      s.stt_nome AS status
    FROM t_ordem o
    JOIN t_status   s ON s.stt_id   = o.stt_id
    JOIN t_cliente  c ON c.cli_id   = o.cli_id
    JOIN t_endercli e ON e.end_id   = o.end_id
    LEFT JOIN t_usuresponsavel u ON u.usu_id = o.ord_responsavel
    WHERE s.stt_nome NOT IN ('FINALIZADA','CANCELADA', 'AGUARDANDO APROVAÇÃO')
      AND o.ord_data = CURRENT_DATE + 1
  ) z
  ORDER BY z.ord_data, z.ord_hora NULLS LAST, z.ord_id;
`

// Dash 5: carga por dia/hora
const sql_carga_dia_hora = `
  SELECT
    EXTRACT(DOW FROM o.ord_data)::int AS dow,
    NULLIF(split_part(o.ord_hora, ':', 1), '')::int AS hora,
    COUNT(*) AS total
  FROM t_ordem o
  JOIN t_status s ON s.stt_id = o.stt_id
  WHERE s.stt_nome NOT IN ('FINALIZADA','CANCELADA', 'AGUARDANDO APROVAÇÃO')
  GROUP BY 1, 2
  ORDER BY 1, 2;
`

// Dash 6: Pagamentos recentes
const sql_pagamentos_recent = `
  SELECT
    p.opg_vencimento::date              AS dia,
    COUNT(*)                            AS qtd_parcelas,
    SUM(p.opg_valor)::numeric(12,2)     AS valor_total
  FROM t_ordpag p
  JOIN t_ordem  o ON o.ord_id = p.ord_id
  JOIN t_status s ON s.stt_id = o.stt_id
 WHERE p.opg_pago = 'N'
   AND p.opg_vencimento < CURRENT_DATE
   AND s.stt_nome NOT IN ('FINALIZADA','CANCELADA','AGUARDANDO APROVAÇÃO')
 GROUP BY dia
 ORDER BY dia DESC
`
const getDashResumo = async () => {
  try {
    const result = await db.query(sql_resumo)
    return result.rows[0]
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar resumo do dash: ' + err.message }
  }
}

const getDashPorResponsavel = async () => {
  try {
    const result = await db.query(sql_por_responsavel_base)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar dash por responsável: ' + err.message }
  }
}

const getDashBacklogAging = async () => {
  try {
    const result = await db.query(sql_backlog_aging)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar dash backlog/idade: ' + err.message }
  }
}

const getDashHojeEAmanha = async () => {
  try {
    const result = await db.query(sql_hoje_e_amanha)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar dash de hoje e amanhã: ' + err.message }
  }
}

const getDashCargaDiaHora = async () => {
  try {
    const result = await db.query(sql_carga_dia_hora)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar dash carga dia/hora: ' + err.message }
  }
}

const getDashPagamentosRecentes = async () => {
  try {
    const result = await db.query(sql_pagamentos_recent)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    throw { status: 500, message: 'Erro ao buscar pagamentos recentes: ' + err.message }
  }
}

module.exports = {
  getDashResumo,
  getDashPorResponsavel,
  getDashBacklogAging,
  getDashHojeEAmanha,
  getDashCargaDiaHora,
  getDashPagamentosRecentes
}

const db = require('../configs/pg')

const DEFAULT_STEP_MIN     = 30
const DEFAULT_DURATION_MIN = 60

const sql_findConflicts = `
WITH new_os AS (
  SELECT
    $1::bigint  AS ord_id,
    $2::bigint  AS vei_id,
    $3::bigint  AS ord_responsavel,
    $4::bigint  AS end_id,
    $5::date    AS ord_data,
    $6::text    AS ord_hora,
    $7::int     AS ord_duracao_min
),
new_city AS (
  SELECT
    n.*,
    e.cid_id,
    c.cid_deslocamento,
    (n.ord_data::timestamp
       + make_interval(hours => split_part(n.ord_hora, ':', 1)::int,
                       mins  => split_part(n.ord_hora, ':', 2)::int)) AS start_ts,
    (n.ord_data::timestamp
       + make_interval(hours => split_part(n.ord_hora, ':', 1)::int,
                       mins  => split_part(n.ord_hora, ':', 2)::int)
       + (n.ord_duracao_min * interval '1 minute')) AS end_ts
  FROM new_os n
  JOIN t_endercli e ON e.end_id = n.end_id
  JOIN t_cidade   c ON c.cid_id = e.cid_id
),
new_occ AS (
  SELECT
    *,
    start_ts - ((cid_deslocamento / 2) * interval '1 minute') AS occ_start,
    end_ts   + ((cid_deslocamento / 2) * interval '1 minute') AS occ_end
  FROM new_city
),
existing AS (
  SELECT
    o.ord_id,
    o.vei_id,
    o.ord_responsavel,
    o.end_id,
    o.ord_data,
    o.ord_hora,
    COALESCE(o.ord_duracao_min, $7) AS ord_duracao_min,
    e.cid_id,
    c.cid_deslocamento,
    (o.ord_data::timestamp
       + make_interval(hours => split_part(o.ord_hora, ':', 1)::int,
                       mins  => split_part(o.ord_hora, ':', 2)::int)) AS start_ts,
    (o.ord_data::timestamp
       + make_interval(hours => split_part(o.ord_hora, ':', 1)::int,
                       mins  => split_part(o.ord_hora, ':', 2)::int)
       + (COALESCE(o.ord_duracao_min, $7) * interval '1 minute')) AS end_ts
  FROM t_ordem o
  JOIN t_endercli e ON e.end_id = o.end_id
  JOIN t_cidade   c ON c.cid_id = e.cid_id
  JOIN t_status   s ON s.stt_id = o.stt_id
  WHERE UPPER(COALESCE(s.stt_nome,'')) NOT IN ('CANCELADA', 'FINALIZADA')
    AND (($2::bigint IS NOT NULL AND o.vei_id = $2::bigint)
        OR ($3::bigint IS NOT NULL AND o.ord_responsavel = $3::bigint))
    AND o.ord_data BETWEEN ($5::date - INTERVAL '1 day')::date AND ($5::date + INTERVAL '1 day')::date
    AND ($1::bigint IS NULL OR o.ord_id <> $1::bigint)
),
existing_occ AS (
  SELECT *, start_ts - ((cid_deslocamento / 2) * interval '1 minute') AS occ_start,
         end_ts   + ((cid_deslocamento / 2) * interval '1 minute') AS occ_end
  FROM existing
)
SELECT
  e.ord_id,
  e.vei_id,
  e.ord_responsavel,
  e.ord_data,
  e.ord_hora,
  e.cid_id,
  e.cid_deslocamento,
  e.start_ts, e.end_ts,
  e.occ_start, e.occ_end
FROM existing_occ e
CROSS JOIN new_occ n
WHERE e.occ_start < n.occ_end
  AND n.occ_start < e.occ_end
ORDER BY e.start_ts;
`

const sql_disponibilidade = `
WITH params AS (
  SELECT
    $1::date      AS de,
    $2::date      AS ate,
    COALESCE($3, ${DEFAULT_DURATION_MIN})::int AS dur_min,
    COALESCE($4, ${DEFAULT_STEP_MIN})::int     AS step_min,
    $5::bigint    AS p_vei_id
),
-- veículos ativos (todos ou 1)
veiculos AS (
  SELECT v.vei_id, v.vei_placa, v.vei_modelo, v.vei_marca
  FROM t_veiculo v, params p
  WHERE COALESCE(v.vei_ativo, 'S') = 'S'
    AND (p.p_vei_id IS NULL OR v.vei_id = p.p_vei_id)
),
-- janela global de consulta em timestamp
janela AS (
  SELECT
    (de)::timestamp                         AS ts_ini,
    (ate + INTERVAL '1 day' - INTERVAL '1 second') AS ts_fim
  FROM params
),
-- OS existentes (não canceladas) dos veículos na janela +/- 1 dia (otimização)
os_raw AS (
  SELECT
    o.ord_id,
    o.vei_id,
    o.ord_responsavel,
    o.end_id,
    o.ord_data,
    o.ord_hora,
    COALESCE(o.ord_duracao_min, (SELECT dur_min FROM params)) AS dur_min,
    e.cid_id,
    c.cid_deslocamento,
    s.stt_nome
  FROM t_ordem o
  JOIN veiculos v ON v.vei_id = o.vei_id
  JOIN t_endercli e ON e.end_id = o.end_id
  JOIN t_cidade   c ON c.cid_id = e.cid_id
  JOIN t_status   s ON s.stt_id = o.stt_id
  JOIN params     p ON TRUE
  WHERE UPPER(COALESCE(s.stt_nome,'')) <> 'CANCELADA'
    AND o.ord_data BETWEEN (p.de - INTERVAL '1 day')::date
                       AND (p.ate + INTERVAL '1 day')::date
),
-- transforma OS em intervalos ocupados com logística (estende antes/depois)
occ AS (
  SELECT
    r.vei_id,
    (r.ord_data::timestamp
       + make_interval(hours => split_part(r.ord_hora,':',1)::int,
                       mins  => split_part(r.ord_hora,':',2)::int)
       - ((r.cid_deslocamento / 2) * INTERVAL '1 minute')) AS occ_start,
    (r.ord_data::timestamp
       + make_interval(hours => split_part(r.ord_hora,':',1)::int,
                       mins  => split_part(r.ord_hora,':',2)::int)
       + (r.dur_min * INTERVAL '1 minute')
       + ((r.cid_deslocamento / 2) * INTERVAL '1 minute')) AS occ_end
  FROM os_raw r
),
-- mescla sobreposições por veículo (interval merging)
occ_ord AS (
  SELECT
    o.vei_id,
    o.occ_start,
    o.occ_end,
    CASE
      WHEN o.occ_start <= LAG(o.occ_end) OVER (PARTITION BY o.vei_id ORDER BY o.occ_start)
      THEN 0 ELSE 1
    END AS is_new
  FROM occ o
  ORDER BY o.vei_id, o.occ_start
),
occ_grp AS (
  SELECT
    vei_id, occ_start, occ_end,
    SUM(is_new) OVER (PARTITION BY vei_id ORDER BY occ_start
                      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS grp
  FROM occ_ord
),
occ_merged AS (
  SELECT
    vei_id,
    MIN(occ_start) AS occ_start,
    MAX(occ_end)   AS occ_end
  FROM occ_grp
  GROUP BY vei_id, grp
),
-- grade de candidatos por dia/hora no período (step_min)
grid AS (
  SELECT
    v.vei_id,
    gs AS start_ts
  FROM veiculos v
  CROSS JOIN janela j
  CROSS JOIN params p
  CROSS JOIN LATERAL generate_series(j.ts_ini, j.ts_fim, (p.step_min || ' minutes')::interval) AS gs
),
-- aplica regras de trabalho: seg–sáb 07–18; exclui domingo
grid_work AS (
  SELECT
    g.vei_id,
    g.start_ts,
    (g.start_ts + (SELECT (dur_min || ' minutes')::interval FROM params)) AS end_ts
  FROM grid g
  JOIN params p ON TRUE
  WHERE
    EXTRACT(DOW FROM g.start_ts)::int BETWEEN 1 AND 6 -- seg(1)..sáb(6)
    AND to_char(g.start_ts, 'HH24:MI') >= '07:00'
    AND (g.start_ts + (p.dur_min || ' minutes')::interval)
        <= date_trunc('day', g.start_ts) + INTERVAL '18 hour'
    -- NÃO permitir sobreposição com o intervalo de almoço 11:30–13:30
    AND NOT (
      (g.start_ts <  date_trunc('day', g.start_ts) + INTERVAL '13 hour 30 min')
      AND (g.start_ts + (p.dur_min || ' minutes')::interval >
           date_trunc('day', g.start_ts) + INTERVAL '11 hour 30 min')
    )
),
-- remove candidatos que colidem com ocupação
grid_free AS (
  SELECT gw.vei_id, gw.start_ts, gw.end_ts
  FROM grid_work gw
  LEFT JOIN occ_merged o
    ON o.vei_id = gw.vei_id
   AND gw.start_ts < o.occ_end
   AND gw.end_ts   > o.occ_start
  WHERE o.vei_id IS NULL
)
SELECT
  v.vei_id,
  v.vei_placa,
  v.vei_modelo,
  v.vei_marca,
  gw.start_ts::timestamp AS inicio,
  gw.end_ts::timestamp   AS fim
FROM grid_free gw
JOIN veiculos v ON v.vei_id = gw.vei_id
ORDER BY v.vei_id, gw.start_ts;
`

const getConflitosAgendamento = async (params) => {
  try {
    const {
      ord_id = null,
      vei_id = null,
      ord_responsavel = null,
      end_id,
      ord_data,
      ord_hora,
      ord_duracao_min
    } = params || {}

    if (!end_id || !ord_data || !ord_hora) {
      throw { status: 400, message: 'Campos obrigatórios: end_id, ord_data, ord_hora.' }
    }

    const dur = Number.isFinite(ord_duracao_min) ? ord_duracao_min : DEFAULT_DURATION_MIN

    const binds = [ord_id, vei_id, ord_responsavel, end_id, ord_data, ord_hora, dur]

    const result = await db.query(sql_findConflicts, binds)
    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao validar agenda: ' + err.message }
  }
}

const validarAgendamento = async (params) => {
  try {
    const { total, items } = await getConflitosAgendamento(params)
    if (total > 0) {
      return {
        ok: false,
        total,
        conflitos: items,
        message: 'Conflito de agenda detectado (veículo e/ou responsável). Verifique a disponibilidade.'
      }
    }
    return { ok: true, message: 'Agenda disponível.' }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao validar agenda: ' + err.message }
  }
}

const AgendamentoLivre = async (params) => {
  const r = await validarAgendamento(params)
  if (!r.ok) {
    throw { status: 409, message: r.message, detalhes: r.conflitos }
  }
  return r
}

const getDisponibilidadeVeiculos = async (params) => {
  try {
    const {
      de,
      ate,
      duracao_min = DEFAULT_DURATION_MIN,
      step_min = DEFAULT_STEP_MIN
    } = params || {}

    if (!de || !ate) {
      throw { status: 400, message: 'Campos obrigatórios: de, ate.' }
    }

    const binds = [de, ate, duracao_min, step_min, null]
    const result = await db.query(sql_disponibilidade, binds)

    return { total: result.rows.length, items: result.rows }
  } catch (err) {
    if (err.status && err.message) throw err
    throw { status: 500, message: 'Erro ao consultar disponibilidade: ' + err.message }
  }
}

module.exports = {
  DEFAULT_DURATION_MIN,
  getConflitosAgendamento,
  validarAgendamento,
  AgendamentoLivre,
  getDisponibilidadeVeiculos
}

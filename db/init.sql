CREATE TABLE IF NOT EXISTS T_USUARIO (
  USU_ID           BIGSERIAL PRIMARY KEY,
  USU_email        TEXT UNIQUE NOT NULL,
  USU_nome         TEXT NOT NULL,
  USU_hash         TEXT NOT NULL,
  USU_SALT         TEXT NOT NULL,
  USU_ATIVO        BOOLEAN NOT NULL DEFAULT TRUE,
  USU_CRIACAO      DATE NOT NULL DEFAULT now(),
  USU_ALTERACAO    DATE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS T_VEICULO (
    VEI_ID      BIGSERIAL  PRIMARY KEY,
    VEI_PLACA   VARCHAR(10),
    VEI_MODELO  VARCHAR(100),
    VEI_MARCA   VARCHAR(100),
    VEI_ANO     INTEGER,
    VEI_ATIVO   VARCHAR(1) DEFAULT 'S'
);

CREATE TABLE IF NOT EXISTS T_USURESPONSAVEL (
    USU_ID       BIGSERIAL  PRIMARY KEY,
    USU_NOME     VARCHAR(100),
    USU_ATIVO    VARCHAR(1) DEFAULT 'S'
);

CREATE TABLE IF NOT EXISTS T_UF (
   UF_ID      BIGSERIAL  PRIMARY KEY,
   UF_NOME    VARCHAR(100),
   UF_SIGLA   VARCHAR(10)  
);

CREATE TABLE IF NOT EXISTS T_CIDADE (
   CID_ID      BIGSERIAL  PRIMARY KEY,
   CID_NOME    VARCHAR(100),
   CID_DESLOCAMENTO DECIMAL(10,2),
   UF_ID       BIGINT NOT NULL,
   CONSTRAINT FK_CIDADE_UF 
        FOREIGN KEY (UF_ID) REFERENCES T_UF (UF_ID)
);

CREATE TABLE IF NOT EXISTS T_CLIENTE (
    CLI_ID     BIGSERIAL  PRIMARY KEY,
    CLI_CNPJ   VARCHAR(20),
    CLI_NOME   VARCHAR(100),
    CLI_DDI    VARCHAR(5), 
    CLI_DDD    VARCHAR(5),
    CLI_FONE   VARCHAR(10),
    CLI_ATIVO  VARCHAR(1) DEFAULT 'S'
);

CREATE TABLE IF NOT EXISTS T_ENDERCLI (
    END_ID         BIGSERIAL  PRIMARY KEY,
    CLI_ID         BIGINT NOT NULL,
    CID_ID         BIGINT NOT NULL, 
    CLI_BAIRRO     VARCHAR(100),
    CLI_LOGRADOURO VARCHAR(100),
    CLI_CEP        VARCHAR(10), 	
    CLI_NUMERO     INTEGER,
    CLI_ENDERECO   VARCHAR(100),
    CLI_ATIVO      VARCHAR(1) DEFAULT 'S',
    CONSTRAINT FK_ENDERCLI_CLIENTE 
        FOREIGN KEY (CLI_ID) REFERENCES T_CLIENTE (CLI_ID),
    CONSTRAINT FK_ENDERCLI_CIDADE
        FOREIGN KEY (CID_ID) REFERENCES T_CIDADE (CID_ID)
);

CREATE TABLE IF NOT EXISTS T_STATUS (
   STT_ID BIGSERIAL PRIMARY KEY, 
   STT_NOME VARCHAR(100), 
   STT_COR VARCHAR(20) 
);

CREATE TABLE IF NOT EXISTS T_ORDEM (
    ORD_ID          BIGSERIAL  PRIMARY KEY,
    CLI_ID          BIGINT NOT NULL,
    END_ID          BIGINT NOT NULL,
    STT_ID          BIGINT NOT NULL,
    ORD_OBSERVACAO  VARCHAR(500),
    ORD_DATA        DATE,
    ORD_HORA        VARCHAR(10),
    ORD_RESPONSAVEL BIGINT,
    VEI_ID          BIGINT,
    ord_duracao_min INTEGER DEFAULT 60,

    CONSTRAINT FK_ORDEM_CLIENTE 
        FOREIGN KEY (CLI_ID) REFERENCES T_CLIENTE (CLI_ID),
    CONSTRAINT FK_ORDEM_ENDERCLI 
        FOREIGN KEY (END_ID) REFERENCES T_ENDERCLI (END_ID),
    CONSTRAINT FK_ORDEM_RESPONSAVEL 
        FOREIGN KEY (ORD_RESPONSAVEL) REFERENCES T_USURESPONSAVEL (USU_ID),
    CONSTRAINT FK_ORDEM_STATUS
        FOREIGN KEY (STT_ID) REFERENCES T_STATUS (STT_ID),    
    CONSTRAINT FK_ORDEM_VEICULO
        FOREIGN KEY (VEI_ID) REFERENCES T_VEICULO (VEI_ID)   
);

CREATE TABLE IF NOT EXISTS T_FORMAPAG (
    FPG_ID BIGSERIAL PRIMARY KEY,
    FPG_NOME VARCHAR(100),
    FPG_ATIVO VARCHAR(1) DEFAULT 'S',
    FPG_PARCELADO VARCHAR(1) DEFAULT 'N'
);

CREATE TABLE IF NOT EXISTS T_ORDPAG (
    OPG_ID BIGSERIAL PRIMARY KEY,
    ORD_ID BIGINT NOT NULL,
    FPG_ID BIGINT NOT NULL,
    OPG_VALOR DECIMAL(10,2),
    OPG_PARCELA INTEGER,
    OPG_VENCIMENTO DATE,
    OPG_PAGO VARCHAR(1) DEFAULT 'N',
    
    CONSTRAINT FK_ORDPAG_ORDEM 
        FOREIGN KEY (ORD_ID) REFERENCES T_ORDEM (ORD_ID),
    CONSTRAINT FK_ORDPAG_FORMAPAG 
        FOREIGN KEY (FPG_ID) REFERENCES T_FORMAPAG (FPG_ID)
);

CREATE INDEX IF NOT EXISTS idx_ordem_vei_data
  ON t_ordem (vei_id, ord_data);
CREATE INDEX IF NOT EXISTS idx_ordem_resp_data
  ON t_ordem (ord_responsavel, ord_data);

CREATE INDEX IF NOT EXISTS idx_endercli_end
  ON t_endercli (end_id);
CREATE INDEX IF NOT EXISTS idx_endercli_cid
  ON t_endercli (cid_id);


CREATE TABLE IF NOT EXISTS t_tipolocal (
  tpl_id           BIGSERIAL PRIMARY KEY,
  tpl_nome         VARCHAR(80) NOT NULL,
  tpl_valor        NUMERIC(12,2),                -- pode ser NULL (ex.: "Outro")
  tpl_ativo        CHAR(1)    NOT NULL DEFAULT 'S'
);

INSERT INTO t_tipolocal (tpl_nome, tpl_valor, tpl_ativo) VALUES
  ('Casa',               250.00, 'S'),
  ('Prédio residencial', 650.00, 'S'),
  ('Prédio comercial',   850.00, 'S'),
  ('Prédio industrial', 1200.00, 'S'),
  ('Outro',                NULL, 'S');

INSERT INTO T_VEICULO (VEI_PLACA, VEI_MODELO, VEI_MARCA, VEI_ANO, VEI_ATIVO) VALUES
('MBZ5H21', 'L-1620',                 'Mercedes-Benz', 2012, 'S'),
('FOR2C90', 'Cargo 2429',             'Ford',          2017, 'S'),
('VLV9K33', 'FH 540 6x4',             'Volvo',         2022, 'S'),
('SCN7J18', 'R 440 6x2',              'Scania',        2018, 'S'), 
('VWG3M84', 'Constellation 24.280',   'Volkswagen',    2021, 'S'); 

INSERT INTO T_USURESPONSAVEL (USU_NOME) VALUES
('Rafael Costa'),
('Mariana Rocha'),
('Gabriel Nogueira'),
('Leticia Barbosa'),
('Paulo Azevedo');

INSERT INTO T_FORMAPAG (FPG_NOME, FPG_PARCELADO) VALUES 
('DINHEIRO', 'N'), 
('CARTÃO DÉBITO', 'N'), 
('CARTÃO CRÉDITO', 'S'), 
('PIX', 'N'),
('BOLETO', 'N');

INSERT INTO T_STATUS (STT_NOME, STT_COR) VALUES 
('ABERTA', 'blue'), 
('EM ANDAMENTO', 'orange'), 
('FINALIZADA', 'green'), 
('CANCELADA', 'red'), 
('AGUARDANDO APROVAÇÃO', 'gray');

INSERT INTO T_UF (UF_NOME, UF_SIGLA) VALUES 
('Acre', 'AC'),
('Alagoas', 'AL'),
('Amapá', 'AP'),
('Amazonas', 'AM'),
('Bahia', 'BA'),
('Ceará', 'CE'),
('Distrito Federal', 'DF'),
('Espírito Santo', 'ES'),
('Goiás', 'GO'),
('Maranhão', 'MA'),
('Mato Grosso', 'MT'),
('Mato Grosso do Sul', 'MS'),
('Minas Gerais', 'MG'),
('Pará', 'PA'),
('Paraíba', 'PB'),
('Paraná', 'PR'),
('Pernambuco', 'PE'),
('Piauí', 'PI'),
('Rio de Janeiro', 'RJ'),
('Rio Grande do Norte', 'RN'),
('Rio Grande do Sul', 'RS'),
('Rondônia', 'RO'),
('Roraima', 'RR'),
('Santa Catarina', 'SC'),
('São Paulo', 'SP'),
('Sergipe', 'SE'),
('Tocantins', 'TO');

INSERT INTO T_CIDADE (CID_NOME, CID_DESLOCAMENTO, UF_ID) VALUES
('Chapecó',                55.00, 24),
('Pinhalzinho',            5.00, 24),
('São Miguel do Oeste',    70.00, 24),
('Xanxerê',                78.00, 24),
('Maravilha',              30.00, 24),
('Palmitos',               66.00, 24),
('São Carlos',             47.00, 24),
('Quilombo',               75.00, 24),
('Modelo',                 18.00, 24),
('Saudades',               15.00, 24),
('Nova Erechim',           13.00, 24),
('Nova Itaberaba',         27.00, 24),
('Jardinópolis',           50.00, 24),
('Serra Alta',             27.00, 24),
('Coronel Freitas',        54.00, 24),
('Cordilheira Alta',       49.00, 24),
('Caxambu do Sul',         92.00, 24),
('Águas Frias',            19.00, 24),
('Bom Jesus do Oeste',     38.00, 24),
('Caibi',                  58.00, 24),
('Iraceminha',             43.00, 24),
('Tigrinhos',              44.00, 24),
('Saltinho',               44.00, 24),
('São Miguel da Boa Vista',47.00, 24),
('União do Oeste',         44.00, 24),
('Planalto Alegre',        76.00, 24),
('Guatambu',               65.00, 24),
('Xaxim',                  59.00, 24),
('São Lourenço do Oeste', 116.00, 24);

INSERT INTO T_CLIENTE (CLI_CNPJ, CLI_NOME, CLI_DDI, CLI_DDD, CLI_FONE) VALUES
('40516043064', 'Ana Paula Souza',           '55', '49', '999112233'),
('00407895604', 'Carlos Eduardo Lima',       '55', '49', '998776655'),
('90037914227', 'Mariana Ribeiro',           '55', '49', '999443322'),
('58376878310', 'João Pedro Almeida',        '55', '49', '984005050'),
('55125036188', 'Beatriz Martins',           '55', '49', '991234567'),
('21425579027', 'Lucas Ferreira',            '55', '49', '996789012'),
('44327776211', 'Gabriela Santos',           '55', '49', '997700889'),
('15531095000147', 'ACME Tecnologia Ltda',                   '55', '49', '33312222'),
('89117805000123', 'Comercial Blumen Vale ME',               '55', '49', '33445566'),
('85879515000166', 'Transportes Oeste Catarinense Ltda',     '55', '49', '35221100'),
('05429087000130', 'Madeireira Pinhalzinho EPP',             '55', '49', '30101010'),
('47640191000110', 'Cooperativa Agroindustrial do Oeste',    '55', '49', '33223344'),
('91638818000190', 'Hospital São Miguel S/A',                '55', '49', '35554444'),
('04366405000107', 'Mercado Bom Preço Ltda',                 '55', '49', '34990000'),
('17583004000142', 'Serviços Elétricos Chapecó SLU',         '55', '49', '33551234');


INSERT INTO T_ENDERCLI
  (CLI_ID, CID_ID, CLI_BAIRRO, CLI_LOGRADOURO, CLI_CEP, CLI_NUMERO, CLI_ENDERECO)
VALUES
(1, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Pinhalzinho'),
   'Centro', 'Rua do Comércio', '89870-000', 120, 'Rua do Comércio, 120'),
(2, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Pinhalzinho'),
   'Bela Vista', 'Rua Sete de Setembro', '89870-045', 455, 'Rua Sete de Setembro, 455'),
(3, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Pinhalzinho'),
   'São José', 'Avenida Brasília', '89870-080', 980, 'Avenida Brasília, 980'),
(4, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Pinhalzinho'),
   'São Cristóvão', 'Rua das Flores', '89870-120', 35, 'Rua das Flores, 35'),

(5, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Chapecó'),
   'Passo dos Fortes', 'Av. Getúlio Vargas', '89801-000', 2500, 'Av. Getúlio Vargas, 2500'),
(6, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Xanxerê'),
   'Centro', 'Rua Cel. Passos Maia', '89820-000', 412, 'Rua Cel. Passos Maia, 412'),
(7, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Maravilha'),
   'N. Sra. da Salete', 'Rua Ângelo Olivo', '89874-000', 88, 'Rua Ângelo Olivo, 88'),
(8, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Palmitos'),
   'Centro', 'Rua 7 de Setembro', '89887-000', 301, 'Rua 7 de Setembro, 301'),
(9, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Quilombo'),
   'Centro', 'Rua Nereu Ramos', '89850-000', 122, 'Rua Nereu Ramos, 122'),
(10, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Saudades'),
   'Centro', 'Rua do Agricultor', '89868-000', 77, 'Rua do Agricultor, 77'),
(11, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Cordilheira Alta'),
   'Centro', 'Rua Padre Anchieta', '89819-000', 56, 'Rua Padre Anchieta, 56'),
(12, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Xaxim'),
   'Alvorada', 'Av. Plínio Arlindo de Nes', '89825-000', 1900, 'Av. Plínio Arlindo de Nes, 1900'),
(13, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'Guatambu'),
   'Centro', 'Rua das Araucárias', '89817-000', 65, 'Rua das Araucárias, 65'),
(14, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'São Lourenço do Oeste'),
   'Centro', 'Av. Brasil', '89990-000', 1044, 'Av. Brasil, 1044'),
(15, (SELECT CID_ID FROM T_CIDADE WHERE CID_NOME = 'São Miguel do Oeste'),
   'Centro', 'Rua Marcílio Dias', '89900-000', 520, 'Rua Marcílio Dias, 520');

WITH bounds AS (
  SELECT (CURRENT_DATE - INTERVAL '22 day')::date AS start_day,
         45::int AS ndays
),
days AS (
  SELECT generate_series(start_day, start_day + (ndays - 1), '1 day')::date AS dia
  FROM bounds
),
-- só dias úteis + sábado (exclui domingo)
valid_days AS (
  SELECT dia
  FROM days
  WHERE EXTRACT(DOW FROM dia)::int <> 0
),
-- indexa os dias válidos (1..N)
idx_days AS (
  SELECT row_number() OVER (ORDER BY dia) AS idx, dia
  FROM valid_days
),
cnt  AS (SELECT COUNT(*)::int AS n FROM idx_days),

-- usuários
u AS (
  SELECT row_number() OVER (ORDER BY usu_id) AS idx, usu_id
  FROM t_usuresponsavel
),
cntu AS (SELECT COUNT(*)::int AS n FROM u),
-- veículos ativos
v AS (
  SELECT row_number() OVER (ORDER BY vei_id) AS idx, vei_id
  FROM t_veiculo
  WHERE COALESCE(vei_ativo, 'S') = 'S'
),
cntv AS (SELECT COUNT(*)::int AS n FROM v),
-- quantidade de OS a gerar
seq AS (SELECT generate_series(1, 100) AS n),
base AS (
  SELECT
    s.n AS seq,
    ((s.n - 1) % 15) + 1 AS cli_id,
    d.dia AS ord_data,

    -- escolhe turno (manhã/tarde) e hora/minuto válidos via LATERAL
    lpad(h.hr::text, 2, '0') || ':' || lpad(m.mm::text, 2, '0') AS ord_hora,

    -- distribuição de status (~40/25/20/10/5)
    CASE
      WHEN random() < 0.40 THEN 'ABERTA'
      WHEN random() < 0.65 THEN 'EM ANDAMENTO'
      WHEN random() < 0.85 THEN 'FINALIZADA'
      WHEN random() < 0.95 THEN 'AGUARDANDO APROVAÇÃO'
      ELSE 'CANCELADA'
    END AS stt_nome,

    (ARRAY[
      'Limpeza de fossa - hidrojato - previsão 60min.',
      'Coleta e transporte de efluente - ETE municipal.',
      'Desentupimento - risco biológico - EPI completo.',
      'Inspeção preventiva - sem não-conformidades.',
      'Reagendar visita - acesso bloqueado ao pátio.'
    ])[ceil(random()*5)] AS ord_observacao,

    u.usu_id,              -- responsável
    v.vei_id,              -- veículo
    60 AS ord_duracao_min
  FROM seq s
  CROSS JOIN cnt  c
  JOIN idx_days d
    ON d.idx = ((s.n - 1) % c.n) + 1
  CROSS JOIN cntu cu
  JOIN u
    ON u.idx = ((s.n - 1) % cu.n) + 1
  CROSS JOIN cntv cv
  JOIN v
    ON v.idx = ((s.n - 1) % cv.n) + 1
  CROSS JOIN LATERAL (
    SELECT CASE WHEN random() < 0.5 THEN 'M' ELSE 'T' END AS turno
  ) t
  CROSS JOIN LATERAL (
    SELECT CASE
             WHEN t.turno = 'M' THEN (7  + floor(random()*4))::int   -- 7..10
             ELSE                 (13 + floor(random()*5))::int   -- 13..17
           END AS hr
  ) h
  CROSS JOIN LATERAL (
    SELECT CASE
             -- manhã: última hora (10) só até :30 para não cruzar 11:30
             WHEN t.turno = 'M' AND h.hr = 10
               THEN (ARRAY[0,10,15,20,30])[ceil(random()*5)]
             -- tarde: primeira hora (13) a partir de :30 (não cair antes de 13:30)
             WHEN t.turno = 'T' AND h.hr = 13
               THEN (ARRAY[30,40,45,50])[ceil(random()*4)]
             -- tarde: última hora (17) apenas :00 (para terminar 18:00)
             WHEN t.turno = 'T' AND h.hr = 17
               THEN 0
             -- demais casos: minutos padrão
             ELSE (ARRAY[0,10,15,20,30,40,45,50])[ceil(random()*8)]
           END::int AS mm
  ) m
)
INSERT INTO t_ordem
  (cli_id, end_id, stt_id, ord_responsavel, vei_id, ord_observacao, ord_data, ord_hora, ord_duracao_min)
SELECT
  b.cli_id,
  (SELECT e.end_id
     FROM t_endercli e
    WHERE e.cli_id = b.cli_id
    ORDER BY e.end_id
    LIMIT 1),
  s.stt_id,
  b.usu_id,
  b.vei_id,
  b.ord_observacao,
  b.ord_data,
  b.ord_hora,
  b.ord_duracao_min
FROM base b
JOIN t_status s ON s.stt_nome = b.stt_nome;


WITH ords AS (
  SELECT
    o.ord_id,
    o.ord_data,
    e.cid_id,
    c.cid_deslocamento,
    s.stt_nome
  FROM t_ordem o
  JOIN t_endercli e ON e.end_id = o.end_id
  JOIN t_cidade   c ON c.cid_id = e.cid_id
  JOIN t_status   s ON s.stt_id = o.stt_id
  WHERE NOT EXISTS (SELECT 1 FROM t_ordpag op WHERE op.ord_id = o.ord_id)
    AND s.stt_nome <> 'CANCELADA'
),
choices AS (
  SELECT
    o.*,
    (ARRAY['DINHEIRO','CARTÃO DÉBITO','CARTÃO CRÉDITO','PIX','BOLETO'])[ceil(random()*5)] AS fpg_nome,
    ROUND( (120 + (cid_deslocamento * (0.8 + random()*1.2)) + (random()*200))::numeric, 2 ) AS total_valor,
    (floor(random()*26)::int - 5) AS venc_offset
  FROM ords o
),
base AS (
  SELECT
    ch.*,
    f.fpg_id,
    f.fpg_parcelado,
    CASE WHEN f.fpg_parcelado = 'S' THEN (2 + floor(random()*2))::int ELSE 1 END AS nparc
  FROM choices ch
  JOIN t_formapag f ON f.fpg_nome = ch.fpg_nome
),
parts AS (
  SELECT
    b.ord_id,
    b.fpg_id,
    b.total_valor,
    b.fpg_parcelado,
    b.nparc,
    gs AS parcela,
    CASE
      WHEN b.nparc = 1 THEN b.total_valor
      WHEN gs < b.nparc THEN ROUND( (b.total_valor / b.nparc)::numeric, 2)
      ELSE b.total_valor - ROUND( (b.total_valor / b.nparc)::numeric, 2) * (b.nparc - 1)
    END AS parcela_valor,
    (b.ord_data + (b.venc_offset * INTERVAL '1 day') + ((gs - 1) * INTERVAL '10 day'))::date AS vencimento
  FROM base b
  CROSS JOIN LATERAL generate_series(1, b.nparc) AS gs
)
INSERT INTO t_ordpag (ord_id, fpg_id, opg_valor, opg_parcela, opg_vencimento, opg_pago)
SELECT
  p.ord_id,
  p.fpg_id,
  p.parcela_valor,
  p.parcela,
  p.vencimento,
  CASE
    WHEN p.vencimento < CURRENT_DATE - 2 THEN (CASE WHEN random() < 0.70 THEN 'S' ELSE 'N' END)
    WHEN p.vencimento <= CURRENT_DATE + 2 THEN (CASE WHEN random() < 0.40 THEN 'S' ELSE 'N' END)
    ELSE 'N'
  END AS opg_pago
FROM parts p
ORDER BY p.ord_id, p.parcela;
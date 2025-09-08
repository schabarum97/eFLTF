CREATE TABLE IF NOT EXISTS T_USUARIO (
    USU_ID       BIGSERIAL  PRIMARY KEY,
    USU_LOGIN    VARCHAR(100),
    USU_NOME     VARCHAR(100),
    USU_EMAIL    VARCHAR(100),
    USU_SENHA    VARCHAR(1000)
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
    
    CONSTRAINT FK_ORDEM_CLIENTE 
        FOREIGN KEY (CLI_ID) REFERENCES T_CLIENTE (CLI_ID),
    CONSTRAINT FK_ORDEM_ENDERCLI 
        FOREIGN KEY (END_ID) REFERENCES T_ENDERCLI (END_ID),
    CONSTRAINT FK_ORDEM_USUARIO 
        FOREIGN KEY (ORD_RESPONSAVEL) REFERENCES T_USUARIO (USU_ID),
    CONSTRAINT FK_ORDEM_STATUS
        FOREIGN KEY (STT_ID) REFERENCES T_STATUS (STT_ID)    
);

INSERT INTO T_STATUS (STT_NOME, STT_COR) VALUES 
('ABERTA', 'blue'), 
('EM ANDAMENTO', 'orange'), 
('FINALIZADA', 'green'), 
('CANCELADA', 'red');

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

WITH base AS (
  SELECT
    n AS seq,
    ((n - 1) % 15) + 1 AS cli_id,  -- gira entre 1..15
    (ARRAY['ABERTA','EM ANDAMENTO','FINALIZADA','CANCELADA'])[((n - 1) % 4) + 1] AS stt_nome,
    DATE '2025-08-18' + ((n - 1) / 5) AS ord_data, -- 5 ordens por dia: 18..31/08
    (ARRAY['08:10','09:20','10:40','13:00','15:45'])[((n - 1) % 5) + 1] AS ord_hora,
    (ARRAY[
      'Limpeza de fossa - volume 1.5 m3 - tampa 50 cm - distancia 15 m - mangote 2 pol - EPI ok - descarte em ETE.',
      'Limpeza de fossa - hidrojato leve - lodo espesso - previsao 60 min.',
      'Limpeza de fossa - finalizado - lavagem do poco - entorno limpo.',
      'Limpeza de fossa - cancelada por acesso bloqueado - reagendar.',
      'Limpeza de fossa - agendado - revisar vedacao apos servico.'
    ])[((n - 1) % 5) + 1] AS ord_observacao
  FROM generate_series(1, 70) AS t(n)
)
INSERT INTO T_ORDEM (CLI_ID, END_ID, STT_ID, ORD_OBSERVACAO, ORD_DATA, ORD_HORA)
SELECT
  b.cli_id,
  (SELECT end_id FROM T_ENDERCLI e WHERE e.cli_id = b.cli_id LIMIT 1) AS end_id,
  s.stt_id,
  b.ord_observacao,
  b.ord_data,
  b.ord_hora
FROM base b
JOIN T_STATUS s ON s.stt_nome = b.stt_nome;
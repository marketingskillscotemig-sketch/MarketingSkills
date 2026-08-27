USE market_skills;


-- =========================================================
-- PROCEDURE 01
-- BUSCA AVANÇADA DE VAGAS
-- =========================================================

DROP PROCEDURE IF EXISTS sp_buscar_vagas_avancado;

DELIMITER $$

CREATE PROCEDURE sp_buscar_vagas_avancado(
    IN p_texto VARCHAR(180),
    IN p_nivel VARCHAR(30),
    IN p_modalidade VARCHAR(30),
    IN p_localizacao VARCHAR(150),
    IN p_habilidade_id INT
)
BEGIN
    SELECT DISTINCT
        v.id,
        v.empresa_id,
        e.nome AS empresa_nome,
        v.titulo,
        v.descricao,
        v.nivel_experiencia,
        v.modalidade,
        v.localizacao,
        v.salario_minimo,
        v.salario_maximo,
        v.data_publicacao,
        v.status,
        v.beneficios
    FROM vagas v

    INNER JOIN empresas e
        ON e.id = v.empresa_id

    LEFT JOIN requisitos_vaga rv
        ON rv.vaga_id = v.id

    LEFT JOIN habilidades h
        ON h.id = rv.habilidade_id

    WHERE
        v.status = 'ativa'

        AND (
            p_texto IS NULL
            OR p_texto = ''
            OR LOWER(v.titulo)
                LIKE CONCAT(
                    '%',
                    LOWER(p_texto),
                    '%'
                )
            OR LOWER(v.descricao)
                LIKE CONCAT(
                    '%',
                    LOWER(p_texto),
                    '%'
                )
            OR LOWER(e.nome)
                LIKE CONCAT(
                    '%',
                    LOWER(p_texto),
                    '%'
                )
            OR LOWER(h.nome)
                LIKE CONCAT(
                    '%',
                    LOWER(p_texto),
                    '%'
                )
        )

        AND (
            p_nivel IS NULL
            OR p_nivel = ''
            OR v.nivel_experiencia = p_nivel
        )

        AND (
            p_modalidade IS NULL
            OR p_modalidade = ''
            OR v.modalidade = p_modalidade
        )

        AND (
            p_localizacao IS NULL
            OR p_localizacao = ''
            OR LOWER(v.localizacao)
                LIKE CONCAT(
                    '%',
                    LOWER(p_localizacao),
                    '%'
                )
        )

        AND (
            p_habilidade_id IS NULL
            OR p_habilidade_id = 0
            OR rv.habilidade_id =
                p_habilidade_id
        )

    ORDER BY
        v.data_publicacao DESC,
        v.id DESC;
END$$

DELIMITER ;


-- =========================================================
-- PROCEDURE 02
-- RANKING DE TALENTOS POR VAGA
-- =========================================================

DROP PROCEDURE IF EXISTS sp_ranking_talentos_por_vaga;

DELIMITER $$

CREATE PROCEDURE sp_ranking_talentos_por_vaga(
    IN p_vaga_id INT
)
BEGIN
    SELECT
        pp.id AS perfil_id,
        u.id AS usuario_id,
        u.nome,
        u.email,

        COUNT(rv.id) AS requisitos_totais,

        SUM(
            CASE
                WHEN
                    ph.id IS NOT NULL
                    AND
                    CASE ph.nivel_dominio
                        WHEN 'basico' THEN 1
                        WHEN 'intermediario' THEN 2
                        WHEN 'avancado' THEN 3
                        ELSE 0
                    END
                    >=
                    CASE rv.nivel_exigido
                        WHEN 'basico' THEN 1
                        WHEN 'intermediario' THEN 2
                        WHEN 'avancado' THEN 3
                        ELSE 0
                    END
                THEN 1
                ELSE 0
            END
        ) AS requisitos_atendidos,

        CASE
            WHEN
                COALESCE(
                    SUM(
                        COALESCE(
                            rv.peso,
                            CASE
                                WHEN rv.obrigatorio = 1
                                    THEN 2
                                ELSE 1
                            END
                        )
                    ),
                    0
                ) = 0
            THEN 0

            ELSE ROUND(
                (
                    SUM(
                        CASE
                            WHEN
                                ph.id IS NOT NULL
                                AND
                                CASE ph.nivel_dominio
                                    WHEN 'basico' THEN 1
                                    WHEN 'intermediario' THEN 2
                                    WHEN 'avancado' THEN 3
                                    ELSE 0
                                END
                                >=
                                CASE rv.nivel_exigido
                                    WHEN 'basico' THEN 1
                                    WHEN 'intermediario' THEN 2
                                    WHEN 'avancado' THEN 3
                                    ELSE 0
                                END
                            THEN
                                COALESCE(
                                    rv.peso,
                                    CASE
                                        WHEN rv.obrigatorio = 1
                                            THEN 2
                                        ELSE 1
                                    END
                                )
                            ELSE 0
                        END
                    )
                    /
                    SUM(
                        COALESCE(
                            rv.peso,
                            CASE
                                WHEN rv.obrigatorio = 1
                                    THEN 2
                                ELSE 1
                            END
                        )
                    )
                ) * 100
            )
        END AS percentual_match

    FROM perfis_profissionais pp

    INNER JOIN usuarios u
        ON u.id = pp.usuario_id

    LEFT JOIN requisitos_vaga rv
        ON rv.vaga_id = p_vaga_id

    LEFT JOIN perfil_habilidades ph
        ON ph.perfil_profissional_id = pp.id
        AND ph.habilidade_id = rv.habilidade_id

    WHERE
        u.tipo_conta = 'estudante'
        AND u.status = 'ativo'

    GROUP BY
        pp.id,
        u.id,
        u.nome,
        u.email

    ORDER BY
        percentual_match DESC,
        requisitos_atendidos DESC,
        u.nome ASC;
END$$

DELIMITER ;
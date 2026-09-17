import re


def normalizar_cnpj(cnpj):
    return re.sub(
        r"\D",
        "",
        str(cnpj),
    )


def calcular_digito_cnpj(
    numeros,
    pesos,
):
    soma = sum(
        int(numero) * peso
        for numero, peso
        in zip(
            numeros,
            pesos,
        )
    )

    resto = soma % 11

    if resto < 2:
        return 0

    return 11 - resto


def cnpj_valido(
    cnpj
):
    if not cnpj:
        return False

    if len(cnpj) != 14:
        return False

    if not cnpj.isdigit():
        return False

    if cnpj == cnpj[0] * 14:
        return False

    primeiro_digito = (
        calcular_digito_cnpj(
            cnpj[:12],
            [
                5, 4, 3, 2,
                9, 8, 7, 6,
                5, 4, 3, 2,
            ],
        )
    )

    segundo_digito = (
        calcular_digito_cnpj(
            cnpj[:12] +
            str(
                primeiro_digito
            ),
            [
                6, 5, 4, 3, 2,
                9, 8, 7, 6,
                5, 4, 3, 2,
            ],
        )
    )

    return (
        cnpj[-2:] ==
        f"{primeiro_digito}"
        f"{segundo_digito}"
    )

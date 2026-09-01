import {
    collection,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    Timestamp,
    where
} from "firebase/firestore";

import { auth, db } from "./firebase";

const movimentacoesCollection = collection(
    db,
    "movimentacoesEstoque"
);

// ==========================================
// USUÁRIO AUTENTICADO
// ==========================================

function obterUIDUsuarioAutenticado() {
    return auth.currentUser?.uid ?? null;
}

// ==========================================
// VALIDAR QUANTIDADE
// ==========================================

function validarQuantidade(quantidade) {
    const quantidadeNumerica = Number(quantidade);

    if (
        !Number.isFinite(quantidadeNumerica) ||
        quantidadeNumerica <= 0
    ) {
        throw new Error(
            "A quantidade deve ser maior que zero."
        );
    }

    return quantidadeNumerica;
}

// ==========================================
// VALIDAR CUSTO
// ==========================================

function validarCusto(custoUnitario) {
    const custoInformado =
        custoUnitario !== "" &&
        custoUnitario !== null &&
        custoUnitario !== undefined;

    if (!custoInformado) {
        return {
            informado: false,
            valor: null
        };
    }

    const custoNumerico = Number(custoUnitario);

    if (
        !Number.isFinite(custoNumerico) ||
        custoNumerico < 0
    ) {
        throw new Error(
            "O custo unitário informado é inválido."
        );
    }

    return {
        informado: true,
        valor: custoNumerico
    };
}

// ==========================================
// REGISTRAR ENTRADA
// ==========================================

export async function registrarEntradaEstoque({
    produtoId,
    quantidade,
    custoUnitario,
    observacao = "",
    origem = "entradaManual"
}) {
    if (!produtoId) {
        throw new Error(
            "Produto não informado."
        );
    }

    const quantidadeNumerica =
        validarQuantidade(quantidade);

    const custo =
        validarCusto(custoUnitario);

    const uid =
        obterUIDUsuarioAutenticado();

    if (!uid) {
        throw new Error(
            "Usuário não autenticado."
        );
    }

    const produtoReferencia =
        doc(
            db,
            "produtos",
            produtoId
        );

    const movimentacaoReferencia =
        doc(
            movimentacoesCollection
        );

    let resultado = null;

    await runTransaction(
        db,
        async (transaction) => {
            const produtoSnapshot =
                await transaction.get(
                    produtoReferencia
                );

            if (
                !produtoSnapshot.exists()
            ) {
                throw new Error(
                    "Produto não encontrado."
                );
            }

            const produto =
                produtoSnapshot.data();

            const estoqueAtual =
                Number(
                    produto.estoqueAtual ?? 0
                );

            if (
                !Number.isFinite(
                    estoqueAtual
                ) ||
                estoqueAtual < 0
            ) {
                throw new Error(
                    "O estoque atual do produto é inválido."
                );
            }

            const estoqueMaximo =
                Number(
                    produto.estoqueMaximo ?? 0
                );

            if (
                !Number.isFinite(
                    estoqueMaximo
                ) ||
                estoqueMaximo < 0
            ) {
                throw new Error(
                    "O estoque máximo do produto é inválido."
                );
            }

            const novoEstoque =
                estoqueAtual +
                quantidadeNumerica;

            if (
                estoqueMaximo > 0 &&
                novoEstoque >
                    estoqueMaximo
            ) {
                throw new Error(
                    `Estoque máximo ultrapassado. Estoque atual: ${estoqueAtual} ${produto.unidade ?? "UN"}. Limite máximo: ${estoqueMaximo} ${produto.unidade ?? "UN"}.`
                );
            }

            const custoAtualAnterior =
                Number(
                    produto.custoAtual ?? 0
                );

            const dadosAtualizacao = {
                estoqueAtual:
                    novoEstoque,

                atualizadoEm:
                    serverTimestamp(),

                atualizadoPor:
                    uid,

                ultimaMovimentacaoId:
                    movimentacaoReferencia.id
            };

            if (custo.informado) {
                dadosAtualizacao.custoAtual =
                    custo.valor;
            }

            transaction.update(
                produtoReferencia,
                dadosAtualizacao
            );

            transaction.set(
                movimentacaoReferencia,
                {
                    produtoId,

                    produtoCodigo:
                        produto.codigo ?? "",

                    produtoNome:
                        produto.nome ?? "",

                    unidade:
                        produto.unidade ?? "UN",

                    tipo: "entrada",

                    origem,

                    quantidade:
                        quantidadeNumerica,

                    estoqueAnterior:
                        estoqueAtual,

                    estoquePosterior:
                        novoEstoque,

                    custoUnitario:
                        custo.informado
                            ? custo.valor
                            : null,

                    observacao:
                        String(
                            observacao ?? ""
                        ).trim(),

                    movimentadoEm:
                        serverTimestamp(),

                    criadoEm:
                        serverTimestamp(),

                    criadoPor:
                        uid
                }
            );

            resultado = {
                id:
                    movimentacaoReferencia.id,

                produtoId,

                estoqueAnterior:
                    estoqueAtual,

                estoquePosterior:
                    novoEstoque,

                quantidade:
                    quantidadeNumerica,

                custoAtual:
                    custo.informado
                        ? custo.valor
                        : (
                            Number.isFinite(
                                custoAtualAnterior
                            )
                                ? custoAtualAnterior
                                : null
                        )
            };
        }
    );

    return resultado;
}

// ==========================================
// REGISTRAR SAÍDA
// ==========================================

export async function registrarSaidaEstoque({
    produtoId,
    quantidade,
    observacao = "",
    origem = "outros"
}) {
    if (!produtoId) {
        throw new Error(
            "Produto não informado."
        );
    }

    const quantidadeNumerica =
        validarQuantidade(
            quantidade
        );

    const uid =
        obterUIDUsuarioAutenticado();

    if (!uid) {
        throw new Error(
            "Usuário não autenticado."
        );
    }

    const produtoReferencia =
        doc(
            db,
            "produtos",
            produtoId
        );

    const movimentacaoReferencia =
        doc(
            movimentacoesCollection
        );

    let resultado = null;

    await runTransaction(
        db,
        async (transaction) => {
            const produtoSnapshot =
                await transaction.get(
                    produtoReferencia
                );

            if (
                !produtoSnapshot.exists()
            ) {
                throw new Error(
                    "Produto não encontrado."
                );
            }

            const produto =
                produtoSnapshot.data();

            const estoqueAtual =
                Number(
                    produto.estoqueAtual ?? 0
                );

            if (
                !Number.isFinite(
                    estoqueAtual
                ) ||
                estoqueAtual < 0
            ) {
                throw new Error(
                    "O estoque atual do produto é inválido."
                );
            }

            if (
                quantidadeNumerica >
                estoqueAtual
            ) {
                throw new Error(
                    `Estoque insuficiente. Disponível: ${estoqueAtual} ${produto.unidade ?? "UN"}.`
                );
            }

            const novoEstoque =
                estoqueAtual -
                quantidadeNumerica;

            const custoAtual =
                Number(
                    produto.custoAtual ?? 0
                );

            transaction.update(
                produtoReferencia,
                {
                    estoqueAtual:
                        novoEstoque,

                    atualizadoEm:
                        serverTimestamp(),

                    atualizadoPor:
                        uid,

                    ultimaMovimentacaoId:
                        movimentacaoReferencia.id
                }
            );

            transaction.set(
                movimentacaoReferencia,
                {
                    produtoId,

                    produtoCodigo:
                        produto.codigo ?? "",

                    produtoNome:
                        produto.nome ?? "",

                    unidade:
                        produto.unidade ?? "UN",

                    tipo: "saida",

                    origem,

                    quantidade:
                        quantidadeNumerica,

                    estoqueAnterior:
                        estoqueAtual,

                    estoquePosterior:
                        novoEstoque,

                    custoUnitario:
                        Number.isFinite(
                            custoAtual
                        )
                            ? custoAtual
                            : 0,

                    observacao:
                        String(
                            observacao ?? ""
                        ).trim(),

                    movimentadoEm:
                        serverTimestamp(),

                    criadoEm:
                        serverTimestamp(),

                    criadoPor:
                        uid
                }
            );

            resultado = {
                id:
                    movimentacaoReferencia.id,

                produtoId,

                estoqueAnterior:
                    estoqueAtual,

                estoquePosterior:
                    novoEstoque,

                quantidade:
                    quantidadeNumerica,

                custoAtual:
                    Number.isFinite(
                        custoAtual
                    )
                        ? custoAtual
                        : 0
            };
        }
    );

    return resultado;
}

// ==========================================
// DATA INICIAL
// ==========================================

function criarTimestampInicio(dataISO) {
    if (!dataISO) {
        return null;
    }

    const partes =
        String(dataISO).split("-");

    if (partes.length !== 3) {
        throw new Error(
            "Data inicial inválida."
        );
    }

    const ano =
        Number(partes[0]);

    const mes =
        Number(partes[1]);

    const dia =
        Number(partes[2]);

    if (
        !Number.isInteger(ano) ||
        !Number.isInteger(mes) ||
        !Number.isInteger(dia) ||
        ano < 1900 ||
        mes < 1 ||
        mes > 12 ||
        dia < 1 ||
        dia > 31
    ) {
        throw new Error(
            "Data inicial inválida."
        );
    }

    const data =
        new Date(
            ano,
            mes - 1,
            dia,
            0,
            0,
            0,
            0
        );

    if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
    ) {
        throw new Error(
            "Data inicial inválida."
        );
    }

    return Timestamp.fromDate(data);
}

// ==========================================
// DATA FINAL
// ==========================================

function criarTimestampFinal(dataISO) {
    if (!dataISO) {
        return null;
    }

    const partes =
        String(dataISO).split("-");

    if (partes.length !== 3) {
        throw new Error(
            "Data final inválida."
        );
    }

    const ano =
        Number(partes[0]);

    const mes =
        Number(partes[1]);

    const dia =
        Number(partes[2]);

    if (
        !Number.isInteger(ano) ||
        !Number.isInteger(mes) ||
        !Number.isInteger(dia) ||
        ano < 1900 ||
        mes < 1 ||
        mes > 12 ||
        dia < 1 ||
        dia > 31
    ) {
        throw new Error(
            "Data final inválida."
        );
    }

    const data =
        new Date(
            ano,
            mes - 1,
            dia,
            23,
            59,
            59,
            999
        );

    if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes - 1 ||
        data.getDate() !== dia
    ) {
        throw new Error(
            "Data final inválida."
        );
    }

    return Timestamp.fromDate(data);
}

// ==========================================
// LISTAR MOVIMENTAÇÕES
// ==========================================

export async function listarMovimentacoesEstoque({
    dataInicial = "",
    dataFinal = "",
    tipo = "todos",
    produtoId = "",
    limite = 100
} = {}) {
    const filtros = [];

    if (dataInicial) {
        const timestampInicial =
            criarTimestampInicio(
                dataInicial
            );

        filtros.push(
            where(
                "movimentadoEm",
                ">=",
                timestampInicial
            )
        );
    }

    if (dataFinal) {
        const timestampFinal =
            criarTimestampFinal(
                dataFinal
            );

        filtros.push(
            where(
                "movimentadoEm",
                "<=",
                timestampFinal
            )
        );
    }

    if (
        tipo &&
        tipo !== "todos"
    ) {
        if (
            tipo !== "entrada" &&
            tipo !== "saida"
        ) {
            throw new Error(
                "Tipo de movimentação inválido."
            );
        }

        filtros.push(
            where(
                "tipo",
                "==",
                tipo
            )
        );
    }

    if (produtoId) {
        filtros.push(
            where(
                "produtoId",
                "==",
                produtoId
            )
        );
    }

    const limiteNumerico =
        Number(limite);

    const limiteSeguro =
        Math.min(
            Math.max(
                Number.isFinite(
                    limiteNumerico
                )
                    ? Math.floor(
                        limiteNumerico
                    )
                    : 100,
                1
            ),
            500
        );

    const consulta =
        query(
            movimentacoesCollection,
            ...filtros,
            orderBy(
                "movimentadoEm",
                "desc"
            ),
            limit(
                limiteSeguro
            )
        );

    const snapshot =
        await getDocs(
            consulta
        );

    return snapshot.docs.map(
        (movimentacao) => ({
            id:
                movimentacao.id,
            ...movimentacao.data()
        })
    );
}
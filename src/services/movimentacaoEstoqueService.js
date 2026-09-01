import {
    collection,
    doc,
    runTransaction,
    serverTimestamp
} from "firebase/firestore";

import { auth, db } from "./firebase";

export const ORIGENS_MOVIMENTACAO = [
    "compra",
    "notaFiscal",
    "entradaManual",
    "devolucao",
    "ajuste",
    "outros"
];

export const TIPOS_MOVIMENTACAO = [
    "entrada",
    "saida"
];

function validarMovimentacao({ produtoId, tipo, origem, quantidade }) {
    if (!produtoId) {
        throw new Error("Informe o produto da movimentação.");
    }

    if (!TIPOS_MOVIMENTACAO.includes(tipo)) {
        throw new Error("Tipo de movimentação inválido.");
    }

    if (!ORIGENS_MOVIMENTACAO.includes(origem)) {
        throw new Error("Origem da movimentação inválida.");
    }

    if (!Number.isFinite(Number(quantidade)) || Number(quantidade) <= 0) {
        throw new Error("A quantidade deve ser maior que zero.");
    }
}

export async function registrarMovimentacao({
    produtoId,
    tipo,
    origem,
    quantidade,
    observacao = ""
}) {
    validarMovimentacao({
        produtoId,
        tipo,
        origem,
        quantidade
    });

    const uid = auth.currentUser?.uid;

    if (!uid) {
        throw new Error(
            "É necessário estar autenticado para movimentar o estoque."
        );
    }

    const quantidadeMovimentada = Number(quantidade);
    const produtoRef = doc(db, "produtos", produtoId);
    const movimentacaoRef = doc(
        collection(db, "movimentacoesEstoque")
    );

    return runTransaction(db, async (transacao) => {
        const produtoSnapshot = await transacao.get(produtoRef);

        if (!produtoSnapshot.exists()) {
            throw new Error("Produto não encontrado.");
        }

        const produto = produtoSnapshot.data();
        const estoqueAnterior = Number(produto.estoqueAtual ?? 0);
        const variacao =
            tipo === "entrada"
                ? quantidadeMovimentada
                : -quantidadeMovimentada;
        const estoquePosterior = estoqueAnterior + variacao;

        if (estoquePosterior < 0) {
            throw new Error(
                "A saída não pode deixar o estoque negativo."
            );
        }

        transacao.update(produtoRef, {
            estoqueAtual: estoquePosterior,
            ultimaMovimentacaoId: movimentacaoRef.id,
            atualizadoEm: serverTimestamp(),
            atualizadoPor: uid
        });

        transacao.set(movimentacaoRef, {
            produtoId,
            produtoCodigo: produto.codigo ?? "",
            produtoNome: produto.nome ?? "",
            tipo,
            origem,
            quantidade: quantidadeMovimentada,
            estoqueAnterior,
            estoquePosterior,
            observacao: observacao.trim(),
            movimentadoEm: serverTimestamp(),
            criadoEm: serverTimestamp(),
            criadoPor: uid
        });

        return {
            id: movimentacaoRef.id,
            estoqueAnterior,
            estoquePosterior
        };
    });
}

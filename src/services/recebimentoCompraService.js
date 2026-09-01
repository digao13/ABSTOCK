import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";

import {
    auth,
    db
} from "./firebase";

import {
    registrarEntradaEstoque
} from "./movimentacaoService";

// ======================================================
// USUÁRIO AUTENTICADO
// ======================================================

function obterUIDUsuarioAutenticado() {
    return auth.currentUser?.uid ?? null;
}

// ======================================================
// RECEBER COMPRA
// ======================================================
//
// 1. Busca a compra
// 2. Verifica se já foi recebida
// 3. Valida os itens
// 4. Registra entrada no estoque
// 5. Marca a compra como recebida
//
// ======================================================

export async function receberCompra(
    compraId
) {

    if (!compraId) {
        throw new Error(
            "O ID da compra é obrigatório."
        );
    }

    const uid =
        obterUIDUsuarioAutenticado();

    if (!uid) {
        throw new Error(
            "Usuário não autenticado."
        );
    }

    // ==================================================
    // BUSCAR COMPRA
    // ==================================================

    const referencia =
        doc(
            db,
            "compras",
            compraId
        );

    const snapshot =
        await getDoc(
            referencia
        );

    if (!snapshot.exists()) {
        throw new Error(
            "Compra não encontrada."
        );
    }

    const compra = {
        id:
            snapshot.id,

        ...snapshot.data()
    };

    // ==================================================
    // VERIFICAR SE JÁ FOI RECEBIDA
    // ==================================================

    if (
        compra.status === "recebida" ||
        compra.estoqueMovimentado === true
    ) {
        throw new Error(
            "Esta compra já foi recebida e já movimentou o estoque."
        );
    }

    // ==================================================
    // VALIDAR ITENS
    // ==================================================

    if (
        !Array.isArray(
            compra.itens
        ) ||
        compra.itens.length === 0
    ) {
        throw new Error(
            "A compra não possui itens para movimentar o estoque."
        );
    }

    // ==================================================
    // VALIDAR TODOS OS ITENS ANTES DE MOVIMENTAR
    // ==================================================
    //
    // Isso evita iniciar algumas entradas e descobrir
    // um item inválido somente no meio do processo.
    //
    // ==================================================

    for (
        const item of compra.itens
    ) {

        if (!item.produtoId) {
            throw new Error(
                `O item "${item.produtoNome || "sem nome"}" não está vinculado a um produto do estoque.`
            );
        }

        const quantidade =
            Number(
                item.quantidade
            );

        const custoUnitario =
            Number(
                item.custoUnitario
            );

        if (
            !Number.isFinite(
                quantidade
            ) ||
            quantidade <= 0
        ) {
            throw new Error(
                `Quantidade inválida no item "${item.produtoNome || item.produtoId}".`
            );
        }

        if (
            !Number.isFinite(
                custoUnitario
            ) ||
            custoUnitario < 0
        ) {
            throw new Error(
                `Custo unitário inválido no item "${item.produtoNome || item.produtoId}".`
            );
        }
    }

    // ==================================================
    // REGISTRAR ENTRADAS
    // ==================================================

    for (
        const item of compra.itens
    ) {

        await registrarEntradaEstoque({
            produtoId:
                item.produtoId,

            quantidade:
                Number(
                    item.quantidade
                ),

            custoUnitario:
                Number(
                    item.custoUnitario
                ),

            observacao:
                `Entrada referente à compra ${compraId}`,

            origem:
                "compra"
        });
    }

    // ==================================================
    // MARCAR COMPRA COMO RECEBIDA
    // ==================================================

    await updateDoc(
        referencia,
        {
            status:
                "recebida",

            estoqueMovimentado:
                true,

            estoqueMovimentadoEm:
                serverTimestamp(),

            estoqueMovimentadoPor:
                uid,

            atualizadoEm:
                serverTimestamp(),

            atualizadoPor:
                uid
        }
    );

    return true;
}
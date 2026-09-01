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


// =========================================================
// USUÁRIO AUTENTICADO
// =========================================================

function obterUIDUsuarioAutenticado() {

    const uid =
        auth.currentUser?.uid ?? null;

    console.log(
        "COMPRA MOVIMENTAÇÃO: UID autenticado:",
        uid
    );

    return uid;
}


// =========================================================
// RECEBER COMPRA
// =========================================================
//
// Este processo:
//
// 1. Busca a compra
// 2. Verifica se ela já foi recebida
// 3. Registra a entrada de cada item no estoque
// 4. Altera o status da compra para "recebida"
// 5. Guarda a informação de que o estoque já foi movimentado
//
// IMPORTANTE:
//
// A compra não deve gerar entrada novamente depois de recebida.
//
// =========================================================

export async function receberCompra(
    compraId
) {

    console.log(
        "============================================================"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: INICIANDO receberCompra()"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: compraId recebido:",
        compraId
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: tipo do compraId:",
        typeof compraId
    );


    // ---------------------------------------------------------
    // VALIDAR ID
    // ---------------------------------------------------------

    if (!compraId) {

        console.error(
            "COMPRA MOVIMENTAÇÃO: ID da compra não informado."
        );

        throw new Error(
            "O ID da compra é obrigatório."
        );
    }


    // ---------------------------------------------------------
    // USUÁRIO
    // ---------------------------------------------------------

    const uid =
        obterUIDUsuarioAutenticado();


    if (!uid) {

        console.error(
            "COMPRA MOVIMENTAÇÃO: usuário não autenticado."
        );

        throw new Error(
            "Usuário não autenticado."
        );
    }


    // ---------------------------------------------------------
    // REFERÊNCIA
    // ---------------------------------------------------------

    const referencia =
        doc(
            db,
            "compras",
            compraId
        );


    console.log(
        "COMPRA MOVIMENTAÇÃO: referência Firestore criada."
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: coleção:",
        "compras"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: documento:",
        compraId
    );


    // ---------------------------------------------------------
    // BUSCAR COMPRA
    // ---------------------------------------------------------

    console.log(
        "COMPRA MOVIMENTAÇÃO: buscando compra no Firestore..."
    );


    const snapshot =
        await getDoc(
            referencia
        );


    console.log(
        "COMPRA MOVIMENTAÇÃO: getDoc() concluído."
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: documento existe?:",
        snapshot.exists()
    );


    if (!snapshot.exists()) {

        console.error(
            "COMPRA MOVIMENTAÇÃO: compra não encontrada:",
            compraId
        );

        throw new Error(
            "Compra não encontrada."
        );
    }


    // ---------------------------------------------------------
    // DADOS DA COMPRA
    // ---------------------------------------------------------

    const compra = {

        id:
            snapshot.id,

        ...snapshot.data()

    };


    console.log(
        "============================================================"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: COMPRA ENCONTRADA"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: ID:",
        compra.id
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: status:",
        compra.status
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: tipo do status:",
        typeof compra.status
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: fornecedor:",
        compra.fornecedorNome
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: fornecedorId:",
        compra.fornecedorId
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: total:",
        compra.total
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: itens:",
        compra.itens
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: quantidade de itens:",
        Array.isArray(compra.itens)
            ? compra.itens.length
            : "NÃO É ARRAY"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: estoqueMovimentado:",
        compra.estoqueMovimentado
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: criadoPor:",
        compra.criadoPor
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: atualizadoPor:",
        compra.atualizadoPor
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: dados completos:",
        compra
    );

    console.log(
        "============================================================"
    );


    // ---------------------------------------------------------
    // VERIFICAR STATUS ANTES DA RECEPÇÃO
    // ---------------------------------------------------------

    const statusOriginal =
        String(
            compra.status ?? ""
        )
            .trim()
            .toLowerCase();


    console.log(
        "COMPRA MOVIMENTAÇÃO: status original:",
        statusOriginal
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: status é pendente?:",
        statusOriginal === "pendente"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: status é realizada?:",
        statusOriginal === "realizada"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: status é recebida?:",
        statusOriginal === "recebida"
    );


    // ---------------------------------------------------------
    // VERIFICAR SE JÁ FOI RECEBIDA
    // ---------------------------------------------------------

    console.log(
        "COMPRA MOVIMENTAÇÃO: verificando se estoque já foi movimentado..."
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: status === recebida?:",
        compra.status === "recebida"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: estoqueMovimentado === true?:",
        compra.estoqueMovimentado === true
    );


    if (
        compra.status === "recebida" ||
        compra.estoqueMovimentado === true
    ) {

        console.warn(
            "============================================================"
        );

        console.warn(
            "COMPRA MOVIMENTAÇÃO: COMPRA JÁ RECEBIDA"
        );

        console.warn(
            "COMPRA MOVIMENTAÇÃO: ID:",
            compraId
        );

        console.warn(
            "COMPRA MOVIMENTAÇÃO: status:",
            compra.status
        );

        console.warn(
            "COMPRA MOVIMENTAÇÃO: estoqueMovimentado:",
            compra.estoqueMovimentado
        );

        console.warn(
            "============================================================"
        );

        throw new Error(
            "Esta compra já foi recebida e já movimentou o estoque."
        );
    }


    // ---------------------------------------------------------
    // VALIDAR ITENS
    // ---------------------------------------------------------

    console.log(
        "COMPRA MOVIMENTAÇÃO: validando itens..."
    );


    if (
        !Array.isArray(compra.itens) ||
        compra.itens.length === 0
    ) {

        console.error(
            "COMPRA MOVIMENTAÇÃO: compra sem itens."
        );

        throw new Error(
            "A compra não possui itens para movimentar o estoque."
        );
    }


    console.log(
        "COMPRA MOVIMENTAÇÃO: quantidade de itens:",
        compra.itens.length
    );


    // ---------------------------------------------------------
    // REGISTRAR ENTRADA DOS PRODUTOS
    // ---------------------------------------------------------

    for (
        let indice = 0;
        indice < compra.itens.length;
        indice++
    ) {

        const item =
            compra.itens[indice];


        console.log(
            "============================================================"
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: PROCESSANDO ITEM",
            indice
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: item:",
            item
        );


        // -----------------------------------------------------
        // Produto
        // -----------------------------------------------------

        console.log(
            "COMPRA MOVIMENTAÇÃO: produtoId:",
            item?.produtoId
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: produtoNome:",
            item?.produtoNome
        );


        if (!item.produtoId) {

            console.error(
                "COMPRA MOVIMENTAÇÃO: produto sem vínculo:",
                item
            );

            throw new Error(
                `O item "${item.produtoNome || "sem nome"}" não está vinculado a um produto do estoque.`
            );
        }


        // -----------------------------------------------------
        // Quantidade
        // -----------------------------------------------------

        const quantidade =
            Number(
                item.quantidade
            );


        console.log(
            "COMPRA MOVIMENTAÇÃO: quantidade original:",
            item.quantidade
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: quantidade convertida:",
            quantidade
        );


        if (
            !Number.isFinite(quantidade) ||
            quantidade <= 0
        ) {

            throw new Error(
                `Quantidade inválida no item "${item.produtoNome || item.produtoId}".`
            );
        }


        // -----------------------------------------------------
        // Custo
        // -----------------------------------------------------

        const custoUnitario =
            Number(
                item.custoUnitario
            );


        console.log(
            "COMPRA MOVIMENTAÇÃO: custo original:",
            item.custoUnitario
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: custo convertido:",
            custoUnitario
        );


        if (
            !Number.isFinite(custoUnitario) ||
            custoUnitario < 0
        ) {

            throw new Error(
                `Custo unitário inválido no item "${item.produtoNome || item.produtoId}".`
            );
        }


        // -----------------------------------------------------
        // REGISTRAR ENTRADA
        // -----------------------------------------------------

        console.log(
            "COMPRA MOVIMENTAÇÃO: chamando registrarEntradaEstoque()..."
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: produtoId:",
            item.produtoId
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: quantidade:",
            quantidade
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: custoUnitario:",
            custoUnitario
        );


        await registrarEntradaEstoque({

            produtoId:
                item.produtoId,

            quantidade,

            custoUnitario,

            observacao:
                `Entrada referente à compra ${compraId}`,

            origem:
                "compra"

        });


        console.log(
            "COMPRA MOVIMENTAÇÃO: entrada registrada com sucesso para item:",
            indice
        );

        console.log(
            "============================================================"
        );
    }


    // ---------------------------------------------------------
    // MARCAR COMPRA COMO RECEBIDA
    // ---------------------------------------------------------

    console.log(
        "============================================================"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: PREPARANDO ALTERAÇÃO DE STATUS"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: status ANTES:",
        compra.status
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: status DEPOIS:",
        "recebida"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: estoqueMovimentado:",
        true
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: usuário responsável:",
        uid
    );


    const dadosAtualizacao = {

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

    };


    console.log(
        "COMPRA MOVIMENTAÇÃO: documento que será atualizado:",
        dadosAtualizacao
    );


    // ---------------------------------------------------------
    // UPDATE
    // ---------------------------------------------------------

    console.log(
        "COMPRA MOVIMENTAÇÃO: executando updateDoc()..."
    );


    await updateDoc(
        referencia,
        dadosAtualizacao
    );


    console.log(
        "COMPRA MOVIMENTAÇÃO: updateDoc() concluído."
    );


    // ---------------------------------------------------------
    // VERIFICAR NOVAMENTE NO FIRESTORE
    // ---------------------------------------------------------

    console.log(
        "COMPRA MOVIMENTAÇÃO: verificando compra após update..."
    );


    const snapshotDepois =
        await getDoc(
            referencia
        );


    if (
        snapshotDepois.exists()
    ) {

        const dadosDepois =
            snapshotDepois.data();


        console.log(
            "============================================================"
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: DOCUMENTO APÓS RECEBER"
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: ID:",
            snapshotDepois.id
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: STATUS APÓS UPDATE:",
            dadosDepois?.status
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: estoqueMovimentado:",
            dadosDepois?.estoqueMovimentado
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: estoqueMovimentadoPor:",
            dadosDepois?.estoqueMovimentadoPor
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: atualizadoPor:",
            dadosDepois?.atualizadoPor
        );

        console.log(
            "COMPRA MOVIMENTAÇÃO: dados completos:",
            dadosDepois
        );

        console.log(
            "============================================================"
        );

    } else {

        console.warn(
            "COMPRA MOVIMENTAÇÃO: documento não encontrado após update."
        );
    }


    // ---------------------------------------------------------
    // FINAL
    // ---------------------------------------------------------

    console.log(
        "============================================================"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: receberCompra() FINALIZADO COM SUCESSO"
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: compra:",
        compraId
    );

    console.log(
        "COMPRA MOVIMENTAÇÃO: status final esperado:",
        "recebida"
    );

    console.log(
        "============================================================"
    );


    return true;
}
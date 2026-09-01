import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";

import {
    auth,
    db
} from "./firebase";

// ======================================================
// COLEÇÃO
// ======================================================

const produtosCollection =
    collection(
        db,
        "produtos"
    );

export function observarProdutos(onChange, onError) {
    return onSnapshot(
        query(produtosCollection, orderBy("nome")),
        (snapshot) => onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        onError
    );
}

// ======================================================
// USUÁRIO AUTENTICADO
// ======================================================

function obterUIDUsuarioAutenticado() {
    return auth.currentUser?.uid ?? null;
}

// ======================================================
// NORMALIZAR NOME
// ======================================================

function normalizarNome(nome) {

    if (typeof nome !== "string") {
        return nome;
    }

    return nome
        .trim()
        .toUpperCase();
}

// ======================================================
// CADASTRAR PRODUTO
// ======================================================

export async function cadastrarProduto(
    dadosProduto
) {

    if (!dadosProduto) {
        throw new Error(
            "Os dados do produto são obrigatórios."
        );
    }

    const uid =
        obterUIDUsuarioAutenticado();

    if (!uid) {
        throw new Error(
            "Usuário não autenticado."
        );
    }

    if (
        !dadosProduto.nome ||
        !String(dadosProduto.nome).trim()
    ) {
        throw new Error(
            "O nome do produto é obrigatório."
        );
    }

    const dadosNormalizados = {
        ...dadosProduto,

        nome:
            normalizarNome(
                dadosProduto.nome
            ),

        codigo: normalizarNome(dadosProduto.codigo),

        descricao: normalizarNome(dadosProduto.descricao),

        categoria: normalizarNome(dadosProduto.categoria),

        unidade: normalizarNome(dadosProduto.unidade || "UN"),

        estoqueAtual: 0,

        ultimaMovimentacaoId:
            null,

        criadoEm:
            serverTimestamp(),

        atualizadoEm:
            serverTimestamp(),

        criadoPor:
            uid,

        atualizadoPor:
            uid
    };

    const referencia =
        await addDoc(
            produtosCollection,
            dadosNormalizados
        );

    return referencia.id;
}

// ======================================================
// LISTAR PRODUTOS
// ======================================================

export async function listarProdutos() {

    const consulta =
        query(
            produtosCollection,
            orderBy("nome")
        );

    const snapshot =
        await getDocs(
            consulta
        );

    return snapshot.docs.map(
        (produto) => ({
            id: produto.id,
            ...produto.data()
        })
    );
}

// ======================================================
// BUSCAR PRODUTO POR ID
// ======================================================

export async function buscarProdutoPorId(
    id
) {

    if (!id) {
        return null;
    }

    const referencia =
        doc(
            db,
            "produtos",
            id
        );

    const snapshot =
        await getDoc(
            referencia
        );

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };
}

// ======================================================
// ATUALIZAR PRODUTO
// ======================================================

export async function atualizarProduto(
    id,
    dadosProduto
) {

    if (!id) {
        throw new Error(
            "O ID do produto é obrigatório."
        );
    }

    if (!dadosProduto) {
        throw new Error(
            "Os dados do produto são obrigatórios."
        );
    }

    const uid =
        obterUIDUsuarioAutenticado();

    if (!uid) {
        throw new Error(
            "Usuário não autenticado."
        );
    }

    const referencia =
        doc(
            db,
            "produtos",
            id
        );

    const dadosAtualizacao = {
        ...dadosProduto,

        atualizadoEm:
            serverTimestamp(),

        atualizadoPor:
            uid
    };

    if (
        dadosProduto.nome !== undefined
    ) {

        if (
            !String(
                dadosProduto.nome
            ).trim()
        ) {
            throw new Error(
                "O nome do produto é obrigatório."
            );
        }

        dadosAtualizacao.nome =
            normalizarNome(
                dadosProduto.nome
            );
    }

    // --------------------------------------------------
    // IMPORTANTE
    // --------------------------------------------------
    //
    // estoqueAtual não deve ser alterado diretamente
    // por esta função.
    //
    // Entradas e saídas utilizam movimentacaoService,
    // que executa uma transação.
    //
    // --------------------------------------------------

    delete dadosAtualizacao.estoqueAtual;

    delete dadosAtualizacao.ultimaMovimentacaoId;

    await updateDoc(
        referencia,
        dadosAtualizacao
    );

    return buscarProdutoPorId(id);
}

// ======================================================
// EXCLUIR PRODUTO
// ======================================================

export async function excluirProduto(
    id
) {

    if (!id) {
        throw new Error(
            "O ID do produto é obrigatório."
        );
    }

    const referencia =
        doc(
            db,
            "produtos",
            id
        );

    await deleteDoc(
        referencia
    );

    return true;
}
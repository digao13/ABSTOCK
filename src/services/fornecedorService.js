import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
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

const fornecedoresCollection =
    collection(
        db,
        "fornecedores"
    );

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

    return String(
        nome ?? ""
    )
        .trim()
        .toUpperCase();
}

// ======================================================
// CADASTRAR FORNECEDOR
// ======================================================

export async function cadastrarFornecedor(
    nome
) {

    const nomeNormalizado =
        normalizarNome(nome);

    if (!nomeNormalizado) {
        throw new Error(
            "O nome do fornecedor é obrigatório."
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
        await addDoc(
            fornecedoresCollection,
            {
                nome:
                    nomeNormalizado,

                criadoEm:
                    serverTimestamp(),

                atualizadoEm:
                    serverTimestamp(),

                criadoPor:
                    uid,

                atualizadoPor:
                    uid
            }
        );

    return referencia.id;
}

// ======================================================
// LISTAR FORNECEDORES
// ======================================================

export async function listarFornecedores() {

    const consulta =
        query(
            fornecedoresCollection,
            orderBy("nome")
        );

    const snapshot =
        await getDocs(
            consulta
        );

    return snapshot.docs.map(
        (fornecedor) => ({
            id: fornecedor.id,
            ...fornecedor.data()
        })
    );
}

// ======================================================
// BUSCAR FORNECEDOR POR ID
// ======================================================

export async function buscarFornecedorPorId(
    id
) {

    if (!id) {
        return null;
    }

    const referencia =
        doc(
            db,
            "fornecedores",
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
// ATUALIZAR FORNECEDOR
// ======================================================

export async function atualizarFornecedor(
    id,
    nome
) {

    if (!id) {
        throw new Error(
            "O ID do fornecedor é obrigatório."
        );
    }

    const nomeNormalizado =
        normalizarNome(nome);

    if (!nomeNormalizado) {
        throw new Error(
            "O nome do fornecedor é obrigatório."
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
            "fornecedores",
            id
        );

    await updateDoc(
        referencia,
        {
            nome:
                nomeNormalizado,

            atualizadoEm:
                serverTimestamp(),

            atualizadoPor:
                uid
        }
    );

    return buscarFornecedorPorId(id);
}

// ======================================================
// EXCLUIR FORNECEDOR
// ======================================================

export async function excluirFornecedor(
    id
) {

    if (!id) {
        throw new Error(
            "O ID do fornecedor é obrigatório."
        );
    }

    const referencia =
        doc(
            db,
            "fornecedores",
            id
        );

    await deleteDoc(
        referencia
    );

    return true;
}
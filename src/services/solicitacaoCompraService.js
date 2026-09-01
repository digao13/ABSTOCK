import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    getDoc
} from "firebase/firestore";

import { auth, db } from "./firebase";

const COLLECTION = "solicitacoesCompra";

// =========================================================
// USUÁRIO ATUAL
// =========================================================

function obterUsuarioAtual() {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error("Usuário não autenticado.");
    }

    return usuario;
}

// =========================================================
// CADASTRAR SOLICITAÇÃO
// =========================================================

export async function cadastrarSolicitacaoCompra(dados = {}) {
    const usuario = obterUsuarioAtual();

    const quantidade = Number(dados.quantidade);

    if (
        !Number.isFinite(quantidade) ||
        quantidade <= 0
    ) {
        throw new Error(
            "A quantidade deve ser maior que zero."
        );
    }

    if (
        dados.tipo !== "existente" &&
        dados.tipo !== "novo"
    ) {
        throw new Error(
            "Tipo de solicitação inválido."
        );
    }

    // -----------------------------------------------------
    // Produto existente
    // -----------------------------------------------------

    if (
        dados.tipo === "existente" &&
        !dados.produtoNome?.trim()
    ) {
        throw new Error(
            "Informe o produto que deseja comprar."
        );
    }

    // -----------------------------------------------------
    // Item novo
    // -----------------------------------------------------

    if (
        dados.tipo === "novo" &&
        !dados.nomeItem?.trim()
    ) {
        throw new Error(
            "Informe o nome do novo item."
        );
    }

    // -----------------------------------------------------
    // Compra online
    // -----------------------------------------------------

    const compraOnline =
        Boolean(dados.compraOnline);

    let urlCompra = "";

    if (compraOnline) {
        if (!dados.urlCompra?.trim()) {
            throw new Error(
                "Informe o link do produto para compras pela internet."
            );
        }

        try {
            const url = new URL(
                dados.urlCompra.trim()
            );

            if (
                url.protocol !== "http:" &&
                url.protocol !== "https:"
            ) {
                throw new Error();
            }

            urlCompra = url.toString();

        } catch {
            throw new Error(
                "Informe uma URL válida iniciando com http:// ou https://."
            );
        }
    }

    // -----------------------------------------------------
    // Valor sugerido
    // -----------------------------------------------------

    let valorUnitarioSugerido = null;

    if (
        dados.valorUnitarioSugerido !==
            undefined &&
        dados.valorUnitarioSugerido !==
            null &&
        dados.valorUnitarioSugerido !== ""
    ) {
        valorUnitarioSugerido =
            Number(
                dados.valorUnitarioSugerido
            );

        if (
            !Number.isFinite(
                valorUnitarioSugerido
            ) ||
            valorUnitarioSugerido <= 0
        ) {
            throw new Error(
                "O valor unitário sugerido é inválido."
            );
        }
    }

    const valorTotalSugerido =
        valorUnitarioSugerido !== null
            ? valorUnitarioSugerido *
              quantidade
            : null;

    // -----------------------------------------------------
    // Dados da solicitação
    // -----------------------------------------------------

    const solicitacao = {
        tipo:
            dados.tipo === "novo"
                ? "novo"
                : "existente",

        // Não dependemos mais de produtoId.
        produtoId: null,

        produtoNome:
            dados.tipo === "existente"
                ? dados.produtoNome
                    ?.trim().toUpperCase() || null
                : null,

        nomeItem:
            dados.tipo === "novo"
                ? dados.nomeItem
                    .trim()
                    .toUpperCase()
                : null,

        quantidade,

        observacao:
            dados.observacao
                ?.trim().toUpperCase() || "",

        // -------------------------------------------------
        // Compra online
        // -------------------------------------------------

        compraOnline,

        urlCompra,

        // -------------------------------------------------
        // Fornecedor sugerido
        // -------------------------------------------------

        fornecedorId:
            dados.fornecedorId ||
            null,

        fornecedorNome:
            dados.fornecedorNome
                ?.trim().toUpperCase() || null,

        // -------------------------------------------------
        // Valor sugerido
        // -------------------------------------------------

        valorUnitarioSugerido,

        valorTotalSugerido,

        // -------------------------------------------------
        // Status
        // -------------------------------------------------

        status: "pendente",

        solicitadoPor:
            usuario.uid,

        criadoEm:
            serverTimestamp(),

        atualizadoEm:
            serverTimestamp(),

        atualizadoPor:
            usuario.uid,

        historicoRejeicoes: []
    };

    const referencia =
        await addDoc(
            collection(
                db,
                COLLECTION
            ),
            solicitacao
        );

    return referencia.id;
}

// =========================================================
// LISTAR SOLICITAÇÕES
// =========================================================

export async function listarSolicitacoesCompra() {
    obterUsuarioAtual();

    const consulta =
        query(
            collection(
                db,
                COLLECTION
            ),
            orderBy(
                "criadoEm",
                "desc"
            )
        );

    const snapshot =
        await getDocs(
            consulta
        );

    return snapshot.docs.map(
        (documento) => ({
            id: documento.id,
            ...documento.data()
        })
    );
}

// =========================================================
// BUSCAR UMA SOLICITAÇÃO
// =========================================================

export async function buscarSolicitacaoCompra(
    id
) {
    obterUsuarioAtual();

    if (!id) {
        throw new Error(
            "ID da solicitação não informado."
        );
    }

    const referencia =
        doc(
            db,
            COLLECTION,
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

// =========================================================
// ATUALIZAR STATUS
// =========================================================

export async function atualizarStatusSolicitacao(
    id,
    status,
    dadosAdicionais = {}
) {
    const usuario =
        obterUsuarioAtual();

    if (!id) {
        throw new Error(
            "ID da solicitação não informado."
        );
    }

    if (!status) {
        throw new Error(
            "Status da solicitação não informado."
        );
    }

    const referencia =
        doc(
            db,
            COLLECTION,
            id
        );

    const documento =
        await getDoc(
            referencia
        );

    if (!documento.exists()) {
        throw new Error(
            "Solicitação não encontrada."
        );
    }

    await updateDoc(
        referencia,
        {
            ...dadosAdicionais,

            status,

            atualizadoEm:
                serverTimestamp(),

            atualizadoPor:
                usuario.uid
        }
    );
}

// =========================================================
// APROVAR SOLICITAÇÃO
// =========================================================

export async function aprovarSolicitacao(
    id,
    observacao = ""
) {
    const usuario =
        obterUsuarioAtual();

    await atualizarStatusSolicitacao(
        id,
        "aprovada",
        {
            aprovadoPor:
                usuario.uid,

            aprovadoEm:
                serverTimestamp(),

            observacaoAprovacao:
                observacao
                    ?.trim().toUpperCase() || ""
        }
    );
}

// =========================================================
// REJEITAR SOLICITAÇÃO
// =========================================================

export async function rejeitarSolicitacao(
    id,
    motivo
) {
    const usuario =
        obterUsuarioAtual();

    if (!id) {
        throw new Error(
            "ID da solicitação não informado."
        );
    }

    const motivoLimpo =
        motivo?.trim();

    if (!motivoLimpo) {
        throw new Error(
            "Informe o motivo da rejeição."
        );
    }

    const referencia =
        doc(
            db,
            COLLECTION,
            id
        );

    const snapshot =
        await getDoc(
            referencia
        );

    if (!snapshot.exists()) {
        throw new Error(
            "Solicitação não encontrada."
        );
    }

    const solicitacao =
        snapshot.data();

    const historicoAtual =
        Array.isArray(
            solicitacao.historicoRejeicoes
        )
            ? solicitacao
                .historicoRejeicoes
            : [];

    const novaRejeicao = {
        motivo:
            motivoLimpo,

        rejeitadoPor:
            usuario.uid,

        rejeitadoEm:
            new Date()
                .toISOString()
    };

    const historicoAtualizado =
        [
            ...historicoAtual,
            novaRejeicao
        ];

    await updateDoc(
        referencia,
        {
            status:
                "rejeitada",

            motivoRejeicao:
                motivoLimpo,

            rejeitadoPor:
                usuario.uid,

            rejeitadoEm:
                serverTimestamp(),

            historicoRejeicoes:
                historicoAtualizado,

            atualizadoEm:
                serverTimestamp(),

            atualizadoPor:
                usuario.uid
        }
    );
}

// =========================================================
// REALIZAR COMPRA
// =========================================================

export async function realizarCompraSolicitacao(
    id,
    dadosCompra = {}
) {
    const usuario =
        obterUsuarioAtual();

    if (!id) {
        throw new Error(
            "ID da solicitação não informado."
        );
    }

    // -----------------------------------------------------
    // Buscar solicitação
    // -----------------------------------------------------

    const referencia =
        doc(
            db,
            COLLECTION,
            id
        );

    const snapshot =
        await getDoc(
            referencia
        );

    if (!snapshot.exists()) {
        throw new Error(
            "Solicitação não encontrada."
        );
    }

    const solicitacao =
        snapshot.data();

    // -----------------------------------------------------
    // Fornecedor
    // -----------------------------------------------------

    const fornecedorId =
        dadosCompra.fornecedorId ||
        solicitacao.fornecedorId ||
        null;

    const fornecedorNome =
        dadosCompra.fornecedorNome
            ?.trim() ||
        solicitacao.fornecedorNome ||
        null;

    if (
        !fornecedorId &&
        !fornecedorNome
    ) {
        throw new Error(
            "Informe o fornecedor da compra."
        );
    }

    // -----------------------------------------------------
    // Quantidade
    // -----------------------------------------------------

    const quantidade =
        dadosCompra.quantidade !==
            undefined &&
        dadosCompra.quantidade !==
            null &&
        dadosCompra.quantidade !== ""
            ? Number(
                dadosCompra.quantidade
            )
            : Number(
                solicitacao.quantidade
            );

    if (
        !Number.isFinite(
            quantidade
        ) ||
        quantidade <= 0
    ) {
        throw new Error(
            "Quantidade inválida."
        );
    }

    // -----------------------------------------------------
    // Valor unitário
    //
    // Se o usuário informar um novo valor,
    // ele substitui o valor sugerido.
    //
    // -----------------------------------------------------

    let valorUnitario;

    if (
        dadosCompra.valorUnitario !==
            undefined &&
        dadosCompra.valorUnitario !==
            null &&
        dadosCompra.valorUnitario !== ""
    ) {
        valorUnitario =
            Number(
                dadosCompra.valorUnitario
            );

    } else if (
        solicitacao.valorUnitarioSugerido !==
            undefined &&
        solicitacao.valorUnitarioSugerido !==
            null
    ) {
        valorUnitario =
            Number(
                solicitacao
                    .valorUnitarioSugerido
            );

    } else {
        throw new Error(
            "Informe o valor unitário da compra."
        );
    }

    if (
        !Number.isFinite(
            valorUnitario
        ) ||
        valorUnitario <= 0
    ) {
        throw new Error(
            "Informe um valor unitário maior que zero."
        );
    }

    // -----------------------------------------------------
    // Valor total
    // -----------------------------------------------------

    const valorTotal =
        quantidade *
        valorUnitario;

    // -----------------------------------------------------
    // Observação
    // -----------------------------------------------------

    const observacaoCompra =
        dadosCompra.observacaoCompra
            ?.trim().toUpperCase() || "";

    // -----------------------------------------------------
    // Atualizar solicitação
    // -----------------------------------------------------

    await updateDoc(
        referencia,
        {
            status:
                "comprada",

            quantidade,

            // Dados finais da compra
            fornecedorId,

            fornecedorNome,

            valorUnitario,

            valorTotal,

            observacaoCompra,

            // Mantém o valor sugerido
            // para comparação posterior.
            valorUnitarioSugerido:
                solicitacao
                    .valorUnitarioSugerido ??
                null,

            valorTotalSugerido:
                solicitacao
                    .valorTotalSugerido ??
                null,

            compradaPor:
                usuario.uid,

            compradaEm:
                serverTimestamp(),

            atualizadoEm:
                serverTimestamp(),

            atualizadoPor:
                usuario.uid
        }
    );
}

// =========================================================
// COMPATIBILIDADE
// =========================================================

export async function realizarCompra(
    id,
    dadosCompra = {}
) {
    return realizarCompraSolicitacao(
        id,
        dadosCompra
    );
}

// =========================================================
// MARCAR COMO COMPRADA
// =========================================================

export async function marcarSolicitacaoComoComprada(
    id,
    dadosCompra = {}
) {
    return realizarCompraSolicitacao(
        id,
        dadosCompra
    );
}

// =========================================================
// CANCELAR SOLICITAÇÃO
// =========================================================

export async function cancelarSolicitacao(
    id,
    motivo = ""
) {
    const usuario =
        obterUsuarioAtual();

    if (!id) {
        throw new Error(
            "ID da solicitação não informado."
        );
    }

    const referencia =
        doc(
            db,
            COLLECTION,
            id
        );

    const snapshot =
        await getDoc(
            referencia
        );

    if (!snapshot.exists()) {
        throw new Error(
            "Solicitação não encontrada."
        );
    }

    await updateDoc(
        referencia,
        {
            status:
                "cancelada",

            motivoCancelamento:
                motivo?.trim().toUpperCase() || "",

            canceladoPor:
                usuario.uid,

            canceladoEm:
                serverTimestamp(),

            atualizadoEm:
                serverTimestamp(),

            atualizadoPor:
                usuario.uid
        }
    );
}

// =========================================================
// EXCLUIR SOLICITAÇÃO
// =========================================================

export async function excluirSolicitacaoCompra(
    id
) {
    obterUsuarioAtual();

    if (!id) {
        throw new Error(
            "ID da solicitação não informado."
        );
    }

    const referencia =
        doc(
            db,
            COLLECTION,
            id
        );

    const snapshot =
        await getDoc(
            referencia
        );

    if (!snapshot.exists()) {
        throw new Error(
            "Solicitação não encontrada."
        );
    }

    await deleteDoc(
        referencia
    );
}
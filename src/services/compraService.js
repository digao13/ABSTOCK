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
    updateDoc,
    onSnapshot
} from "firebase/firestore";

import {
    auth,
    db
} from "./firebase";


// ======================================================
// COLEÇÃO
// ======================================================

const comprasCollection =
    collection(
        db,
        "compras"
    );


// ======================================================
// USUÁRIO AUTENTICADO
// ======================================================

function obterUIDUsuarioAutenticado() {

    const usuario =
        auth.currentUser;

    if (!usuario) {

        throw new Error(
            "Usuário não autenticado."
        );
    }

    return usuario.uid;
}


// ======================================================
// NORMALIZAR TEXTO
// ======================================================

function normalizarTexto(
    valor
) {

    return String(
        valor ?? ""
    )
        .trim()
        .toUpperCase();
}


// ======================================================
// NORMALIZAR ITENS
// ======================================================

function normalizarItens(
    itens
) {

    if (
        !Array.isArray(itens)
    ) {

        return [];
    }

    return itens.map(
        (
            item
        ) => {

            const quantidade =
                Number(
                    item?.quantidade
                );

            const custoUnitario =
                Number(
                    item?.custoUnitario
                );

            const subtotal =
                quantidade *
                custoUnitario;

            return {

                produtoId:
                    item?.produtoId ||
                    null,

                produtoNome:
                    normalizarTexto(
                        item?.produtoNome
                    ),

                quantidade,

                custoUnitario,

                subtotal
            };
        }
    );
}


// ======================================================
// CALCULAR TOTAL
// ======================================================

function calcularTotal(
    itens
) {

    return itens.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                Number(
                    item.subtotal || 0
                )
            );
        },
        0
    );
}


// ======================================================
// VALIDAR ITENS
// ======================================================

function validarItens(
    itens
) {

    if (
        !Array.isArray(itens) ||
        itens.length === 0
    ) {

        throw new Error(
            "A compra precisa possuir pelo menos um produto."
        );
    }

    for (
        const item of itens
    ) {

        if (
            !item.produtoNome
        ) {

            throw new Error(
                "Todos os itens da compra precisam possuir um nome."
            );
        }

        if (
            !Number.isFinite(
                item.quantidade
            ) ||
            item.quantidade <= 0
        ) {

            throw new Error(
                "A quantidade de todos os itens deve ser maior que zero."
            );
        }

        if (
            !Number.isFinite(
                item.custoUnitario
            ) ||
            item.custoUnitario < 0
        ) {

            throw new Error(
                "O custo unitário de todos os itens deve ser válido."
            );
        }

        if (
            !Number.isFinite(
                item.subtotal
            ) ||
            item.subtotal < 0
        ) {

            throw new Error(
                "O subtotal de todos os itens deve ser válido."
            );
        }
    }
}


// ======================================================
// VALIDAR VALORES OPCIONAIS
// ======================================================

function normalizarValorOpcional(
    valor
) {

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {

        return null;
    }

    const numero =
        Number(
            valor
        );

    if (
        !Number.isFinite(
            numero
        ) ||
        numero < 0
    ) {

        throw new Error(
            "Valor informado inválido."
        );
    }

    return numero;
}


// ======================================================
// CADASTRAR COMPRA
// ======================================================

export async function cadastrarCompra(
    dadosCompra
) {

    console.log(
        "========================================"
    );

    console.log(
        "COMPRA SERVICE: INICIANDO CADASTRO"
    );

    console.log(
        "COMPRA SERVICE: dados recebidos:",
        dadosCompra
    );

    console.log(
        "COMPRA SERVICE: status recebido:",
        dadosCompra?.status
    );

    console.log(
        "COMPRA SERVICE: tipo do status:",
        typeof dadosCompra?.status
    );

    console.log(
        "COMPRA SERVICE: fornecedor recebido:",
        dadosCompra?.fornecedorNome
    );

    console.log(
        "COMPRA SERVICE: itens recebidos:",
        dadosCompra?.itens
    );


    if (!dadosCompra) {

        throw new Error(
            "Os dados da compra são obrigatórios."
        );
    }


    // --------------------------------------------------
    // Usuário
    // --------------------------------------------------

    const uid =
        obterUIDUsuarioAutenticado();

    console.log(
        "COMPRA SERVICE: usuário autenticado:",
        uid
    );


    // --------------------------------------------------
    // Fornecedor
    // --------------------------------------------------

    const fornecedorId =
        String(
            dadosCompra.fornecedorId ?? ""
        ).trim();

    if (!fornecedorId) {

        throw new Error(
            "O fornecedor é obrigatório."
        );
    }


    const fornecedorNome =
        normalizarTexto(
            dadosCompra.fornecedorNome
        );

    if (!fornecedorNome) {

        throw new Error(
            "O nome do fornecedor é obrigatório."
        );
    }


    // --------------------------------------------------
    // Itens
    // --------------------------------------------------

    const itens =
        normalizarItens(
            dadosCompra.itens
        );

    validarItens(
        itens
    );


    // --------------------------------------------------
    // Total
    // --------------------------------------------------

    const total =
        calcularTotal(
            itens
        );

    if (
        !Number.isFinite(
            total
        ) ||
        total < 0
    ) {

        throw new Error(
            "O total da compra é inválido."
        );
    }


    // --------------------------------------------------
    // Valores sugeridos
    // --------------------------------------------------

    const valorUnitarioSugerido =
        normalizarValorOpcional(
            dadosCompra.valorUnitarioSugerido
        );

    const valorTotalSugerido =
        normalizarValorOpcional(
            dadosCompra.valorTotalSugerido
        );


    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    console.log(
        "========================================"
    );

    console.log(
        "COMPRA SERVICE: ANALISANDO STATUS"
    );

    console.log(
        "COMPRA SERVICE: status original:",
        dadosCompra.status
    );

    console.log(
        "COMPRA SERVICE: status é undefined?:",
        dadosCompra.status === undefined
    );

    console.log(
        "COMPRA SERVICE: status é null?:",
        dadosCompra.status === null
    );

    console.log(
        "COMPRA SERVICE: status é string?:",
        typeof dadosCompra.status === "string"
    );


    const status =
        String(
            dadosCompra.status ||
            "pendente"
        ).trim();


    console.log(
        "COMPRA SERVICE: STATUS FINAL QUE SERÁ GRAVADO:",
        status
    );

    console.log(
        "COMPRA SERVICE: tipo do status final:",
        typeof status
    );

    console.log(
        "COMPRA SERVICE: status === pendente?:",
        status === "pendente"
    );

    console.log(
        "========================================"
    );


    // --------------------------------------------------
    // Documento
    // --------------------------------------------------

    const dadosFirestore = {

        fornecedorId,

        fornecedorNome,

        itens,

        total,

        status,

        observacao:
            normalizarTexto(
                dadosCompra.observacao
            ),

        solicitacaoCompraId:
            dadosCompra.solicitacaoCompraId ||
            null,

        valorUnitarioSugerido,

        valorTotalSugerido,

        criadoEm:
            serverTimestamp(),

        atualizadoEm:
            serverTimestamp(),

        criadoPor:
            uid,

        atualizadoPor:
            uid
    };


    console.log(
        "========================================"
    );

    console.log(
        "COMPRA SERVICE: DOCUMENTO QUE SERÁ ENVIADO AO FIRESTORE:"
    );

    console.log(
        dadosFirestore
    );

    console.log(
        "COMPRA SERVICE: status dentro do documento:",
        dadosFirestore.status
    );

    console.log(
        "COMPRA SERVICE: fornecedor:",
        dadosFirestore.fornecedorNome
    );

    console.log(
        "COMPRA SERVICE: total:",
        dadosFirestore.total
    );

    console.log(
        "========================================"
    );


    // --------------------------------------------------
    // CRIAR
    // --------------------------------------------------

    try {

        console.log(
            "COMPRA SERVICE: executando addDoc()..."
        );

        const referencia =
            await addDoc(
                comprasCollection,
                dadosFirestore
            );


        console.log(
            "========================================"
        );

        console.log(
            "COMPRA SERVICE: COMPRA CRIADA COM SUCESSO"
        );

        console.log(
            "COMPRA SERVICE: ID criado:",
            referencia.id
        );

        console.log(
            "COMPRA SERVICE: status gravado:",
            status
        );

        console.log(
            "COMPRA SERVICE: status esperado:",
            "pendente"
        );

        console.log(
            "COMPRA SERVICE: status está correto?:",
            status === "pendente"
        );

        console.log(
            "========================================"
        );


        return referencia.id;

    } catch (
        error
    ) {

        console.error(
            "========================================"
        );

        console.error(
            "COMPRA SERVICE: ERRO AO CRIAR COMPRA"
        );

        console.error(
            "COMPRA SERVICE: erro completo:",
            error
        );

        console.error(
            "COMPRA SERVICE: código:",
            error?.code
        );

        console.error(
            "COMPRA SERVICE: mensagem:",
            error?.message
        );

        console.error(
            "========================================"
        );

        throw error;
    }
}


// ======================================================
// LISTAR COMPRAS
// ======================================================

export function observarCompras(onChange, onError) {
    const consulta = query(
        comprasCollection,
        orderBy("criadoEm", "desc")
    );

    return onSnapshot(
        consulta,
        (snapshot) => {
            const compras = snapshot.docs.map((compra) => ({
                id: compra.id,
                ...compra.data()
            }));

            onChange(compras);
        },
        onError
    );
}

export async function listarCompras() {

    console.log(
        "========================================"
    );

    console.log(
        "COMPRA SERVICE: INICIANDO listarCompras()"
    );


    const consulta =
        query(
            comprasCollection,
            orderBy(
                "criadoEm",
                "desc"
            )
        );


    console.log(
        "COMPRA SERVICE: executando getDocs()..."
    );


    const snapshot =
        await getDocs(
            consulta
        );


    console.log(
        "COMPRA SERVICE: documentos encontrados:",
        snapshot.size
    );


    const compras =
        snapshot.docs.map(
            (
                compra
            ) => {

                const dados =
                    compra.data();


                console.log(
                    "----------------------------------------"
                );

                console.log(
                    "COMPRA SERVICE: documento encontrado:",
                    compra.id
                );

                console.log(
                    "COMPRA SERVICE: status no Firestore:",
                    dados?.status
                );

                console.log(
                    "COMPRA SERVICE: tipo do status:",
                    typeof dados?.status
                );

                console.log(
                    "COMPRA SERVICE: fornecedor:",
                    dados?.fornecedorNome
                );

                console.log(
                    "COMPRA SERVICE: total:",
                    dados?.total
                );

                console.log(
                    "COMPRA SERVICE: criadoPor:",
                    dados?.criadoPor
                );

                console.log(
                    "COMPRA SERVICE: atualizadoPor:",
                    dados?.atualizadoPor
                );

                console.log(
                    "COMPRA SERVICE: atualizadoEm:",
                    dados?.atualizadoEm
                );


                return {

                    id:
                        compra.id,

                    ...dados
                };
            }
        );


    console.log(
        "========================================"
    );

    console.log(
        "COMPRA SERVICE: RESUMO DO listarCompras()"
    );

    console.log(
        "COMPRA SERVICE: total retornado:",
        compras.length
    );


    const resumoStatus = {};


    compras.forEach(
        (
            compra
        ) => {

            const status =
                String(
                    compra?.status ?? ""
                )
                    .trim()
                    .toLowerCase();


            const chave =
                status ||
                "(sem status)";


            resumoStatus[chave] =
                (
                    resumoStatus[chave] ||
                    0
                ) + 1;
        }
    );


    console.table(
        resumoStatus
    );


    console.log(
        "COMPRA SERVICE: lista final:",
        compras
    );

    console.log(
        "========================================"
    );


    return compras;
}


// ======================================================
// BUSCAR COMPRA
// ======================================================

export async function buscarCompraPorId(
    id
) {

    console.log(
        "========================================"
    );

    console.log(
        "COMPRA SERVICE: buscando compra por ID:",
        id
    );


    if (!id) {

        console.warn(
            "COMPRA SERVICE: ID não informado."
        );

        return null;
    }


    const referencia =
        doc(
            db,
            "compras",
            id
        );


    const snapshot =
        await getDoc(
            referencia
        );


    if (
        !snapshot.exists()
    ) {

        console.warn(
            "COMPRA SERVICE: compra não encontrada:",
            id
        );

        return null;
    }


    const dados =
        snapshot.data();


    console.log(
        "COMPRA SERVICE: compra encontrada:"
    );

    console.log(
        "COMPRA SERVICE: ID:",
        snapshot.id
    );

    console.log(
        "COMPRA SERVICE: status:",
        dados?.status
    );

    console.log(
        "COMPRA SERVICE: fornecedor:",
        dados?.fornecedorNome
    );

    console.log(
        "COMPRA SERVICE: dados completos:",
        dados
    );

    console.log(
        "========================================"
    );


    return {

        id:
            snapshot.id,

        ...dados
    };
}


// ======================================================
// ATUALIZAR COMPRA
// ======================================================

export async function atualizarCompra(
    id,
    dadosCompra
) {

    console.log(
        "========================================"
    );

    console.log(
        "COMPRA SERVICE: INICIANDO atualizarCompra()"
    );

    console.log(
        "COMPRA SERVICE: ID:",
        id
    );

    console.log(
        "COMPRA SERVICE: dados recebidos:",
        dadosCompra
    );

    console.log(
        "COMPRA SERVICE: status recebido:",
        dadosCompra?.status
    );


    if (!id) {

        throw new Error(
            "O ID da compra é obrigatório."
        );
    }


    if (!dadosCompra) {

        throw new Error(
            "Os dados da compra são obrigatórios."
        );
    }


    const uid =
        obterUIDUsuarioAutenticado();


    const dadosAtualizacao = {

        atualizadoEm:
            serverTimestamp(),

        atualizadoPor:
            uid
    };


    // --------------------------------------------------
    // Fornecedor
    // --------------------------------------------------

    if (
        dadosCompra.fornecedorId !==
        undefined
    ) {

        const fornecedorId =
            String(
                dadosCompra.fornecedorId ??
                ""
            ).trim();


        if (!fornecedorId) {

            throw new Error(
                "O fornecedor é obrigatório."
            );
        }


        dadosAtualizacao.fornecedorId =
            fornecedorId;
    }


    // --------------------------------------------------
    // Nome fornecedor
    // --------------------------------------------------

    if (
        dadosCompra.fornecedorNome !==
        undefined
    ) {

        const fornecedorNome =
            normalizarTexto(
                dadosCompra.fornecedorNome
            );


        if (!fornecedorNome) {

            throw new Error(
                "O nome do fornecedor é obrigatório."
            );
        }


        dadosAtualizacao.fornecedorNome =
            fornecedorNome;
    }


    // --------------------------------------------------
    // Itens
    // --------------------------------------------------

    if (
        dadosCompra.itens !==
        undefined
    ) {

        const itens =
            normalizarItens(
                dadosCompra.itens
            );


        validarItens(
            itens
        );


        dadosAtualizacao.itens =
            itens;


        dadosAtualizacao.total =
            calcularTotal(
                itens
            );
    }


    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    if (
        dadosCompra.status !==
        undefined
    ) {

        console.log(
            "========================================"
        );

        console.log(
            "COMPRA SERVICE: ATUALIZAÇÃO DE STATUS"
        );

        console.log(
            "COMPRA SERVICE: ID da compra:",
            id
        );

        console.log(
            "COMPRA SERVICE: status recebido:",
            dadosCompra.status
        );

        console.log(
            "COMPRA SERVICE: tipo:",
            typeof dadosCompra.status
        );


        const status =
            String(
                dadosCompra.status
            ).trim();


        if (!status) {

            throw new Error(
                "O status da compra é inválido."
            );
        }


        dadosAtualizacao.status =
            status;


        console.log(
            "COMPRA SERVICE: STATUS QUE SERÁ GRAVADO:",
            status
        );

        console.log(
            "COMPRA SERVICE: é pendente?:",
            status === "pendente"
        );

        console.log(
            "COMPRA SERVICE: é realizada?:",
            status === "realizada"
        );

        console.log(
            "COMPRA SERVICE: é recebida?:",
            status === "recebida"
        );

        console.log(
            "========================================"
        );

    } else {

        console.log(
            "COMPRA SERVICE: atualizarCompra() NÃO recebeu alteração de status."
        );
    }


    // --------------------------------------------------
    // Observação
    // --------------------------------------------------

    if (
        dadosCompra.observacao !==
        undefined
    ) {

        dadosAtualizacao.observacao =
            normalizarTexto(
                dadosCompra.observacao
            );
    }


    // --------------------------------------------------
    // Solicitação
    // --------------------------------------------------

    if (
        dadosCompra.solicitacaoCompraId !==
        undefined
    ) {

        dadosAtualizacao.solicitacaoCompraId =
            dadosCompra.solicitacaoCompraId ||
            null;
    }


    // --------------------------------------------------
    // Valor sugerido
    // --------------------------------------------------

    if (
        dadosCompra.valorUnitarioSugerido !==
        undefined
    ) {

        dadosAtualizacao.valorUnitarioSugerido =
            normalizarValorOpcional(
                dadosCompra.valorUnitarioSugerido
            );
    }


    if (
        dadosCompra.valorTotalSugerido !==
        undefined
    ) {

        dadosAtualizacao.valorTotalSugerido =
            normalizarValorOpcional(
                dadosCompra.valorTotalSugerido
            );
    }


    // --------------------------------------------------
    // DOCUMENTO FINAL
    // --------------------------------------------------

    console.log(
        "========================================"
    );

    console.log(
        "COMPRA SERVICE: DOCUMENTO QUE SERÁ ATUALIZADO:"
    );

    console.log(
        dadosAtualizacao
    );

    console.log(
        "COMPRA SERVICE: status presente na atualização:",
        dadosAtualizacao.status
    );

    console.log(
        "========================================"
    );


    // --------------------------------------------------
    // Atualizar
    // --------------------------------------------------

    const referencia =
        doc(
            db,
            "compras",
            id
        );


    try {

        console.log(
            "COMPRA SERVICE: executando updateDoc()..."
        );


        await updateDoc(
            referencia,
            dadosAtualizacao
        );


        console.log(
            "COMPRA SERVICE: updateDoc() concluído."
        );


        // ------------------------------------------------
        // LER NOVAMENTE APÓS ATUALIZAÇÃO
        // ------------------------------------------------

        console.log(
            "COMPRA SERVICE: verificando documento após atualização..."
        );


        const documentoDepois =
            await getDoc(
                referencia
            );


        if (
            documentoDepois.exists()
        ) {

            const dadosDepois =
                documentoDepois.data();


            console.log(
                "========================================"
            );

            console.log(
                "COMPRA SERVICE: DOCUMENTO APÓS UPDATE"
            );

            console.log(
                "COMPRA SERVICE: ID:",
                documentoDepois.id
            );

            console.log(
                "COMPRA SERVICE: STATUS NO FIRESTORE APÓS UPDATE:",
                dadosDepois?.status
            );

            console.log(
                "COMPRA SERVICE: fornecedor:",
                dadosDepois?.fornecedorNome
            );

            console.log(
                "COMPRA SERVICE: atualizadoPor:",
                dadosDepois?.atualizadoPor
            );

            console.log(
                "COMPRA SERVICE: dados completos:",
                dadosDepois
            );

            console.log(
                "========================================"
            );

        } else {

            console.warn(
                "COMPRA SERVICE: documento não encontrado após update."
            );
        }


    } catch (
        error
    ) {

        console.error(
            "========================================"
        );

        console.error(
            "COMPRA SERVICE: ERRO AO ATUALIZAR"
        );

        console.error(
            "COMPRA SERVICE: erro:",
            error
        );

        console.error(
            "COMPRA SERVICE: código:",
            error?.code
        );

        console.error(
            "COMPRA SERVICE: mensagem:",
            error?.message
        );

        console.error(
            "========================================"
        );

        throw error;
    }


    return buscarCompraPorId(
        id
    );
}


// ======================================================
// EXCLUIR COMPRA
// ======================================================

export async function excluirCompra(
    id
) {

    console.log(
        "========================================"
    );

    console.log(
        "COMPRA SERVICE: iniciando excluirCompra():",
        id
    );


    if (!id) {

        throw new Error(
            "O ID da compra é obrigatório."
        );
    }


    const referencia =
        doc(
            db,
            "compras",
            id
        );


    const snapshot =
        await getDoc(
            referencia
        );


    if (
        !snapshot.exists()
    ) {

        throw new Error(
            "Compra não encontrada."
        );
    }


    console.log(
        "COMPRA SERVICE: compra encontrada antes da exclusão."
    );

    console.log(
        "COMPRA SERVICE: status antes da exclusão:",
        snapshot.data()?.status
    );


    await deleteDoc(
        referencia
    );


    console.log(
        "COMPRA SERVICE: compra excluída:",
        id
    );

    console.log(
        "========================================"
    );


    return true;
}
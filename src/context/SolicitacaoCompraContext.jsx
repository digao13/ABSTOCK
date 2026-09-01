import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    cadastrarSolicitacaoCompra,
    listarSolicitacoesCompra,
    atualizarStatusSolicitacao,
    excluirSolicitacaoCompra
} from "../services/solicitacaoCompraService";

import {
    cadastrarCompra
} from "../services/compraService";

import {
    enviarEmail
} from "../services/emailService";

import {
    listarUsuarios
} from "../services/usuarioService";

import {
    useAuth
} from "./AuthContext";


// =========================================================
// CONTEXT
// =========================================================

const SolicitacaoCompraContext =
    createContext(null);


// =========================================================
// E-MAIL RESPONSÁVEL
// =========================================================

const EMAIL_SOLICITACAO_COMPRA =
    "SEU_EMAIL@gmail.com";


// =========================================================
// NORMALIZAR STATUS
// =========================================================

function normalizarStatus(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}


// =========================================================
// VERIFICAR SE ESTÁ PENDENTE
// =========================================================

function solicitacaoEstaPendente(
    solicitacao
) {

    return (
        normalizarStatus(
            solicitacao?.status
        ) === "pendente"
    );
}


// =========================================================
// PROVIDER
// =========================================================

export function SolicitacaoCompraProvider({
    children
}) {

    const {
        usuario,
        carregando: carregandoAuth
    } = useAuth();


    // =====================================================
    // ESTADOS
    // =====================================================

    const [
        solicitacoes,
        setSolicitacoes
    ] = useState([]);


    const [
        usuarios,
        setUsuarios
    ] = useState([]);


    const [
        carregando,
        setCarregando
    ] = useState(true);


    const [
        carregandoUsuarios,
        setCarregandoUsuarios
    ] = useState(true);


    const [
        salvando,
        setSalvando
    ] = useState(false);


    // =====================================================
    // SOLICITAÇÕES PENDENTES
    // =====================================================
    //
    // IMPORTANTE:
    //
    // As solicitações pendentes NÃO são obtidas de
    // CompraContext.
    //
    // Elas vêm diretamente de:
    //
    // solicitacoesCompra
    //
    // com:
    //
    // status === "pendente"
    //
    // =====================================================

    const solicitacoesPendentes =
        useMemo(
            () => {

                if (
                    !Array.isArray(
                        solicitacoes
                    )
                ) {
                    return [];
                }

                return solicitacoes.filter(
                    (
                        solicitacao
                    ) =>
                        solicitacaoEstaPendente(
                            solicitacao
                        )
                );

            },
            [
                solicitacoes
            ]
        );


    // =====================================================
    // TOTAL DE SOLICITAÇÕES PENDENTES
    // =====================================================

    const totalSolicitacoesPendentes =
        solicitacoesPendentes.length;


    // =====================================================
    // ALIAS DE COMPATIBILIDADE
    // =====================================================
    //
    // Caso alguma tela esteja utilizando o nome
    // "comprasPendentes", podemos disponibilizar também.
    //
    // A origem continua sendo solicitacoesCompra.
    //
    // =====================================================

    const comprasPendentes =
        solicitacoesPendentes;


    const totalComprasPendentes =
        totalSolicitacoesPendentes;


    // =====================================================
    // DIAGNÓSTICO
    // =====================================================

    const diagnosticarSolicitacoes =
        useCallback(
            (
                lista
            ) => {

                const listaSegura =
                    Array.isArray(lista)
                        ? lista
                        : [];


                const resumo = {};


                listaSegura.forEach(
                    (
                        solicitacao
                    ) => {

                        const status =
                            normalizarStatus(
                                solicitacao?.status
                            );


                        const chave =
                            status ||
                            "(sem status)";


                        resumo[chave] =
                            (
                                resumo[chave] ||
                                0
                            ) + 1;

                    }
                );


                const pendentes =
                    listaSegura.filter(
                        (
                            solicitacao
                        ) =>
                            solicitacaoEstaPendente(
                                solicitacao
                            )
                    );


                console.log(
                    "============================================================"
                );

                console.log(
                    "SOLICITACAO CONTEXT: DIAGNÓSTICO"
                );

                console.log(
                    "SOLICITACAO CONTEXT: total:",
                    listaSegura.length
                );

                console.log(
                    "SOLICITACAO CONTEXT: resumo dos status:",
                    resumo
                );

                console.table(
                    resumo
                );

                console.log(
                    "SOLICITACAO CONTEXT: total pendentes:",
                    pendentes.length
                );

                console.log(
                    "SOLICITACAO CONTEXT: IDs pendentes:",
                    pendentes.map(
                        (
                            item
                        ) =>
                            item?.id
                    )
                );

                console.log(
                    "SOLICITACAO CONTEXT: pendentes:",
                    pendentes
                );

                console.log(
                    "============================================================"
                );

            },
            []
        );


    // =====================================================
    // CARREGAR SOLICITAÇÕES
    // =====================================================

    const carregarSolicitacoes =
        useCallback(
            async () => {

                if (
                    carregandoAuth
                ) {
                    return [];
                }


                if (
                    !usuario
                ) {

                    setSolicitacoes(
                        []
                    );

                    setCarregando(
                        false
                    );

                    return [];

                }


                try {

                    setCarregando(
                        true
                    );


                    console.log(
                        "SOLICITACAO CONTEXT: carregando solicitacoesCompra..."
                    );


                    const lista =
                        await listarSolicitacoesCompra();


                    const listaSegura =
                        Array.isArray(lista)
                            ? lista
                            : [];


                    console.log(
                        "SOLICITACAO CONTEXT: solicitações encontradas:",
                        listaSegura.length
                    );


                    diagnosticarSolicitacoes(
                        listaSegura
                    );


                    setSolicitacoes(
                        listaSegura
                    );


                    return listaSegura;

                } catch (
                    error
                ) {

                    console.error(
                        "SOLICITACAO CONTEXT: erro ao carregar solicitações:",
                        error
                    );


                    setSolicitacoes(
                        []
                    );


                    throw error;

                } finally {

                    setCarregando(
                        false
                    );

                }

            },
            [
                carregandoAuth,
                usuario,
                diagnosticarSolicitacoes
            ]
        );


    // =====================================================
    // CARREGAR USUÁRIOS
    // =====================================================

    const carregarUsuarios =
        useCallback(
            async () => {

                if (
                    carregandoAuth
                ) {
                    return [];
                }


                if (
                    !usuario
                ) {

                    setUsuarios(
                        []
                    );

                    setCarregandoUsuarios(
                        false
                    );

                    return [];

                }


                try {

                    setCarregandoUsuarios(
                        true
                    );


                    const lista =
                        await listarUsuarios();


                    const listaSegura =
                        Array.isArray(lista)
                            ? lista
                            : [];


                    const usuariosAtivos =
                        listaSegura.filter(
                            (
                                item
                            ) =>
                                item.ativo !== false
                        );


                    setUsuarios(
                        usuariosAtivos
                    );


                    return usuariosAtivos;

                } catch (
                    error
                ) {

                    console.error(
                        "Erro ao carregar usuários:",
                        error
                    );


                    setUsuarios(
                        []
                    );


                    throw error;

                } finally {

                    setCarregandoUsuarios(
                        false
                    );

                }

            },
            [
                carregandoAuth,
                usuario
            ]
        );


    // =====================================================
    // CARREGAMENTO INICIAL
    // =====================================================

    useEffect(
        () => {

            if (
                carregandoAuth
            ) {
                return;
            }


            carregarSolicitacoes()
                .catch(
                    () => {}
                );


            carregarUsuarios()
                .catch(
                    () => {}
                );

        },
        [
            carregandoAuth,
            usuario,
            carregarSolicitacoes,
            carregarUsuarios
        ]
    );


    // =====================================================
    // CRIAR SOLICITAÇÃO
    // =====================================================

    const criarSolicitacao =
        useCallback(
            async (
                dados
            ) => {

                setSalvando(
                    true
                );


                try {

                    const id =
                        await cadastrarSolicitacaoCompra(
                            dados
                        );


                    const produtoNome =
                        dados.tipo === "novo"
                            ? dados.nomeItem
                            : dados.produtoNome;


                    // -----------------------------------------
                    // E-MAIL
                    // -----------------------------------------

                    try {

                        await enviarEmail({

                            to_email:
                                EMAIL_SOLICITACAO_COMPRA,

                            produto:
                                produtoNome
                                    ?.trim() || "",

                            quantidade:
                                dados.quantidade ?? "",

                            solicitadoPor:
                                usuario?.email ||
                                usuario?.displayName ||
                                usuario?.uid ||
                                "",

                            observacao:
                                dados.observacao
                                    ?.trim() || ""

                        });

                    } catch (
                        erroEmail
                    ) {

                        console.error(
                            "Solicitação criada, mas o e-mail não foi enviado:",
                            erroEmail
                        );

                    }


                    // -----------------------------------------
                    // RECARREGAR
                    // -----------------------------------------

                    await carregarSolicitacoes();


                    return id;

                } catch (
                    error
                ) {

                    console.error(
                        "Erro ao criar solicitação:",
                        error
                    );


                    throw error;

                } finally {

                    setSalvando(
                        false
                    );

                }

            },
            [
                usuario,
                carregarSolicitacoes
            ]
        );


    // =====================================================
    // ALTERAR STATUS
    // =====================================================

    const alterarStatus =
        useCallback(
            async (
                id,
                status,
                observacao = ""
            ) => {

                setSalvando(
                    true
                );


                try {

                    await atualizarStatusSolicitacao(
                        id,
                        status,
                        {
                            observacao:
                                observacao
                                    ?.trim() || ""
                        }
                    );


                    await carregarSolicitacoes();

                } catch (
                    error
                ) {

                    console.error(
                        "Erro ao alterar status da solicitação:",
                        error
                    );


                    throw error;

                } finally {

                    setSalvando(
                        false
                    );

                }

            },
            [
                carregarSolicitacoes
            ]
        );


    // =====================================================
    // REALIZAR COMPRA
    // =====================================================

    const realizarCompra =
        useCallback(
            async (
                id,
                dados = {}
            ) => {

                setSalvando(
                    true
                );


                try {

                    const solicitacao =
                        solicitacoes.find(
                            (
                                item
                            ) =>
                                item.id === id
                        );


                    if (
                        !solicitacao
                    ) {

                        throw new Error(
                            "Solicitação não encontrada."
                        );

                    }


                    // -----------------------------------------
                    // SOMENTE APROVADA
                    // -----------------------------------------

                    if (
                        normalizarStatus(
                            solicitacao.status
                        ) !== "aprovada"
                    ) {

                        throw new Error(
                            "Somente solicitações aprovadas podem ser compradas."
                        );

                    }


                    // -----------------------------------------
                    // QUANTIDADE
                    // -----------------------------------------

                    const quantidade =
                        Number(
                            dados.quantidade ??
                            solicitacao.quantidade
                        );


                    if (
                        !Number.isFinite(
                            quantidade
                        ) ||
                        quantidade <= 0
                    ) {

                        throw new Error(
                            "A quantidade da compra é inválida."
                        );

                    }


                    // -----------------------------------------
                    // FORNECEDOR
                    // -----------------------------------------

                    const fornecedorId =
                        dados.fornecedorId ||
                        solicitacao.fornecedorId ||
                        null;


                    const fornecedorNome =
                        dados.fornecedorNome
                            ?.trim() ||
                        solicitacao.fornecedorNome
                            ?.trim() ||
                        "";


                    if (
                        !fornecedorId &&
                        !fornecedorNome
                    ) {

                        throw new Error(
                            "Informe o fornecedor da compra."
                        );

                    }


                    // -----------------------------------------
                    // VALOR UNITÁRIO
                    // -----------------------------------------

                    let valorUnitario;


                    if (
                        dados.valorUnitario !==
                            undefined &&
                        dados.valorUnitario !==
                            null &&
                        dados.valorUnitario !==
                            ""
                    ) {

                        valorUnitario =
                            Number(
                                dados.valorUnitario
                            );

                    } else if (
                        solicitacao
                            .valorUnitarioSugerido !==
                            undefined &&
                        solicitacao
                            .valorUnitarioSugerido !==
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


                    // -----------------------------------------
                    // TIPO DA COMPRA
                    // -----------------------------------------

                    const tipoCompra =
                        dados.tipoCompra === "online"
                            ? "online"
                            : "presencial";


                    // -----------------------------------------
                    // PREVISÃO DE ENTREGA
                    // -----------------------------------------

                    let previsaoEntrega =
                        null;


                    if (
                        tipoCompra ===
                        "online"
                    ) {

                        if (
                            !dados.previsaoEntrega
                        ) {

                            throw new Error(
                                "Informe a previsão de entrega da compra online."
                            );

                        }


                        previsaoEntrega =
                            dados.previsaoEntrega;

                    }


                    // -----------------------------------------
                    // USUÁRIOS
                    // -----------------------------------------

                    const usuariosSelecionados =
                        Array.isArray(
                            dados.usuariosSelecionados
                        )
                            ? dados.usuariosSelecionados
                            : [];


                    if (
                        usuariosSelecionados.length ===
                        0
                    ) {

                        throw new Error(
                            "Selecione pelo menos um usuário para receber a notificação."
                        );

                    }


                    // -----------------------------------------
                    // TOTAL
                    // -----------------------------------------

                    const valorTotal =
                        quantidade *
                        valorUnitario;


                    // -----------------------------------------
                    // PRODUTO
                    // -----------------------------------------

                    const produtoNome =
                        solicitacao.tipo ===
                        "novo"
                            ? solicitacao.nomeItem
                            : solicitacao.produtoNome;


                    if (
                        !produtoNome
                            ?.trim()
                    ) {

                        throw new Error(
                            "O produto/item da solicitação não foi informado."
                        );

                    }


                    // -----------------------------------------
                    // DADOS DA COMPRA
                    // -----------------------------------------

                    const dadosCompra = {

                        fornecedorId:
                            fornecedorId ||
                            null,

                        fornecedorNome:
                            fornecedorNome ||
                            "FORNECEDOR NÃO INFORMADO",

                        itens: [
                            {

                                produtoId:
                                    solicitacao.produtoId ||
                                    null,

                                produtoNome:
                                    produtoNome.trim(),

                                quantidade,

                                custoUnitario:
                                    valorUnitario,

                                subtotal:
                                    valorTotal

                            }
                        ],

                        total:
                            valorTotal,

                        status:
                            "realizada",

                        observacao:
                            dados
                                .observacaoCompra
                                ?.trim() ||
                            solicitacao
                                .observacao
                                ?.trim() ||
                            "",

                        solicitacaoCompraId:
                            id,

                        valorUnitarioSugerido:
                            solicitacao
                                .valorUnitarioSugerido ??
                            null,

                        valorTotalSugerido:
                            solicitacao
                                .valorTotalSugerido ??
                            null,

                        tipoCompra,

                        previsaoEntrega

                    };


                    // -----------------------------------------
                    // CRIAR COMPRA
                    // -----------------------------------------

                    const compraId =
                        await cadastrarCompra(
                            dadosCompra
                        );


                    // -----------------------------------------
                    // ATUALIZAR SOLICITAÇÃO
                    // -----------------------------------------

                    await atualizarStatusSolicitacao(
                        id,
                        "comprada",
                        {

                            compraId,

                            quantidade,

                            fornecedorId:
                                fornecedorId ||
                                null,

                            fornecedorNome:
                                fornecedorNome ||
                                null,

                            valorUnitario,

                            valorTotal,

                            observacaoCompra:
                                dados
                                    .observacaoCompra
                                    ?.trim() ||
                                "",

                            valorUnitarioSugerido:
                                solicitacao
                                    .valorUnitarioSugerido ??
                                null,

                            valorTotalSugerido:
                                solicitacao
                                    .valorTotalSugerido ??
                                null,

                            compradaEm:
                                new Date(),

                            produtoId:
                                solicitacao
                                    .produtoId ||
                                null,

                            produtoNome:
                                produtoNome.trim(),

                            tipoCompra,

                            previsaoEntrega

                        }
                    );


                    // -----------------------------------------
                    // NOTIFICAÇÕES
                    // -----------------------------------------

                    const destinatarios =
                        usuarios.filter(
                            (
                                usuarioDestino
                            ) =>
                                usuariosSelecionados.includes(
                                    usuarioDestino.id
                                ) &&
                                usuarioDestino.ativo !==
                                    false &&
                                usuarioDestino.email
                        );


                    for (
                        const destinatario
                        of destinatarios
                    ) {

                        try {

                            await enviarEmail({

                                to_email:
                                    destinatario.email,

                                produto:
                                    produtoNome.trim(),

                                quantidade,

                                solicitadoPor:
                                    usuario?.email ||
                                    usuario?.displayName ||
                                    usuario?.uid ||
                                    "",

                                observacao:
                                    dados
                                        .observacaoCompra
                                        ?.trim() ||
                                    "",

                                tipoCompra,

                                previsaoEntrega,

                                fornecedor:
                                    fornecedorNome,

                                valorUnitario,

                                valorTotal

                            });

                        } catch (
                            erroDestinatario
                        ) {

                            console.error(
                                `Erro ao enviar e-mail para ${destinatario.email}:`,
                                erroDestinatario
                            );

                        }

                    }


                    await carregarSolicitacoes();


                    return compraId;

                } catch (
                    error
                ) {

                    console.error(
                        "Erro ao realizar compra:",
                        error
                    );


                    throw error;

                } finally {

                    setSalvando(
                        false
                    );

                }

            },
            [
                solicitacoes,
                usuarios,
                usuario,
                carregarSolicitacoes
            ]
        );


    // =====================================================
    // EXCLUIR SOLICITAÇÃO
    // =====================================================

    const excluir =
        useCallback(
            async (
                id
            ) => {

                setSalvando(
                    true
                );


                try {

                    await excluirSolicitacaoCompra(
                        id
                    );


                    await carregarSolicitacoes();

                } catch (
                    error
                ) {

                    console.error(
                        "Erro ao excluir solicitação:",
                        error
                    );


                    throw error;

                } finally {

                    setSalvando(
                        false
                    );

                }

            },
            [
                carregarSolicitacoes
            ]
        );


    // =====================================================
    // VALOR DO CONTEXTO
    // =====================================================

    const valor =
        useMemo(
            () => ({

                // -----------------------------------------
                // SOLICITAÇÕES
                // -----------------------------------------

                solicitacoes,

                solicitacoesPendentes,

                totalSolicitacoesPendentes,


                // -----------------------------------------
                // COMPATIBILIDADE
                // -----------------------------------------

                comprasPendentes,

                totalComprasPendentes,


                // -----------------------------------------
                // ESTADOS
                // -----------------------------------------

                carregando,

                salvando,


                usuarios,

                carregandoUsuarios,


                // -----------------------------------------
                // FUNÇÕES
                // -----------------------------------------

                criarSolicitacao,

                alterarStatus,

                realizarCompra,

                excluir,

                carregarSolicitacoes,

                carregarUsuarios

            }),
            [
                solicitacoes,

                solicitacoesPendentes,

                totalSolicitacoesPendentes,

                comprasPendentes,

                totalComprasPendentes,

                carregando,

                salvando,

                usuarios,

                carregandoUsuarios,

                criarSolicitacao,

                alterarStatus,

                realizarCompra,

                excluir,

                carregarSolicitacoes,

                carregarUsuarios
            ]
        );


    // =====================================================
    // PROVIDER
    // =====================================================

    return (

        <SolicitacaoCompraContext.Provider
            value={valor}
        >

            {children}

        </SolicitacaoCompraContext.Provider>

    );

}


// =========================================================
// HOOK
// =========================================================

export function useSolicitacoesCompra() {

    const contexto =
        useContext(
            SolicitacaoCompraContext
        );


    if (
        contexto === null
    ) {

        throw new Error(
            "useSolicitacoesCompra precisa estar dentro de SolicitacaoCompraProvider"
        );

    }


    return contexto;

}
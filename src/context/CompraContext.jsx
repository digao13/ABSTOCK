import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    cadastrarCompra,
    listarCompras,
    observarCompras,
    buscarCompraPorId,
    atualizarCompra,
    excluirCompra
} from "../services/compraService";

import {
    receberCompra as receberCompraService
} from "../services/compraMovimentacaoService";


// =========================================================
// CONTEXT
// =========================================================

const CompraContext = createContext(null);


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
// OBTER POSSÍVEIS STATUS DA COMPRA
// =========================================================

function obterPossiveisStatus(compra) {

    return {

        "compra.status":
            compra?.status,

        "compra.statusSolicitacao":
            compra?.statusSolicitacao,

        "compra.solicitacaoStatus":
            compra?.solicitacaoStatus,

        "compra.statusDaSolicitacao":
            compra?.statusDaSolicitacao,

        "compra.situacao":
            compra?.situacao,

        "compra.estado":
            compra?.estado,

        "compra.solicitacao":
            compra?.solicitacao,

        "compra.solicitacao.status":
            compra?.solicitacao?.status,

        "compra.solicitacao.situacao":
            compra?.solicitacao?.situacao,

        "compra.solicitacao.estado":
            compra?.solicitacao?.estado

    };

}


// =========================================================
// VERIFICAR SE EXISTE STATUS PENDENTE
// =========================================================

function encontrarStatusPendente(compra) {

    const possiveisStatus =
        obterPossiveisStatus(compra);

    return Object.entries(
        possiveisStatus
    ).map(
        (
            [
                campo,
                valor
            ]
        ) => {

            const normalizado =
                normalizarStatus(
                    valor
                );

            return {

                campo,

                valor,

                normalizado,

                pendente:
                    normalizado === "pendente"

            };

        }
    );

}


// =========================================================
// VERIFICAR COMPRA PENDENTE
// =========================================================

function compraEstaPendente(compra) {

    const possiveisStatus =
        encontrarStatusPendente(
            compra
        );

    return possiveisStatus.some(
        (
            item
        ) =>
            item.pendente === true
    );

}


// =========================================================
// PROVIDER
// =========================================================

export function CompraProvider({
    children
}) {

    const [
        compras,
        setCompras
    ] = useState([]);


    const [
        carregando,
        setCarregando
    ] = useState(true);


    const [
        salvando,
        setSalvando
    ] = useState(false);


    // =========================================================
    // COMPRAS PENDENTES
    // =========================================================
    //
    // IMPORTANTE:
    // Este valor é derivado diretamente de "compras".
    //
    // Dessa forma, sempre que as compras forem carregadas,
    // cadastradas, editadas ou recebidas, o contador é
    // atualizado automaticamente.
    //
    // =========================================================

    const comprasPendentes =
        useMemo(
            () => {

                if (
                    !Array.isArray(compras)
                ) {
                    return [];
                }

                return compras.filter(
                    (
                        compra
                    ) =>
                        compraEstaPendente(
                            compra
                        )
                );

            },
            [
                compras
            ]
        );


    // =========================================================
    // TOTAL DE COMPRAS PENDENTES
    // =========================================================

    const totalComprasPendentes =
        comprasPendentes.length;


    // =========================================================
    // DIAGNÓSTICO DOS STATUS
    // =========================================================

    const diagnosticarStatus =
        useCallback(
            (
                lista
            ) => {

                const listaSegura =
                    Array.isArray(lista)
                        ? lista
                        : [];


                console.log(
                    "============================================================"
                );

                console.log(
                    "COMPRA CONTEXT: INICIANDO DIAGNÓSTICO DOS STATUS"
                );


                listaSegura.forEach(
                    (
                        compra,
                        indice
                    ) => {

                        console.log(
                            "------------------------------------------------------------"
                        );


                        console.log(
                            `COMPRA CONTEXT: COMPRA ${indice}`
                        );


                        console.log(
                            "COMPRA CONTEXT: ID:",
                            compra?.id
                        );


                        console.log(
                            "COMPRA CONTEXT: objeto completo:",
                            compra
                        );


                        console.log(
                            "COMPRA CONTEXT: status:",
                            compra?.status
                        );


                        console.log(
                            "COMPRA CONTEXT: statusSolicitacao:",
                            compra?.statusSolicitacao
                        );


                        console.log(
                            "COMPRA CONTEXT: solicitacaoStatus:",
                            compra?.solicitacaoStatus
                        );


                        console.log(
                            "COMPRA CONTEXT: statusDaSolicitacao:",
                            compra?.statusDaSolicitacao
                        );


                        console.log(
                            "COMPRA CONTEXT: situacao:",
                            compra?.situacao
                        );


                        console.log(
                            "COMPRA CONTEXT: estado:",
                            compra?.estado
                        );


                        console.log(
                            "COMPRA CONTEXT: solicitacao:",
                            compra?.solicitacao
                        );


                        console.log(
                            "COMPRA CONTEXT: solicitacao.status:",
                            compra?.solicitacao?.status
                        );


                        console.log(
                            "COMPRA CONTEXT: solicitacao.situacao:",
                            compra?.solicitacao?.situacao
                        );


                        console.log(
                            "COMPRA CONTEXT: solicitacao.estado:",
                            compra?.solicitacao?.estado
                        );


                        console.log(
                            "COMPRA CONTEXT: campos existentes:",
                            Object.keys(
                                compra || {}
                            )
                        );


                        const possiveisStatus =
                            encontrarStatusPendente(
                                compra
                            );


                        console.log(
                            "COMPRA CONTEXT: possíveis status:",
                            possiveisStatus
                        );


                        const possuiStatusPendente =
                            possiveisStatus.some(
                                (
                                    item
                                ) =>
                                    item.pendente === true
                            );


                        console.log(
                            "COMPRA CONTEXT: possui status pendente:",
                            possuiStatusPendente
                        );


                        if (
                            possuiStatusPendente
                        ) {

                            console.warn(
                                `COMPRA CONTEXT: ⚠️ COMPRA ${indice} É PENDENTE`
                            );

                        }

                    }
                );


                // =================================================
                // RESUMO DO STATUS PRINCIPAL
                // =================================================

                const resumoStatus = {};


                listaSegura.forEach(
                    (
                        compra
                    ) => {

                        const status =
                            normalizarStatus(
                                compra?.status
                            );


                        const statusExibicao =
                            status ||
                            "(sem status)";


                        resumoStatus[
                            statusExibicao
                        ] =
                            (
                                resumoStatus[
                                    statusExibicao
                                ] || 0
                            ) + 1;

                    }
                );


                console.log(
                    "============================================================"
                );

                console.log(
                    "COMPRA CONTEXT: RESUMO DO CAMPO compra.status"
                );


                console.table(
                    resumoStatus
                );


                // =================================================
                // COMPRAS PENDENTES
                // =================================================

                const pendentes =
                    listaSegura.filter(
                        (
                            compra
                        ) =>
                            compraEstaPendente(
                                compra
                            )
                    );


                console.log(
                    "============================================================"
                );

                console.log(
                    "COMPRA CONTEXT: COMPRAS PENDENTES"
                );


                console.log(
                    "COMPRA CONTEXT: quantidade:",
                    pendentes.length
                );


                console.log(
                    "COMPRA CONTEXT: IDs:",
                    pendentes.map(
                        (
                            compra
                        ) =>
                            compra?.id
                    )
                );


                console.log(
                    "COMPRA CONTEXT: lista:",
                    pendentes
                );


                console.log(
                    "============================================================"
                );

            },
            []
        );


    // =========================================================
    // CARREGAR COMPRAS
    // =========================================================

    const carregarCompras =
        useCallback(
            async () => {

                console.log(
                    "============================================================"
                );

                console.log(
                    "COMPRA CONTEXT: INICIANDO carregarCompras()"
                );


                setCarregando(
                    true
                );


                try {

                    console.log(
                        "COMPRA CONTEXT: chamando listarCompras()..."
                    );


                    const lista =
                        await listarCompras();


                    console.log(
                        "COMPRA CONTEXT: listarCompras() retornou."
                    );


                    console.log(
                        "COMPRA CONTEXT: resultado bruto:",
                        lista
                    );


                    console.log(
                        "COMPRA CONTEXT: é Array?:",
                        Array.isArray(
                            lista
                        )
                    );


                    const listaSegura =
                        Array.isArray(
                            lista
                        )
                            ? lista
                            : [];


                    console.log(
                        "COMPRA CONTEXT: quantidade recebida:",
                        listaSegura.length
                    );


                    // =================================================
                    // DIAGNÓSTICO
                    // =================================================

                    diagnosticarStatus(
                        listaSegura
                    );


                    // =================================================
                    // ATUALIZAR ESTADO
                    // =================================================

                    setCompras(
                        listaSegura
                    );


                    // =================================================
                    // CALCULAR PENDENTES IMEDIATAMENTE
                    // =================================================

                    const pendentes =
                        listaSegura.filter(
                            (
                                compra
                            ) =>
                                compraEstaPendente(
                                    compra
                                )
                        );


                    console.log(
                        "============================================================"
                    );


                    console.log(
                        "COMPRA CONTEXT: RESULTADO FINAL DO CARREGAMENTO"
                    );


                    console.log(
                        "COMPRA CONTEXT: total de compras:",
                        listaSegura.length
                    );


                    console.log(
                        "COMPRA CONTEXT: total de pendentes:",
                        pendentes.length
                    );


                    console.log(
                        "COMPRA CONTEXT: IDs pendentes:",
                        pendentes.map(
                            (
                                compra
                            ) =>
                                compra?.id
                        )
                    );


                    console.log(
                        "COMPRA CONTEXT: compras pendentes:",
                        pendentes
                    );


                    console.log(
                        "============================================================"
                    );


                    return listaSegura;


                } catch (
                    error
                ) {

                    console.error(
                        "============================================================"
                    );


                    console.error(
                        "COMPRA CONTEXT: ERRO EM carregarCompras()"
                    );


                    console.error(
                        "COMPRA CONTEXT: erro completo:",
                        error
                    );


                    console.error(
                        "COMPRA CONTEXT: código:",
                        error?.code
                    );


                    console.error(
                        "COMPRA CONTEXT: mensagem:",
                        error?.message
                    );


                    console.error(
                        "COMPRA CONTEXT: stack:",
                        error?.stack
                    );


                    console.error(
                        "============================================================"
                    );


                    setCompras(
                        []
                    );


                    throw error;


                } finally {

                    setCarregando(
                        false
                    );


                    console.log(
                        "COMPRA CONTEXT: carregando = false"
                    );


                    console.log(
                        "COMPRA CONTEXT: carregarCompras() FINALIZADO"
                    );


                    console.log(
                        "============================================================"
                    );

                }

            },
            [
                diagnosticarStatus
            ]
        );


    // =========================================================
    // CARREGAR AO INICIAR
    // =========================================================

    useEffect(
        () => {

            console.log(
                "============================================================"
            );


            console.log(
                "COMPRA CONTEXT: COMPONENTE INICIADO"
            );


            console.log(
                "COMPRA CONTEXT: iniciando carregamento inicial..."
            );


            carregarCompras()
                .catch(
                    (
                        error
                    ) => {

                        console.error(
                            "COMPRA CONTEXT: erro no carregamento inicial:",
                            error
                        );

                    }
                );

        },
        [
            carregarCompras
        ]
    );


    // =========================================================
    // CRIAR COMPRA
    // =========================================================

    useEffect(() => {
        setCarregando(true);

        const unsubscribe = observarCompras(
            (lista) => {
                const listaSegura = Array.isArray(lista)
                    ? lista
                    : [];

                diagnosticarStatus(listaSegura);
                setCompras(listaSegura);
                setCarregando(false);
            },
            (error) => {
                console.error(
                    "COMPRA CONTEXT: erro no listener:",
                    error
                );
                setCompras([]);
                setCarregando(false);
            }
        );

        return () => unsubscribe();
    }, [diagnosticarStatus]);

    const criarCompra =
        useCallback(
            async (
                dados
            ) => {

                console.log(
                    "============================================================"
                );


                console.log(
                    "COMPRA CONTEXT: INICIANDO criarCompra()"
                );


                console.log(
                    "COMPRA CONTEXT: dados recebidos:",
                    dados
                );


                console.log(
                    "COMPRA CONTEXT: status recebido:",
                    dados?.status
                );


                console.log(
                    "COMPRA CONTEXT: tipo do status:",
                    typeof dados?.status
                );


                console.log(
                    "COMPRA CONTEXT: status normalizado:",
                    normalizarStatus(
                        dados?.status
                    )
                );


                console.log(
                    "COMPRA CONTEXT: fornecedorId:",
                    dados?.fornecedorId
                );


                console.log(
                    "COMPRA CONTEXT: fornecedorNome:",
                    dados?.fornecedorNome
                );


                console.log(
                    "COMPRA CONTEXT: itens:",
                    dados?.itens
                );


                console.log(
                    "COMPRA CONTEXT: total:",
                    dados?.total
                );


                console.log(
                    "COMPRA CONTEXT: observação:",
                    dados?.observacao
                );


                console.log(
                    "COMPRA CONTEXT: solicitação:",
                    dados?.solicitacaoCompraId
                );


                console.log(
                    "COMPRA CONTEXT: valor unitário sugerido:",
                    dados?.valorUnitarioSugerido
                );


                console.log(
                    "COMPRA CONTEXT: valor total sugerido:",
                    dados?.valorTotalSugerido
                );


                if (
                    !dados
                ) {

                    console.error(
                        "COMPRA CONTEXT: ERRO - dados da compra são null/undefined."
                    );


                    throw new Error(
                        "Os dados da compra são obrigatórios."
                    );

                }


                setSalvando(
                    true
                );


                try {

                    console.log(
                        "COMPRA CONTEXT: chamando cadastrarCompra()..."
                    );


                    const id =
                        await cadastrarCompra(
                            dados
                        );


                    console.log(
                        "COMPRA CONTEXT: cadastrarCompra() retornou ID:",
                        id
                    );


                    await carregarCompras();


                    console.log(
                        "COMPRA CONTEXT: compras recarregadas após cadastro."
                    );


                    return id;


                } catch (
                    error
                ) {

                    console.error(
                        "============================================================"
                    );


                    console.error(
                        "COMPRA CONTEXT: ERRO EM criarCompra()"
                    );


                    console.error(
                        "COMPRA CONTEXT: dados:",
                        dados
                    );


                    console.error(
                        "COMPRA CONTEXT: status:",
                        dados?.status
                    );


                    console.error(
                        "COMPRA CONTEXT: erro:",
                        error
                    );


                    console.error(
                        "COMPRA CONTEXT: código:",
                        error?.code
                    );


                    console.error(
                        "COMPRA CONTEXT: mensagem:",
                        error?.message
                    );


                    console.error(
                        "============================================================"
                    );


                    throw error;


                } finally {

                    setSalvando(
                        false
                    );

                }

            },
            [
                carregarCompras
            ]
        );


    // =========================================================
    // BUSCAR POR ID
    // =========================================================

    const buscarPorId =
        useCallback(
            async (
                id
            ) => {

                console.log(
                    "============================================================"
                );


                console.log(
                    "COMPRA CONTEXT: INICIANDO buscarPorId()"
                );


                console.log(
                    "COMPRA CONTEXT: ID recebido:",
                    id
                );


                console.log(
                    "COMPRA CONTEXT: tipo do ID:",
                    typeof id
                );


                try {

                    const resultado =
                        await buscarCompraPorId(
                            id
                        );


                    console.log(
                        "COMPRA CONTEXT: buscarPorId() retornou:",
                        resultado
                    );


                    console.log(
                        "COMPRA CONTEXT: status encontrado:",
                        resultado?.status
                    );


                    return resultado;


                } catch (
                    error
                ) {

                    console.error(
                        "COMPRA CONTEXT: erro ao buscar compra:",
                        error
                    );


                    throw error;

                }

            },
            []
        );


    // =========================================================
    // EDITAR COMPRA
    // =========================================================

    const editarCompra =
        useCallback(
            async (
                id,
                dados
            ) => {

                console.log(
                    "============================================================"
                );


                console.log(
                    "COMPRA CONTEXT: INICIANDO editarCompra()"
                );


                console.log(
                    "COMPRA CONTEXT: ID:",
                    id
                );


                console.log(
                    "COMPRA CONTEXT: dados:",
                    dados
                );


                console.log(
                    "COMPRA CONTEXT: status recebido:",
                    dados?.status
                );


                setSalvando(
                    true
                );


                try {

                    const resultado =
                        await atualizarCompra(
                            id,
                            dados
                        );


                    console.log(
                        "COMPRA CONTEXT: atualizarCompra() retornou:",
                        resultado
                    );


                    console.log(
                        "COMPRA CONTEXT: status retornado:",
                        resultado?.status
                    );


                    await carregarCompras();


                    return resultado;


                } catch (
                    error
                ) {

                    console.error(
                        "============================================================"
                    );


                    console.error(
                        "COMPRA CONTEXT: ERRO EM editarCompra()"
                    );


                    console.error(
                        "COMPRA CONTEXT: ID:",
                        id
                    );


                    console.error(
                        "COMPRA CONTEXT: dados:",
                        dados
                    );


                    console.error(
                        "COMPRA CONTEXT: erro:",
                        error
                    );


                    console.error(
                        "COMPRA CONTEXT: mensagem:",
                        error?.message
                    );


                    console.error(
                        "============================================================"
                    );


                    throw error;


                } finally {

                    setSalvando(
                        false
                    );

                }

            },
            [
                carregarCompras
            ]
        );


    // =========================================================
    // EXCLUIR COMPRA
    // =========================================================

    const excluir =
        useCallback(
            async (
                id
            ) => {

                console.log(
                    "============================================================"
                );


                console.log(
                    "COMPRA CONTEXT: INICIANDO excluir()"
                );


                console.log(
                    "COMPRA CONTEXT: ID recebido:",
                    id
                );


                setSalvando(
                    true
                );


                try {

                    const resultado =
                        await excluirCompra(
                            id
                        );


                    console.log(
                        "COMPRA CONTEXT: excluirCompra() retornou:",
                        resultado
                    );


                    await carregarCompras();


                    return resultado;


                } catch (
                    error
                ) {

                    console.error(
                        "============================================================"
                    );


                    console.error(
                        "COMPRA CONTEXT: ERRO EM excluir()"
                    );


                    console.error(
                        "COMPRA CONTEXT: ID:",
                        id
                    );


                    console.error(
                        "COMPRA CONTEXT: erro:",
                        error
                    );


                    console.error(
                        "COMPRA CONTEXT: mensagem:",
                        error?.message
                    );


                    console.error(
                        "============================================================"
                    );


                    throw error;


                } finally {

                    setSalvando(
                        false
                    );

                }

            },
            [
                carregarCompras
            ]
        );


    // =========================================================
    // RECEBER COMPRA
    // =========================================================

    const receberCompra =
        useCallback(
            async (
                id
            ) => {

                console.log(
                    "============================================================"
                );


                console.log(
                    "COMPRA CONTEXT: INICIANDO receberCompra()"
                );


                console.log(
                    "COMPRA CONTEXT: ID recebido:",
                    id
                );


                const compraAntes =
                    compras.find(
                        (
                            compra
                        ) =>
                            String(
                                compra?.id
                            ) ===
                            String(
                                id
                            )
                    );


                console.log(
                    "COMPRA CONTEXT: compra antes de receber:",
                    compraAntes
                );


                console.log(
                    "COMPRA CONTEXT: status antes:",
                    compraAntes?.status
                );


                setSalvando(
                    true
                );


                try {

                    const resultado =
                        await receberCompraService(
                            id
                        );


                    console.log(
                        "COMPRA CONTEXT: receberCompraService() retornou:",
                        resultado
                    );


                    await carregarCompras();


                    const compraDepois =
                        await buscarCompraPorId(
                            id
                        );


                    console.log(
                        "COMPRA CONTEXT: compra depois:",
                        compraDepois
                    );


                    console.log(
                        "COMPRA CONTEXT: status depois:",
                        compraDepois?.status
                    );


                    return resultado;


                } catch (
                    error
                ) {

                    console.error(
                        "============================================================"
                    );


                    console.error(
                        "COMPRA CONTEXT: ERRO EM receberCompra()"
                    );


                    console.error(
                        "COMPRA CONTEXT: ID:",
                        id
                    );


                    console.error(
                        "COMPRA CONTEXT: erro:",
                        error
                    );


                    console.error(
                        "COMPRA CONTEXT: código:",
                        error?.code
                    );


                    console.error(
                        "COMPRA CONTEXT: mensagem:",
                        error?.message
                    );


                    console.error(
                        "COMPRA CONTEXT: stack:",
                        error?.stack
                    );


                    console.error(
                        "============================================================"
                    );


                    throw error;


                } finally {

                    setSalvando(
                        false
                    );

                }

            },
            [
                carregarCompras,
                compras
            ]
        );


    // =========================================================
    // VALOR DO CONTEXTO
    // =========================================================

    const valor =
        useMemo(
            () => ({

                // =================================================
                // DADOS
                // =================================================

                compras,

                comprasPendentes,

                totalComprasPendentes,


                // =================================================
                // ESTADOS
                // =================================================

                carregando,

                salvando,


                // =================================================
                // FUNÇÕES
                // =================================================

                criarCompra,

                buscarPorId,

                editarCompra,

                excluir,

                receberCompra,

                carregarCompras

            }),
            [
                compras,

                comprasPendentes,

                totalComprasPendentes,

                carregando,

                salvando,

                criarCompra,

                buscarPorId,

                editarCompra,

                excluir,

                receberCompra,

                carregarCompras
            ]
        );


    // =========================================================
    // PROVIDER
    // =========================================================

    return (

        <CompraContext.Provider
            value={valor}
        >

            {children}

        </CompraContext.Provider>

    );

}


// =========================================================
// HOOK
// =========================================================

export function useCompras() {

    const contexto =
        useContext(
            CompraContext
        );


    if (
        contexto === null
    ) {

        throw new Error(
            "useCompras precisa estar dentro de CompraProvider"
        );

    }


    return contexto;

}
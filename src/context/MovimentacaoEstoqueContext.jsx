import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from "react";

import {
    registrarEntradaEstoque,
    registrarSaidaEstoque,
    listarMovimentacoesEstoque
} from "../services/estoqueService";

import { useProdutos } from "./ProdutoContext";


const MovimentacaoEstoqueContext =
    createContext(null);


export function MovimentacaoEstoqueProvider({
    children
}) {

    const {
        carregarProdutos
    } = useProdutos();


    const [
        movimentacoes,
        setMovimentacoes
    ] = useState([]);

    const [
        carregando,
        setCarregando
    ] = useState(false);

    const [
        salvando,
        setSalvando
    ] = useState(false);

    const [
        erro,
        setErro
    ] = useState(null);


    // =========================================================
    // LISTAR MOVIMENTAÇÕES
    // =========================================================

    const listarMovimentacoes =
        useCallback(
            async (filtros = {}) => {

                setCarregando(true);
                setErro(null);

                try {

                    const lista =
                        await listarMovimentacoesEstoque(
                            filtros
                        );

                    const listaSegura =
                        Array.isArray(lista)
                            ? lista
                            : [];

                    setMovimentacoes(
                        listaSegura
                    );

                    return listaSegura;

                } catch (error) {

                    console.error(
                        "Erro ao carregar movimentações:",
                        error
                    );

                    setMovimentacoes([]);
                    setErro(error);

                    throw error;

                } finally {

                    setCarregando(false);

                }

            },
            []
        );


    // =========================================================
    // REGISTRAR ENTRADA
    // =========================================================

    const registrarEntrada =
        useCallback(
            async (dados) => {

                setSalvando(true);
                setErro(null);

                try {

                    const resultado =
                        await registrarEntradaEstoque(
                            dados
                        );

                    /*
                     * O serviço já realizou a movimentação.
                     * Agora atualizamos o catálogo de produtos
                     * para refletir o novo estoque.
                     */

                    await carregarProdutos();

                    return resultado;

                } catch (error) {

                    console.error(
                        "Erro ao registrar entrada:",
                        error
                    );

                    setErro(error);

                    throw error;

                } finally {

                    setSalvando(false);

                }

            },
            [
                carregarProdutos
            ]
        );


    // =========================================================
    // REGISTRAR SAÍDA
    // =========================================================

    const registrarSaida =
        useCallback(
            async (dados) => {

                setSalvando(true);
                setErro(null);

                try {

                    const resultado =
                        await registrarSaidaEstoque(
                            dados
                        );

                    /*
                     * Atualiza os produtos após a saída.
                     */

                    await carregarProdutos();

                    return resultado;

                } catch (error) {

                    console.error(
                        "Erro ao registrar saída:",
                        error
                    );

                    setErro(error);

                    throw error;

                } finally {

                    setSalvando(false);

                }

            },
            [
                carregarProdutos
            ]
        );


    // =========================================================
    // LIMPAR ERRO
    // =========================================================

    const limparErro =
        useCallback(() => {

            setErro(null);

        }, []);


    // =========================================================
    // VALOR DO CONTEXTO
    // =========================================================

    const valor =
        useMemo(
            () => ({
                movimentacoes,
                carregando,
                salvando,
                erro,

                registrarEntrada,
                registrarSaida,
                listarMovimentacoes,
                limparErro
            }),
            [
                movimentacoes,
                carregando,
                salvando,
                erro,
                registrarEntrada,
                registrarSaida,
                listarMovimentacoes,
                limparErro
            ]
        );


    return (
        <MovimentacaoEstoqueContext.Provider
            value={valor}
        >
            {children}
        </MovimentacaoEstoqueContext.Provider>
    );
}


// =========================================================
// HOOK
// =========================================================

export function useMovimentacaoEstoque() {

    const contexto =
        useContext(
            MovimentacaoEstoqueContext
        );

    if (contexto === null) {

        throw new Error(
            "useMovimentacaoEstoque precisa estar dentro de " +
            "<MovimentacaoEstoqueProvider>"
        );

    }

    return contexto;
}
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


const EstoqueContext = createContext(null);


export function EstoqueProvider({ children }) {

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

    const listarMovimentacoes = useCallback(
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

    const registrarEntrada = useCallback(
        async (dados) => {

            setSalvando(true);
            setErro(null);

            try {

                return await registrarEntradaEstoque(
                    dados
                );

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
        []
    );


    // =========================================================
    // REGISTRAR SAÍDA
    // =========================================================

    const registrarSaida = useCallback(
        async (dados) => {

            setSalvando(true);
            setErro(null);

            try {

                return await registrarSaidaEstoque(
                    dados
                );

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
        []
    );


    // =========================================================
    // LIMPAR ERRO
    // =========================================================

    const limparErro = useCallback(() => {

        setErro(null);

    }, []);


    // =========================================================
    // VALOR DO CONTEXTO
    // =========================================================

    const valor = useMemo(
        () => ({
            movimentacoes,
            carregando,
            salvando,
            erro,

            listarMovimentacoes,

            registrarEntrada,

            registrarSaida,

            limparErro
        }),
        [
            movimentacoes,
            carregando,
            salvando,
            erro,
            listarMovimentacoes,
            registrarEntrada,
            registrarSaida,
            limparErro
        ]
    );


    return (
        <EstoqueContext.Provider value={valor}>
            {children}
        </EstoqueContext.Provider>
    );
}


// =========================================================
// HOOK
// =========================================================

export function useEstoque() {

    const contexto = useContext(
        EstoqueContext
    );

    if (contexto === null) {

        throw new Error(
            "useEstoque precisa estar dentro de <EstoqueProvider>"
        );

    }

    return contexto;
}
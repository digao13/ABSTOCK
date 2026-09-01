import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    atualizarProduto as atualizarProdutoNoBanco,
    buscarProdutoPorId,
    cadastrarProduto as cadastrarProdutoNoBanco,
    excluirProduto as excluirProdutoNoBanco,
    listarProdutos,
    observarProdutos
} from "../services/produtoService";

import { useAuth } from "./AuthContext";


const ProdutoContext = createContext(null);


export function ProdutoProvider({ children }) {

    const {
        usuario,
        carregando: carregandoAuth
    } = useAuth();


    const [produtos, setProdutos] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState(null);


    // =========================================================
    // CARREGAR PRODUTOS
    // =========================================================

    const carregarProdutos = useCallback(async () => {

        setCarregando(true);
        setErro(null);

        try {

            const listaProdutos = await listarProdutos();

            const listaSegura = Array.isArray(listaProdutos)
                ? listaProdutos
                : [];

            setProdutos(listaSegura);

            return listaSegura;

        } catch (error) {

            console.error(
                "Erro ao carregar produtos:",
                error
            );

            setErro(error);

            throw error;

        } finally {

            setCarregando(false);

        }

    }, []);


    // =========================================================
    // CARREGAMENTO INICIAL
    // =========================================================

    useEffect(() => {

        if (carregandoAuth) return undefined;

        if (!usuario) {
            setProdutos([]);
            setErro(null);
            setCarregando(false);
            return undefined;
        }

        setCarregando(true);
        return observarProdutos(
            (lista) => {
                setProdutos(Array.isArray(lista) ? lista : []);
                setCarregando(false);
            },
            (error) => {
                console.error("Erro ao acompanhar produtos:", error);
                setErro(error);
                setCarregando(false);
            }
        );
    }, [carregandoAuth, usuario]);


    // =========================================================
    // ATUALIZAR PRODUTO LOCALMENTE
    // =========================================================

    const atualizarProdutoLocal = useCallback(
        (id, dadosAtualizados) => {

            if (!id) {
                return;
            }

            setProdutos((listaAtual) =>
                listaAtual.map((produto) =>
                    produto.id === id
                        ? {
                            ...produto,
                            ...dadosAtualizados
                        }
                        : produto
                )
            );

        },
        []
    );


    // =========================================================
    // CADASTRAR PRODUTO
    // =========================================================

    const cadastrarProduto = useCallback(
        async (dadosProduto) => {

            setSalvando(true);
            setErro(null);

            try {

                const id = await cadastrarProdutoNoBanco(
                    dadosProduto
                );

                await carregarProdutos();

                return id;

            } catch (error) {

                console.error(
                    "Erro ao cadastrar produto:",
                    error
                );

                setErro(error);

                throw error;

            } finally {

                setSalvando(false);

            }

        },
        [carregarProdutos]
    );


    // =========================================================
    // ATUALIZAR PRODUTO
    // =========================================================

    const atualizarProduto = useCallback(
        async (id, dadosProduto) => {

            setSalvando(true);
            setErro(null);

            try {

                await atualizarProdutoNoBanco(
                    id,
                    dadosProduto
                );

                await carregarProdutos();

            } catch (error) {

                console.error(
                    "Erro ao atualizar produto:",
                    error
                );

                setErro(error);

                throw error;

            } finally {

                setSalvando(false);

            }

        },
        [carregarProdutos]
    );


    // =========================================================
    // EXCLUIR PRODUTO
    // =========================================================

    const excluirProduto = useCallback(
        async (id) => {

            setSalvando(true);
            setErro(null);

            try {

                await excluirProdutoNoBanco(id);

                await carregarProdutos();

            } catch (error) {

                console.error(
                    "Erro ao excluir produto:",
                    error
                );

                setErro(error);

                throw error;

            } finally {

                setSalvando(false);

            }

        },
        [carregarProdutos]
    );


    // =========================================================
    // VALOR DO CONTEXTO
    // =========================================================

    const valor = useMemo(
        () => ({
            produtos,
            carregando,
            salvando,
            erro,

            carregarProdutos,

            buscarProdutoPorId,

            cadastrarProduto,

            atualizarProduto,

            atualizarProdutoLocal,

            excluirProduto
        }),
        [
            produtos,
            carregando,
            salvando,
            erro,
            carregarProdutos,
            cadastrarProduto,
            atualizarProduto,
            atualizarProdutoLocal,
            excluirProduto
        ]
    );


    return (
        <ProdutoContext.Provider value={valor}>
            {children}
        </ProdutoContext.Provider>
    );
}


// =========================================================
// HOOK
// =========================================================

export function useProdutos() {

    const contexto = useContext(
        ProdutoContext
    );

    if (contexto === null) {

        throw new Error(
            "useProdutos precisa estar dentro de <ProdutoProvider>"
        );

    }

    return contexto;
}
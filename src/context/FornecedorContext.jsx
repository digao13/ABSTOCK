import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    atualizarFornecedor as atualizarFornecedorNoBanco,
    buscarFornecedorPorId,
    cadastrarFornecedor as cadastrarFornecedorNoBanco,
    excluirFornecedor as excluirFornecedorNoBanco,
    listarFornecedores
} from "../services/fornecedorService";

import { useAuth } from "./AuthContext";

const FornecedorContext = createContext(null);

export function FornecedorProvider({ children }) {
    const {
        usuario,
        carregando: carregandoAuth
    } = useAuth();

    const [fornecedores, setFornecedores] =
        useState([]);

    const [carregando, setCarregando] =
        useState(true);

    const [salvando, setSalvando] =
        useState(false);

    const [erro, setErro] =
        useState(null);

    const carregarFornecedores =
        useCallback(async () => {
            setCarregando(true);
            setErro(null);

            try {
                const lista =
                    await listarFornecedores();

                setFornecedores(lista);

                return lista;
            } catch (error) {
                console.error(
                    "Erro ao carregar fornecedores:",
                    error
                );

                setErro(error);

                throw error;
            } finally {
                setCarregando(false);
            }
        }, []);

    useEffect(() => {
        if (carregandoAuth) {
            return;
        }

        if (!usuario) {
            setFornecedores([]);
            setErro(null);
            setCarregando(false);
            return;
        }

        carregarFornecedores().catch(() => {});
    }, [
        carregandoAuth,
        usuario,
        carregarFornecedores
    ]);

    const cadastrarFornecedor =
        useCallback(
            async (nome) => {
                setSalvando(true);
                setErro(null);

                try {
                    const id =
                        await cadastrarFornecedorNoBanco(
                            nome
                        );

                    await carregarFornecedores();

                    return id;
                } catch (error) {
                    setErro(error);
                    throw error;
                } finally {
                    setSalvando(false);
                }
            },
            [carregarFornecedores]
        );

    const atualizarFornecedor =
        useCallback(
            async (id, nome) => {
                setSalvando(true);
                setErro(null);

                try {
                    await atualizarFornecedorNoBanco(
                        id,
                        nome
                    );

                    await carregarFornecedores();
                } catch (error) {
                    setErro(error);
                    throw error;
                } finally {
                    setSalvando(false);
                }
            },
            [carregarFornecedores]
        );

    const excluirFornecedor =
        useCallback(
            async (id) => {
                setSalvando(true);
                setErro(null);

                try {
                    await excluirFornecedorNoBanco(
                        id
                    );

                    await carregarFornecedores();
                } catch (error) {
                    setErro(error);
                    throw error;
                } finally {
                    setSalvando(false);
                }
            },
            [carregarFornecedores]
        );

    const valor = useMemo(
        () => ({
            fornecedores,
            carregando,
            salvando,
            erro,
            carregarFornecedores,
            buscarFornecedorPorId,
            cadastrarFornecedor,
            atualizarFornecedor,
            excluirFornecedor
        }),
        [
            fornecedores,
            carregando,
            salvando,
            erro,
            carregarFornecedores,
            cadastrarFornecedor,
            atualizarFornecedor,
            excluirFornecedor
        ]
    );

    return (
        <FornecedorContext.Provider value={valor}>
            {children}
        </FornecedorContext.Provider>
    );
}

export function useFornecedores() {
    const contexto =
        useContext(FornecedorContext);

    if (contexto === null) {
        throw new Error(
            "useFornecedores precisa estar dentro de <FornecedorProvider>"
        );
    }

    return contexto;
}
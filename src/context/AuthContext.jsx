import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";

import {
    auth
} from "../services/firebase";

import {
    buscarUsuarioPorUID
} from "../services/usuarioService";

const AuthContext =
    createContext(null);

// ======================================================
// ERRO - USUÁRIO BLOQUEADO
// ======================================================

function criarErroUsuarioBloqueado() {

    const erro =
        new Error(
            "Usuário bloqueado."
        );

    erro.code =
        "usuario/bloqueado";

    return erro;
}

// ======================================================
// ERRO - PERFIL NÃO ENCONTRADO
// ======================================================

function criarErroPerfilNaoEncontrado() {

    const erro =
        new Error(
            "Perfil de usuário não encontrado."
        );

    erro.code =
        "usuario/perfil-nao-encontrado";

    return erro;
}

// ======================================================
// PROVIDER
// ======================================================

export function AuthProvider({
    children
}) {

    const [
        usuario,
        setUsuario
    ] = useState(null);

    const [
        perfil,
        setPerfil
    ] = useState(null);

    const [
        carregando,
        setCarregando
    ] = useState(true);

    // ==================================================
    // OBSERVADOR DE AUTENTICAÇÃO
    // ==================================================

    useEffect(
        () => {

            console.log(
                "AUTH: iniciando observador."
            );

            const unsubscribe =
                onAuthStateChanged(
                    auth,
                    async (user) => {

                        console.log(
                            "AUTH: usuário:",
                            user
                        );

                        if (!user) {

                            setUsuario(
                                null
                            );

                            setPerfil(
                                null
                            );

                            setCarregando(
                                false
                            );

                            return;
                        }

                        setCarregando(
                            true
                        );

                        try {

                            const dadosUsuario =
                                await buscarUsuarioPorUID(
                                    user.uid
                                );

                            console.log(
                                "AUTH: perfil carregado:",
                                dadosUsuario
                            );

                            if (
                                !dadosUsuario
                            ) {

                                console.error(
                                    "AUTH: perfil não encontrado."
                                );

                                await signOut(
                                    auth
                                );

                                setUsuario(
                                    null
                                );

                                setPerfil(
                                    null
                                );

                                return;
                            }

                            if (
                                dadosUsuario.ativo === false
                            ) {

                                console.warn(
                                    "AUTH: usuário bloqueado."
                                );

                                await signOut(
                                    auth
                                );

                                setUsuario(
                                    null
                                );

                                setPerfil(
                                    null
                                );

                                return;
                            }

                            setUsuario(
                                user
                            );

                            setPerfil(
                                dadosUsuario
                            );

                        } catch (
                            error
                        ) {

                            console.error(
                                "AUTH: erro ao carregar perfil:",
                                error
                            );

                            setUsuario(
                                null
                            );

                            setPerfil(
                                null
                            );

                            try {

                                await signOut(
                                    auth
                                );

                            } catch (
                                logoutError
                            ) {

                                console.error(
                                    "AUTH: erro ao fazer logout:",
                                    logoutError
                                );
                            }

                        } finally {

                            setCarregando(
                                false
                            );
                        }
                    },

                    (error) => {

                        console.error(
                            "AUTH: erro de autenticação:",
                            error
                        );

                        setUsuario(
                            null
                        );

                        setPerfil(
                            null
                        );

                        setCarregando(
                            false
                        );
                    }
                );

            return () => {
                unsubscribe();
            };

        },
        []
    );

    // ==================================================
    // LOGIN
    // ==================================================

    async function login(
        email,
        senha
    ) {

        try {

            console.log(
                "AUTH: iniciando login..."
            );

            const resultado =
                await signInWithEmailAndPassword(
                    auth,
                    email.trim(),
                    senha
                );

            const user =
                resultado.user;

            console.log(
                "AUTH: autenticação realizada:",
                user.uid
            );

            const dadosUsuario =
                await buscarUsuarioPorUID(
                    user.uid
                );

            if (
                !dadosUsuario
            ) {

                await signOut(
                    auth
                );

                throw criarErroPerfilNaoEncontrado();
            }

            if (
                dadosUsuario.ativo === false
            ) {

                await signOut(
                    auth
                );

                throw criarErroUsuarioBloqueado();
            }

            return user;

        } catch (
            error
        ) {

            console.error(
                "AUTH: erro no login:",
                error
            );

            throw error;
        }
    }

    // ==================================================
    // CADASTRAR
    // ==================================================
    //
    // Mantido para compatibilidade.
    //
    // Para o cadastro administrativo de usuários,
    // utilizar usuarioService.criarUsuario().
    //
    // ==================================================

    async function cadastrar(
        email,
        senha
    ) {

        const resultado =
            await createUserWithEmailAndPassword(
                auth,
                email,
                senha
            );

        return resultado.user;
    }

    // ==================================================
    // LOGOUT
    // ==================================================

    async function logout() {

        try {

            await signOut(
                auth
            );

        } finally {

            setUsuario(
                null
            );

            setPerfil(
                null
            );
        }
    }

    // ==================================================
    // VALOR
    // ==================================================

    const valor = {

        usuario,

        perfil,

        carregando,

        autenticado:
            Boolean(usuario),

        login,

        cadastrar,

        logout
    };

    return (
        <AuthContext.Provider
            value={valor}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ======================================================
// HOOK
// ======================================================

export function useAuth() {

    const contexto =
        useContext(
            AuthContext
        );

    if (
        contexto === null
    ) {
        throw new Error(
            "useAuth precisa estar dentro de <AuthProvider>"
        );
    }

    return contexto;
}
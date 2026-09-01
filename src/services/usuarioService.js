import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";

import {
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";

import {
    db,
    auth,
    authSecundario
} from "./firebase";

// ======================================================
// CONSTANTES
// ======================================================

export const PERFIS_USUARIO = [
    "administrador",
    "gestor",
    "solicitante",
    "consulta"
];

// ======================================================
// VALIDAR PERFIL
// ======================================================

function validarPerfil(perfil) {

    if (!PERFIS_USUARIO.includes(perfil)) {

        throw new Error(
            "Perfil de usuário inválido."
        );
    }
}

// ======================================================
// USUÁRIO PRINCIPAL AUTENTICADO
// ======================================================

function obterUsuarioPrincipal() {

    return auth.currentUser ?? null;
}

// ======================================================
// VALIDAR ADMINISTRADOR
// ======================================================
//
// Esta validação é feita também no frontend para gerar
// mensagens mais claras.
//
// A segurança real continua nas Firestore Rules.
// ======================================================

async function validarAdministradorAtual() {

    const usuario = obterUsuarioPrincipal();

    if (!usuario) {

        throw new Error(
            "Usuário administrador não autenticado."
        );
    }

    const referencia = doc(
        db,
        "usuarios",
        usuario.uid
    );

    const snapshot = await getDoc(
        referencia
    );

    if (!snapshot.exists()) {

        throw new Error(
            "Perfil do usuário administrador não encontrado."
        );
    }

    const dados = snapshot.data();

    if (dados.ativo === false) {

        throw new Error(
            "O usuário administrador está bloqueado."
        );
    }

    if (
        dados.perfil !==
        "administrador"
    ) {

        throw new Error(
            "Somente um administrador pode executar esta operação."
        );
    }

    return {
        uid: usuario.uid,
        ...dados
    };
}

// ======================================================
// LISTAR USUÁRIOS
// ======================================================
//
// Usuários marcados como teste não aparecem.
//
// ======================================================

export async function listarUsuarios() {

    await validarAdministradorAtual();

    const referencia =
        collection(
            db,
            "usuarios"
        );

    const snapshot =
        await getDocs(
            referencia
        );

    const usuarios =
        snapshot.docs
            .map(
                (documento) => ({
                    id:
                        documento.id,

                    ...documento.data()
                })
            )
            .filter(
                (usuario) =>
                    usuario.teste !== true
            );

    usuarios.sort(
        (
            a,
            b
        ) => {

            const nomeA =
                String(
                    a.nome || ""
                ).toLocaleLowerCase(
                    "pt-BR"
                );

            const nomeB =
                String(
                    b.nome || ""
                ).toLocaleLowerCase(
                    "pt-BR"
                );

            return nomeA.localeCompare(
                nomeB,
                "pt-BR"
            );
        }
    );

    console.log(
        "USUÁRIOS CARREGADOS:",
        usuarios.length,
        usuarios
    );

    return usuarios;
}

// ======================================================
// CONTAR USUÁRIOS
// ======================================================
//
// Retorna a quantidade de usuários visíveis.
// Usuários de teste não entram na contagem.
//
// ======================================================

export async function contarUsuarios() {

    const usuarios =
        await listarUsuarios();

    return usuarios.length;
}

// ======================================================
// BUSCAR USUÁRIO POR UID
// ======================================================

export async function buscarUsuarioPorUID(
    uid
) {

    if (!uid) {
        return null;
    }

    const referencia =
        doc(
            db,
            "usuarios",
            uid
        );

    const snapshot =
        await getDoc(
            referencia
        );

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id:
            snapshot.id,

        ...snapshot.data()
    };
}

// ======================================================
// CRIAR USUÁRIO
// ======================================================
//
// O usuário é criado:
//
// 1. Firebase Authentication secundário
// 2. Firestore usuarios/{uid}
//
// O administrador continua conectado no auth principal.
//
// ======================================================

export async function criarUsuario({
    nome,
    email,
    senha,
    perfil,
    teste = false
}) {

    // --------------------------------------------------
    // Validar administrador principal
    // --------------------------------------------------

    await validarAdministradorAtual();

    // --------------------------------------------------
    // Validar dados
    // --------------------------------------------------

    const nomeNormalizado =
        String(
            nome ?? ""
        ).trim();

    const emailNormalizado =
        String(
            email ?? ""
        ).trim()
        .toLowerCase();

    if (!nomeNormalizado) {

        throw new Error(
            "Informe o nome do usuário."
        );
    }

    if (!emailNormalizado) {

        throw new Error(
            "Informe o e-mail do usuário."
        );
    }

    if (!senha) {

        throw new Error(
            "Informe uma senha."
        );
    }

    if (
        senha.length < 6
    ) {

        throw new Error(
            "A senha deve possuir pelo menos 6 caracteres."
        );
    }

    validarPerfil(
        perfil
    );

    let usuarioAuth = null;

    try {

        console.log(
            "USUÁRIO: criando conta no Authentication secundário..."
        );

        // --------------------------------------------------
        // CRIAR CONTA NO AUTH SECUNDÁRIO
        // --------------------------------------------------

        const resultado =
            await createUserWithEmailAndPassword(
                authSecundario,
                emailNormalizado,
                senha
            );

        usuarioAuth =
            resultado.user;

        console.log(
            "USUÁRIO: conta criada:",
            usuarioAuth.uid
        );

        // --------------------------------------------------
        // GARANTIR QUE O ADMIN PRINCIPAL CONTINUA LOGADO
        // --------------------------------------------------

        const administrador =
            auth.currentUser;

        if (!administrador) {

            throw new Error(
                "A sessão do administrador foi perdida durante a criação do usuário."
            );
        }

        // --------------------------------------------------
        // REFERÊNCIA DO PERFIL
        // --------------------------------------------------

        const referencia =
            doc(
                db,
                "usuarios",
                usuarioAuth.uid
            );

        // --------------------------------------------------
        // DADOS DO USUÁRIO
        // --------------------------------------------------

        const dadosUsuario = {

            nome:
                nomeNormalizado,

            email:
                emailNormalizado,

            perfil,

            ativo:
                true,

            teste:
                Boolean(teste),

            criadoEm:
                serverTimestamp(),

            atualizadoEm:
                serverTimestamp()
        };

        console.log(
            "USUÁRIO: salvando perfil no Firestore...",
            usuarioAuth.uid
        );

        // --------------------------------------------------
        // SALVAR PERFIL
        // --------------------------------------------------

        await setDoc(
            referencia,
            dadosUsuario
        );

        console.log(
            "USUÁRIO: perfil salvo com sucesso."
        );

        // --------------------------------------------------
        // DESCONECTAR AUTH SECUNDÁRIO
        // --------------------------------------------------

        try {

            await signOut(
                authSecundario
            );

        } catch (
            logoutError
        ) {

            console.warn(
                "USUÁRIO: não foi possível desconectar Auth secundário:",
                logoutError
            );
        }

        // --------------------------------------------------
        // RETORNAR USUÁRIO CRIADO
        // --------------------------------------------------

        return {

            id:
                usuarioAuth.uid,

            nome:
                nomeNormalizado,

            email:
                emailNormalizado,

            perfil,

            ativo:
                true,

            teste:
                Boolean(teste)
        };

    } catch (
        error
    ) {

        console.error(
            "USUÁRIO: erro ao criar usuário:",
            error
        );

        // --------------------------------------------------
        // Sempre tentar desconectar o Auth secundário
        // --------------------------------------------------

        try {

            await signOut(
                authSecundario
            );

        } catch {
            // Ignorar
        }

        throw error;
    }
}

// ======================================================
// EDITAR USUÁRIO
// ======================================================
//
// Não altera e-mail nem senha.
//
// ======================================================

export async function editarUsuario(
    uid,
    {
        nome,
        perfil,
        teste = false
    }
) {

    await validarAdministradorAtual();

    if (!uid) {

        throw new Error(
            "Usuário inválido."
        );
    }

    const nomeNormalizado =
        String(
            nome ?? ""
        ).trim();

    if (!nomeNormalizado) {

        throw new Error(
            "Informe o nome do usuário."
        );
    }

    validarPerfil(
        perfil
    );

    const referencia =
        doc(
            db,
            "usuarios",
            uid
        );

    await updateDoc(
        referencia,
        {
            nome:
                nomeNormalizado,

            perfil,

            teste:
                Boolean(teste),

            atualizadoEm:
                serverTimestamp()
        }
    );

    return buscarUsuarioPorUID(
        uid
    );
}

// ======================================================
// ALTERAR STATUS
// ======================================================

export async function alterarStatusUsuario(
    uid,
    ativo
) {

    await validarAdministradorAtual();

    if (!uid) {

        throw new Error(
            "Usuário inválido."
        );
    }

    const referencia =
        doc(
            db,
            "usuarios",
            uid
        );

    await updateDoc(
        referencia,
        {
            ativo:
                Boolean(ativo),

            atualizadoEm:
                serverTimestamp()
        }
    );

    return buscarUsuarioPorUID(
        uid
    );
}

// ======================================================
// EXCLUIR PERFIL DO USUÁRIO
// ======================================================
//
// Atenção:
// isso remove somente usuarios/{uid}.
// Não remove a conta do Firebase Authentication.
//
// ======================================================

export async function excluirUsuario(
    uid
) {

    await validarAdministradorAtual();

    if (!uid) {

        throw new Error(
            "Usuário inválido."
        );
    }

    const referencia =
        doc(
            db,
            "usuarios",
            uid
        );

    const usuario =
        await getDoc(
            referencia
        );

    if (!usuario.exists()) {

        throw new Error(
            "Usuário não encontrado."
        );
    }

    // Não permitimos excluir o próprio perfil
    // para evitar que o administrador perca acesso.

    if (
        auth.currentUser?.uid ===
        uid
    ) {

        throw new Error(
            "Você não pode excluir o próprio usuário."
        );
    }

    // O arquivo original não tinha deleteDoc importado.
    // A exclusão do Authentication NÃO é feita aqui.

    const {
        deleteDoc
    } = await import(
        "firebase/firestore"
    );

    await deleteDoc(
        referencia
    );

    return true;
}
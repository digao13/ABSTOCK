import {
    createContext,
    useContext,
    useMemo
} from "react";

import { useAuth } from "./AuthContext";

const PermissionContext = createContext(null);

/*
 * Permissões disponíveis no ABSTOCK.
 *
 * A nomenclatura segue:
 *
 * modulo.acao
 */

export const PERMISSOES = {
    DASHBOARD_VISUALIZAR: "dashboard.visualizar",

    ESTOQUE_VISUALIZAR: "estoque.visualizar",
    ESTOQUE_CADASTRAR: "estoque.cadastrar",
    ESTOQUE_EDITAR: "estoque.editar",
    ESTOQUE_RETIRAR: "estoque.retirar",
    ESTOQUE_EXCLUIR: "estoque.excluir",

    COMPRAS_VISUALIZAR: "compras.visualizar",
    COMPRAS_SOLICITAR: "compras.solicitar",
    COMPRAS_APROVAR: "compras.aprovar",
    COMPRAS_COMPRAR: "compras.comprar",
    COMPRAS_RECEBER: "compras.receber",
    COMPRAS_CANCELAR: "compras.cancelar",

    TAREFAS_VISUALIZAR: "tarefas.visualizar",
    TAREFAS_CRIAR: "tarefas.criar",
    TAREFAS_EDITAR: "tarefas.editar",
    TAREFAS_CONCLUIR: "tarefas.concluir",
    TAREFAS_EXCLUIR: "tarefas.excluir",

    USUARIOS_VISUALIZAR: "usuarios.visualizar",
    USUARIOS_CRIAR: "usuarios.criar",
    USUARIOS_EDITAR: "usuarios.editar",
    USUARIOS_BLOQUEAR: "usuarios.bloquear",
    USUARIOS_EXCLUIR: "usuarios.excluir",

    RELATORIOS_VISUALIZAR: "relatorios.visualizar"
};

/*
 * Permissões de cada perfil.
 *
 * O administrador possui acesso total e não precisa
 * manter uma lista manual de permissões.
 */

const PERMISSOES_POR_PERFIL = {
    administrador: "*",

    gestor: [
        PERMISSOES.DASHBOARD_VISUALIZAR,

        PERMISSOES.ESTOQUE_VISUALIZAR,
        PERMISSOES.ESTOQUE_CADASTRAR,
        PERMISSOES.ESTOQUE_EDITAR,
        PERMISSOES.ESTOQUE_RETIRAR,

        PERMISSOES.COMPRAS_VISUALIZAR,
        PERMISSOES.COMPRAS_SOLICITAR,
        PERMISSOES.COMPRAS_APROVAR,
        PERMISSOES.COMPRAS_COMPRAR,
        PERMISSOES.COMPRAS_RECEBER,
        PERMISSOES.COMPRAS_CANCELAR,

        PERMISSOES.TAREFAS_VISUALIZAR,
        PERMISSOES.TAREFAS_CRIAR,
        PERMISSOES.TAREFAS_EDITAR,
        PERMISSOES.TAREFAS_CONCLUIR,

        PERMISSOES.RELATORIOS_VISUALIZAR
    ],

    solicitante: [
        PERMISSOES.DASHBOARD_VISUALIZAR,

        PERMISSOES.ESTOQUE_VISUALIZAR,

        PERMISSOES.COMPRAS_VISUALIZAR,
        PERMISSOES.COMPRAS_SOLICITAR,

        PERMISSOES.TAREFAS_VISUALIZAR,
        PERMISSOES.TAREFAS_CRIAR,
        PERMISSOES.TAREFAS_EDITAR,
        PERMISSOES.TAREFAS_CONCLUIR
    ],

    consulta: [
        PERMISSOES.DASHBOARD_VISUALIZAR,

        PERMISSOES.ESTOQUE_VISUALIZAR,

        PERMISSOES.COMPRAS_VISUALIZAR,

        PERMISSOES.TAREFAS_VISUALIZAR,

        PERMISSOES.RELATORIOS_VISUALIZAR
    ]
};

export function PermissionProvider({ children }) {
    const {
        perfil,
        carregando
    } = useAuth();

    const perfilNome = perfil?.perfil || null;

    const permissoes = useMemo(() => {
        if (!perfilNome) {
            return [];
        }

        const permissoesPerfil =
            PERMISSOES_POR_PERFIL[perfilNome];

        if (permissoesPerfil === "*") {
            return "*";
        }

        return permissoesPerfil || [];
    }, [perfilNome]);

    function temPermissao(permissao) {
        if (carregando) {
            return false;
        }

        if (!permissao) {
            return false;
        }

        if (permissoes === "*") {
            return true;
        }

        return permissoes.includes(permissao);
    }

    function temAlgumaPermissao(listaPermissoes) {
        if (carregando) {
            return false;
        }

        if (!Array.isArray(listaPermissoes)) {
            return false;
        }

        if (permissoes === "*") {
            return true;
        }

        return listaPermissoes.some((permissao) =>
            permissoes.includes(permissao)
        );
    }

    function temTodasPermissoes(listaPermissoes) {
        if (carregando) {
            return false;
        }

        if (!Array.isArray(listaPermissoes)) {
            return false;
        }

        if (permissoes === "*") {
            return true;
        }

        return listaPermissoes.every((permissao) =>
            permissoes.includes(permissao)
        );
    }

    const valor = {
        perfil,
        perfilNome,
        permissoes,
        temPermissao,
        temAlgumaPermissao,
        temTodasPermissoes
    };

    return (
        <PermissionContext.Provider value={valor}>
            {children}
        </PermissionContext.Provider>
    );
}

export function usePermissions() {
    const contexto = useContext(PermissionContext);

    if (contexto === null) {
        throw new Error(
            "usePermissions precisa estar dentro de <PermissionProvider>"
        );
    }

    return contexto;
}
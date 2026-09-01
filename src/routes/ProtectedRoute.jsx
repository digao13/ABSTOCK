import { Navigate, Outlet, useLocation } from "react-router-dom";

import {
    Box,
    CircularProgress
} from "@mui/material";

import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../context/PermissionContext";

export default function ProtectedRoute({
    permissao
}) {
    const {
        usuario,
        perfil,
        carregando
    } = useAuth();

    const {
        temPermissao
    } = usePermissions();

    const location = useLocation();

    if (carregando) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!usuario) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname
                }}
            />
        );
    }

    if (!perfil) {
        return (
            <Navigate
                to="/acesso-negado"
                replace
            />
        );
    }

    if (perfil.ativo !== true) {
        return (
            <Navigate
                to="/acesso-negado"
                replace
                state={{
                    motivo: "usuario-inativo"
                }}
            />
        );
    }

    if (
        permissao &&
        !temPermissao(permissao)
    ) {
        return (
            <Navigate
                to="/acesso-negado"
                replace
            />
        );
    }

    return <Outlet />;
}
import { useNavigate } from "react-router-dom";

import {
    Box,
    Button,
    Paper,
    Typography
} from "@mui/material";

import BlockIcon from "@mui/icons-material/Block";

export default function AcessoNegado() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    maxWidth: 500,
                    width: "100%",
                    p: 5,
                    textAlign: "center",
                    borderRadius: 3
                }}
            >
                <BlockIcon
                    sx={{
                        fontSize: 70,
                        mb: 2
                    }}
                />

                <Typography
                    variant="h4"
                    fontWeight={700}
                    gutterBottom
                >
                    Acesso negado
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        mb: 3
                    }}
                >
                    Você não possui permissão para
                    acessar esta área do sistema.
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => navigate("/")}
                >
                    Voltar ao Dashboard
                </Button>
            </Paper>
        </Box>
    );
}
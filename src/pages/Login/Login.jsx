import { useState } from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography
} from "@mui/material";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import { useAuth }
    from "../../context/AuthContext";


export default function Login() {

    const { login } =
        useAuth();


    const navigate =
        useNavigate();


    const location =
        useLocation();


    const [email, setEmail] =
        useState("");


    const [senha, setSenha] =
        useState("");


    const [erro, setErro] =
        useState("");


    const [carregando, setCarregando] =
        useState(false);

    const [mostrarSenha, setMostrarSenha] = useState(false);


    // ======================================================
    // REALIZAR LOGIN
    // ======================================================

    async function handleSubmit(event) {

        event.preventDefault();


        setErro("");


        // ==================================================
        // VALIDAÇÃO
        // ==================================================

        if (
            !email.trim() ||
            !senha
        ) {

            setErro(
                "Informe o e-mail e a senha."
            );

            return;
        }


        try {

            setCarregando(true);


            // ==============================================
            // LOGIN
            // ==============================================
            //
            // O AuthContext verifica:
            //
            // - Authentication
            // - Perfil no Firestore
            // - ativo
            //
            // ==============================================

            await login(
                email.trim(),
                senha
            );


            // ==============================================
            // DESTINO
            // ==============================================

            const destino =
                location.state?.from?.pathname ||
                "/";


            navigate(
                destino,
                {
                    replace: true
                }
            );


        } catch (error) {

            console.error(
                "Erro ao realizar login:",
                error
            );


            // =================================================
            // USUÁRIO BLOQUEADO
            // =================================================

            if (
                error?.code ===
                "usuario/bloqueado"
            ) {

                setErro(
                    "Usuário bloqueado. Entre em contato com o administrador do sistema."
                );

                return;
            }


            // =================================================
            // PERFIL NÃO ENCONTRADO
            // =================================================

            if (
                error?.code ===
                "usuario/perfil-nao-encontrado"
            ) {

                setErro(
                    "Seu usuário não possui um perfil cadastrado no sistema. Entre em contato com o administrador."
                );

                return;
            }


            // =================================================
            // ERROS DO FIREBASE AUTHENTICATION
            // =================================================

            switch (
                error?.code
            ) {

                case "auth/invalid-credential":

                case "auth/wrong-password":

                case "auth/user-not-found":

                    setErro(
                        "E-mail ou senha inválidos."
                    );

                    break;


                case "auth/too-many-requests":

                    setErro(
                        "Muitas tentativas. Aguarde alguns minutos e tente novamente."
                    );

                    break;


                case "auth/user-disabled":

                    setErro(
                        "Este usuário está desativado no Firebase Authentication."
                    );

                    break;


                case "auth/invalid-email":

                    setErro(
                        "O e-mail informado é inválido."
                    );

                    break;


                default:

                    setErro(
                        "Não foi possível realizar o login. Tente novamente."
                    );

                    break;
            }

        } finally {

            setCarregando(false);
        }
    }


    // ======================================================
    // RENDER
    // ======================================================

    return (

        <Box
            sx={{
                minHeight: "100vh",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                bgcolor: "#0f1115",
                color: "#f5f7fa",

                p: 2
            }}
        >

            <Paper
                elevation={0}
                sx={{
                    width: "100%",

                    maxWidth: 420,

                    p: 4,

                    borderRadius: 3,
                    backgroundColor: "#1a1d23",
                    border: "1px solid #303640",
                    color: "#f5f7fa",
                    boxShadow: "0 24px 70px rgba(0,0,0,.38)"
                }}
            >

                {/* =========================================
                    CABEÇALHO
                ========================================== */}

                <Box
                    sx={{
                        display: "flex",

                        flexDirection:
                            "column",

                        alignItems:
                            "center",

                        mb: 3
                    }}
                >

                    <Box
                        sx={{
                            width: 64,

                            height: 64,

                            borderRadius: 2,

                            display: "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            background: "linear-gradient(135deg, #ff7a00, #ff9b3d)",
                            color: "#17191e",
                            boxShadow: "0 10px 24px rgba(255,122,0,.24)",

                            mb: 2
                        }}
                    ><Box component="img" src="/logo.png" alt="ABSTOCK" sx={{ width: 150, height: 72, objectFit: "contain" }} />

                    </Box>


                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        ABSTOCK
                    </Typography>


                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5
                        }}
                    >
                        Controle de estoque e compras
                    </Typography>

                </Box>


                {/* =========================================
                    FORMULÁRIO
                ========================================== */}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                >

                    {/* =====================================
                        E-MAIL
                    ====================================== */}

                    <TextField
                        fullWidth
                        label="E-mail"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target.value
                            )
                        }
                        margin="normal"
                        autoComplete="email"
                        autoFocus
                        disabled={carregando}
                    />


                    {/* =====================================
                        SENHA
                    ====================================== */}

                    <TextField
                        fullWidth
                        label="Senha"
                        type={mostrarSenha ? "text" : "password"}
                        value={senha}
                        onChange={(event) =>
                            setSenha(
                                event.target.value
                            )
                        }
                        margin="normal"
                        autoComplete="current-password"
                        disabled={carregando}
                            InputProps={{ endAdornment: <InputAdornment position="end"><IconButton size="small" onClick={() => setMostrarSenha((valor) => !valor)} edge="end" aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>{mostrarSenha ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment> }}/>


                    {/* =====================================
                        MENSAGEM DE ERRO
                    ====================================== */}

                    {erro && (

                        <Alert
                            severity="error"
                            sx={{
                                mt: 2
                            }}
                        >
                            {erro}
                        </Alert>

                    )}


                    {/* =====================================
                        BOTÃO ENTRAR
                    ====================================== */}

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={carregando}
                        sx={{
                            mt: 3,

                            py: 1.4,

                            fontWeight: 600
                        }}
                    >

                        {carregando ? (

                            <CircularProgress
                                size={24}
                                color="inherit"
                            />

                        ) : (

                            "Entrar"

                        )}

                    </Button>

                </Box>

            </Paper>

        </Box>
    );
}
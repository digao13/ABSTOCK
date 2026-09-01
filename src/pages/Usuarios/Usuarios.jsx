
import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

import {
    usePermissions,
    PERMISSOES
} from "../../context/PermissionContext";

import {
    listarUsuarios,
    criarUsuario,
    editarUsuario,
    alterarStatusUsuario
} from "../../services/usuarioService";


export default function Usuarios() {

    // ======================================================
    // PERMISSÕES
    // ======================================================

    const {
        temPermissao
    } = usePermissions();


    const podeVisualizar =
        temPermissao(
            PERMISSOES.USUARIOS_VISUALIZAR
        );


    const podeCriar =
        temPermissao(
            PERMISSOES.USUARIOS_CRIAR
        );


    const podeEditar =
        temPermissao(
            PERMISSOES.USUARIOS_EDITAR
        );


    const podeBloquear =
        temPermissao(
            PERMISSOES.USUARIOS_BLOQUEAR
        );


    // ======================================================
    // ESTADOS
    // ======================================================

    const [usuarios, setUsuarios] =
        useState([]);


    const [carregando, setCarregando] =
        useState(true);


    const [erro, setErro] =
        useState("");


    const [sucesso, setSucesso] =
        useState("");


    const [dialogAberto, setDialogAberto] =
        useState(false);


    const [modoEdicao, setModoEdicao] =
        useState(false);


    const [usuarioEditando, setUsuarioEditando] =
        useState(null);


    const [salvando, setSalvando] =
        useState(false);


    // ======================================================
    // FORMULÁRIO INICIAL
    // ======================================================

    const formularioInicial = {
        nome: "",
        email: "",
        senha: "",
        perfil: "consulta",
        teste: false
    };


    const [formulario, setFormulario] =
        useState(formularioInicial);


    // ======================================================
    // PERFIS
    // ======================================================

    const perfis = [
        {
            valor: "administrador",
            nome: "Administrador",
            descricao:
                "Acesso completo ao sistema."
        },
        {
            valor: "gestor",
            nome: "Gestor",
            descricao:
                "Gerencia estoque, compras, tarefas e relatórios."
        },
        {
            valor: "solicitante",
            nome: "Solicitante",
            descricao:
                "Pode consultar estoque e solicitar compras."
        },
        {
            valor: "consulta",
            nome: "Consulta",
            descricao:
                "Acesso somente para consulta."
        }
    ];


    // ======================================================
    // CARREGAR USUÁRIOS
    // ======================================================

    async function carregarUsuarios() {

        if (!podeVisualizar) {

            setCarregando(false);

            return;
        }


        try {

            setErro("");

            setCarregando(true);


            const lista =
                await listarUsuarios();


            setUsuarios(
                Array.isArray(lista)
                    ? lista
                    : []
            );

        } catch (error) {

            console.error(
                "Erro ao carregar usuários:",
                error
            );


            setErro(
                error?.message ||
                "Não foi possível carregar os usuários."
            );


            setUsuarios([]);

        } finally {

            setCarregando(false);
        }
    }


    // ======================================================
    // CARGA INICIAL
    // ======================================================

    useEffect(() => {

        carregarUsuarios();

    }, [podeVisualizar]);


    // ======================================================
    // ABRIR CADASTRO
    // ======================================================

    function abrirCadastro() {

        setErro("");

        setSucesso("");

        setModoEdicao(false);

        setUsuarioEditando(null);


        setFormulario({
            ...formularioInicial
        });


        setDialogAberto(true);
    }


    // ======================================================
    // ABRIR EDIÇÃO
    // ======================================================

    function abrirEdicao(usuario) {

        setErro("");

        setSucesso("");

        setModoEdicao(true);

        setUsuarioEditando(usuario);


        setFormulario({
            nome:
                usuario.nome || "",

            email:
                usuario.email || "",

            senha:
                "",

            perfil:
                usuario.perfil || "consulta",

            teste:
                usuario.teste === true
        });


        setDialogAberto(true);
    }


    // ======================================================
    // FECHAR DIALOG
    // ======================================================

    function fecharDialog() {

        if (salvando) {
            return;
        }


        setDialogAberto(false);

        setModoEdicao(false);

        setUsuarioEditando(null);


        setFormulario({
            ...formularioInicial
        });
    }


    // ======================================================
    // ALTERAR CAMPO
    // ======================================================

    function alterarCampo(
        campo,
        valor
    ) {

        setFormulario(
            (anterior) => ({
                ...anterior,
                [campo]: valor
            })
        );
    }


    // ======================================================
    // SALVAR USUÁRIO
    // ======================================================

    async function salvarUsuario() {

        setErro("");

        setSucesso("");


        // ==================================================
        // VALIDAÇÃO DO NOME
        // ==================================================

        if (!formulario.nome.trim()) {

            setErro(
                "Informe o nome do usuário."
            );

            return;
        }


        // ==================================================
        // VALIDAÇÃO DO E-MAIL
        // ==================================================

        if (!formulario.email.trim()) {

            setErro(
                "Informe o e-mail do usuário."
            );

            return;
        }


        // ==================================================
        // VALIDAÇÃO DA SENHA
        // ==================================================

        if (
            !modoEdicao &&
            !formulario.senha
        ) {

            setErro(
                "Informe uma senha."
            );

            return;
        }


        if (
            !modoEdicao &&
            formulario.senha.length < 6
        ) {

            setErro(
                "A senha deve possuir pelo menos 6 caracteres."
            );

            return;
        }


        // ==================================================
        // VALIDAÇÃO DO PERFIL
        // ==================================================

        if (!formulario.perfil) {

            setErro(
                "Selecione o perfil do usuário."
            );

            return;
        }


        try {

            setSalvando(true);


            // ==================================================
            // EDIÇÃO
            // ==================================================

            if (modoEdicao) {

                await editarUsuario(
                    usuarioEditando.id,
                    {
                        nome:
                            formulario.nome,

                        perfil:
                            formulario.perfil,

                        teste:
                            formulario.teste
                    }
                );


                setSucesso(
                    "Usuário atualizado com sucesso."
                );


            } else {

                // ==================================================
                // CRIAÇÃO
                // ==================================================

                await criarUsuario({
                    nome:
                        formulario.nome,

                    email:
                        formulario.email,

                    senha:
                        formulario.senha,

                    perfil:
                        formulario.perfil,

                    teste:
                        formulario.teste
                });


                setSucesso(
                    "Usuário criado com sucesso."
                );
            }


            // ==================================================
            // FECHAR DIALOG
            // ==================================================

            setDialogAberto(false);

            setModoEdicao(false);

            setUsuarioEditando(null);


            setFormulario({
                ...formularioInicial
            });


            // ==================================================
            // RECARREGAR LISTA
            // ==================================================

            await carregarUsuarios();


        } catch (error) {

            console.error(
                "Erro ao salvar usuário:",
                error
            );


            let mensagem =
                "Não foi possível salvar o usuário.";


            switch (error?.code) {

                case "auth/email-already-in-use":

                    mensagem =
                        "Este e-mail já está cadastrado.";

                    break;


                case "auth/invalid-email":

                    mensagem =
                        "O e-mail informado é inválido.";

                    break;


                case "auth/weak-password":

                    mensagem =
                        "A senha informada é muito fraca.";

                    break;


                case "auth/operation-not-allowed":

                    mensagem =
                        "O login por e-mail e senha não está habilitado no Firebase Authentication.";

                    break;


                case "permission-denied":

                    mensagem =
                        "Você não possui permissão para realizar esta operação.";

                    break;


                default:

                    if (error?.message) {

                        mensagem =
                            error.message;
                    }
            }


            setErro(mensagem);


        } finally {

            setSalvando(false);
        }
    }


    // ======================================================
    // ALTERAR STATUS
    // ======================================================

    async function alterarStatus(usuario) {

        if (!podeBloquear) {
            return;
        }


        setErro("");

        setSucesso("");


        const estaAtivo =
            usuario.ativo !== false;


        const mensagem =
            estaAtivo
                ? `Deseja bloquear o usuário "${usuario.nome}"?`
                : `Deseja desbloquear o usuário "${usuario.nome}"?`;


        const confirmar =
            window.confirm(
                mensagem
            );


        if (!confirmar) {
            return;
        }


        try {

            setCarregando(true);


            await alterarStatusUsuario(
                usuario.id,
                !estaAtivo
            );


            setSucesso(
                estaAtivo
                    ? "Usuário bloqueado com sucesso."
                    : "Usuário desbloqueado com sucesso."
            );


            await carregarUsuarios();


        } catch (error) {

            console.error(
                "Erro ao alterar status:",
                error
            );


            setErro(
                error?.message ||
                "Não foi possível alterar o status do usuário."
            );


        } finally {

            setCarregando(false);
        }
    }


    // ======================================================
    // PERFIL - LABEL
    // ======================================================

    function obterPerfilLabel(perfil) {

        const encontrado =
            perfis.find(
                (item) =>
                    item.valor === perfil
            );


        return encontrado
            ? encontrado.nome
            : perfil || "-";
    }


    // ======================================================
    // PERFIL - COR
    // ======================================================

    function obterCorPerfil(perfil) {

        switch (perfil) {

            case "administrador":
                return "error";

            case "gestor":
                return "warning";

            case "solicitante":
                return "primary";

            case "consulta":
                return "default";

            default:
                return "default";
        }
    }


    // ======================================================
    // PERMISSÃO DE VISUALIZAÇÃO
    // ======================================================

    if (!podeVisualizar) {

        return (
            <Box>

                <Alert severity="error">

                    Você não possui permissão para
                    visualizar os usuários.

                </Alert>

            </Box>
        );
    }


    // ======================================================
    // RENDER
    // ======================================================

    return (

        <Box>

            {/* ==================================================
                CABEÇALHO
            ================================================== */}

            <Stack
                direction={{
                    xs: "column",
                    sm: "row"
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "flex-start",
                    sm: "center"
                }}
                spacing={2}
                sx={{
                    mb: 3
                }}
            >

                <Box>

                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        <PeopleAltOutlinedIcon sx={{ fontSize: 48, color: "#ff9b3d", verticalAlign: "middle", mr: 1 }} />Usuários
                    </Typography>


                    <Typography
                        color="text.secondary"
                    >
                        Cadastre e gerencie os usuários
                        e seus perfis de acesso.
                    </Typography>

                </Box>


                <Stack
                    direction="row"
                    spacing={1}
                >

                    <Button
                        variant="outlined"
                        startIcon={
                            carregando ? (
                                <CircularProgress
                                    size={18}
                                />
                            ) : (
                                <RefreshIcon />
                            )
                        }
                        onClick={
                            carregarUsuarios
                        }
                        disabled={
                            carregando
                        }
                    >
                        {
                            carregando
                                ? "Atualizando..."
                                : "Atualizar"
                        }
                    </Button>


                    {podeCriar && (

                        <Button
                            variant="contained"
                            startIcon={
                                <AddIcon />
                            }
                            onClick={
                                abrirCadastro
                            }
                        >
                            Novo usuário
                        </Button>

                    )}

                </Stack>

            </Stack>


            {/* ==================================================
                MENSAGEM DE ERRO
            ================================================== */}

            {erro && (

                <Alert
                    severity="error"
                    sx={{
                        mb: 2
                    }}
                    onClose={() =>
                        setErro("")
                    }
                >
                    {erro}
                </Alert>

            )}


            {/* ==================================================
                MENSAGEM DE SUCESSO
            ================================================== */}

            {sucesso && (

                <Alert
                    severity="success"
                    sx={{
                        mb: 2
                    }}
                    onClose={() =>
                        setSucesso("")
                    }
                >
                    {sucesso}
                </Alert>

            )}


            {/* ==================================================
                RESUMO
            ================================================== */}

            <Stack
                direction={{
                    xs: "column",
                    sm: "row"
                }}
                spacing={2}
                sx={{
                    mb: 2
                }}
            >

                <Paper
                    sx={{
                        p: 2,
                        flex: 1
                    }}
                >

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Total de usuários
                    </Typography>


                    <Typography
                        variant="h5"
                        fontWeight={700}
                    >
                        {usuarios.length}
                    </Typography>

                </Paper>


                <Paper
                    sx={{
                        p: 2,
                        flex: 1
                    }}
                >

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Usuários ativos
                    </Typography>


                    <Typography
                        variant="h5"
                        fontWeight={700}
                        color="success.main"
                    >
                        {
                            usuarios.filter(
                                (usuario) =>
                                    usuario.ativo !== false
                            ).length
                        }
                    </Typography>

                </Paper>


                <Paper
                    sx={{
                        p: 2,
                        flex: 1
                    }}
                >

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Usuários bloqueados
                    </Typography>


                    <Typography
                        variant="h5"
                        fontWeight={700}
                        color="error.main"
                    >
                        {
                            usuarios.filter(
                                (usuario) =>
                                    usuario.ativo === false
                            ).length
                        }
                    </Typography>

                </Paper>

            </Stack>


            {/* ==================================================
                TABELA
            ================================================== */}

            <Paper>

                {carregando ? (

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            py: 8
                        }}
                    >

                        <CircularProgress />

                    </Box>

                ) : usuarios.length === 0 ? (

                    <Box
                        sx={{
                            py: 8,
                            px: 2,
                            textAlign: "center"
                        }}
                    >

                        <Typography
                            variant="h6"
                            gutterBottom
                        >
                            Nenhum usuário encontrado
                        </Typography>


                        <Typography
                            color="text.secondary"
                        >
                            Ainda não existem usuários
                            cadastrados.
                        </Typography>


                        {podeCriar && (

                            <Button
                                variant="contained"
                                startIcon={
                                    <AddIcon />
                                }
                                sx={{
                                    mt: 2
                                }}
                                onClick={
                                    abrirCadastro
                                }
                            >
                                Cadastrar primeiro usuário
                            </Button>

                        )}

                    </Box>

                ) : (

                    <TableContainer>

                        <Table
                            size="small"
                            sx={{
                                minWidth: 850
                            }}
                        >

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        Nome
                                    </TableCell>


                                    <TableCell>
                                        E-mail
                                    </TableCell>


                                    <TableCell>
                                        Perfil
                                    </TableCell>


                                    <TableCell>
                                        Status
                                    </TableCell>


                                    <TableCell
                                        align="right"
                                    >
                                        Ações
                                    </TableCell>

                                </TableRow>

                            </TableHead>


                            <TableBody>

                                {usuarios.map(
                                    (usuario) => {

                                        const ativo =
                                            usuario.ativo !== false;


                                        return (

                                            <TableRow
                                                key={
                                                    usuario.id
                                                }
                                                hover
                                            >

                                                {/* NOME */}

                                                <TableCell>

                                                    <Typography
                                                        fontWeight={600}
                                                    >
                                                        {
                                                            usuario.nome ||
                                                            "-"
                                                        }
                                                    </Typography>

                                                </TableCell>


                                                {/* EMAIL */}

                                                <TableCell>

                                                    {
                                                        usuario.email ||
                                                        "-"
                                                    }

                                                </TableCell>


                                                {/* PERFIL */}

                                                <TableCell>

                                                    <Chip
                                                        size="small"
                                                        label={
                                                            obterPerfilLabel(
                                                                usuario.perfil
                                                            )
                                                        }
                                                        color={
                                                            obterCorPerfil(
                                                                usuario.perfil
                                                            )
                                                        }
                                                    />

                                                </TableCell>


                                                {/* STATUS */}

                                                <TableCell>

                                                    <Chip
                                                        size="small"
                                                        label={
                                                            ativo
                                                                ? "Ativo"
                                                                : "Bloqueado"
                                                        }
                                                        color={
                                                            ativo
                                                                ? "success"
                                                                : "error"
                                                        }
                                                        variant={
                                                            ativo
                                                                ? "outlined"
                                                                : "filled"
                                                        }
                                                    />

                                                </TableCell>


                                                {/* AÇÕES */}

                                                <TableCell
                                                    align="right"
                                                >

                                                    <Stack
                                                        direction="row"
                                                        spacing={0.5}
                                                        justifyContent="flex-end"
                                                    >

                                                        {podeEditar && (

                                                            <Tooltip
                                                                title="Editar usuário"
                                                            >

                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() =>
                                                                        abrirEdicao(
                                                                            usuario
                                                                        )
                                                                    }
                                                                >

                                                                    <EditOutlinedIcon fontSize="small" />

                                                                </IconButton>

                                                            </Tooltip>

                                                        )}


                                                        {podeBloquear && (

                                                            <Tooltip
                                                                title={
                                                                    ativo
                                                                        ? "Bloquear usuário"
                                                                        : "Desbloquear usuário"
                                                                }
                                                            >

                                                                <IconButton
                                                                    size="small"
                                                                    color={
                                                                        ativo
                                                                            ? "error"
                                                                            : "success"
                                                                    }
                                                                    onClick={() =>
                                                                        alterarStatus(
                                                                            usuario
                                                                        )
                                                                    }
                                                                >

                                                                    {
                                                                        ativo ? (
                                                                            <BlockIcon />
                                                                        ) : (
                                                                            <CheckCircleIcon />
                                                                        )
                                                                    }

                                                                </IconButton>

                                                            </Tooltip>

                                                        )}

                                                    </Stack>

                                                </TableCell>

                                            </TableRow>

                                        );
                                    }
                                )}

                            </TableBody>

                        </Table>

                    </TableContainer>

                )}

            </Paper>


            {/* ==================================================
                DIALOG DE CADASTRO / EDIÇÃO
            ================================================== */}

            <Dialog
                open={dialogAberto}
                onClose={
                    salvando
                        ? undefined
                        : fecharDialog
                }
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>

                    {
                        modoEdicao
                            ? "Editar usuário"
                            : "Novo usuário"
                    }

                </DialogTitle>


                <DialogContent>

                    <Stack
                        spacing={2}
                        sx={{
                            mt: 1
                        }}
                    >

                        {/* ==================================================
                            NOME
                        ================================================== */}

                        <TextField
                            fullWidth
                            label="Nome"
                            value={
                                formulario.nome
                            }
                            onChange={(event) =>
                                alterarCampo(
                                    "nome",
                                    event.target.value
                                )
                            }
                            disabled={
                                salvando
                            }
                            autoFocus
                        />


                        {/* ==================================================
                            EMAIL
                        ================================================== */}

                        <TextField
                            fullWidth
                            label="E-mail"
                            type="email"
                            value={
                                formulario.email
                            }
                            onChange={(event) =>
                                alterarCampo(
                                    "email",
                                    event.target.value
                                )
                            }
                            disabled={
                                salvando ||
                                modoEdicao
                            }
                            helperText={
                                modoEdicao
                                    ? "O e-mail não pode ser alterado nesta tela."
                                    : "Será utilizado para entrar no sistema."
                            }
                        />


                        {/* ==================================================
                            SENHA
                        ================================================== */}

                        {!modoEdicao && (

                            <TextField
                                fullWidth
                                label="Senha"
                                type="password"
                                value={
                                    formulario.senha
                                }
                                onChange={(event) =>
                                    alterarCampo(
                                        "senha",
                                        event.target.value
                                    )
                                }
                                disabled={
                                    salvando
                                }
                                helperText="Mínimo de 6 caracteres."
                            />

                        )}


                        {/* ==================================================
                            PERFIL
                        ================================================== */}

                        <FormControl
                            fullWidth
                        >

                            <InputLabel
                                id="perfil-usuario-label"
                            >
                                Perfil
                            </InputLabel>


                            <Select
                                labelId="perfil-usuario-label"
                                value={
                                    formulario.perfil
                                }
                                label="Perfil"
                                onChange={(event) =>
                                    alterarCampo(
                                        "perfil",
                                        event.target.value
                                    )
                                }
                                disabled={
                                    salvando
                                }
                            >

                                {perfis.map(
                                    (perfil) => (

                                        <MenuItem
                                            key={
                                                perfil.valor
                                            }
                                            value={
                                                perfil.valor
                                            }
                                        >

                                            <Box>

                                                <Typography>
                                                    {
                                                        perfil.nome
                                                    }
                                                </Typography>


                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {
                                                        perfil.descricao
                                                    }
                                                </Typography>

                                            </Box>

                                        </MenuItem>

                                    )
                                )}

                            </Select>

                        </FormControl>


                        {/* ==================================================
                            USUÁRIO DE TESTE
                        ================================================== */}

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 1.5
                            }}
                        >

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={
                                            formulario.teste
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            alterarCampo(
                                                "teste",
                                                event.target.checked
                                            )
                                        }
                                        disabled={
                                            salvando
                                        }
                                    />
                                }
                                label="Usuário de teste"
                            />


                            <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{
                                    ml: 4
                                }}
                            >
                                Usuários de teste não aparecem
                                na lista normal de usuários.
                                A conta continua existindo no
                                Firebase Authentication e no
                                Firestore.
                            </Typography>

                        </Paper>


                        {/* ==================================================
                            AVISO DE EDIÇÃO
                        ================================================== */}

                        {modoEdicao && (

                            <Alert
                                severity="info"
                            >
                                Ao editar o usuário, você poderá
                                alterar o nome, o perfil e a
                                configuração de usuário de teste.
                                A senha e o e-mail continuam
                                vinculados à conta de autenticação.
                            </Alert>

                        )}

                    </Stack>

                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={
                            fecharDialog
                        }
                        disabled={
                            salvando
                        }
                    >
                        Cancelar
                    </Button>


                    <Button
                        variant="contained"
                        onClick={
                            salvarUsuario
                        }
                        disabled={
                            salvando
                        }
                        startIcon={
                            salvando ? (
                                <CircularProgress
                                    size={18}
                                    color="inherit"
                                />
                            ) : null
                        }
                    >

                        {
                            salvando
                                ? "Salvando..."
                                : modoEdicao
                                    ? "Salvar alterações"
                                    : "Criar usuário"
                        }

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>
    );
}

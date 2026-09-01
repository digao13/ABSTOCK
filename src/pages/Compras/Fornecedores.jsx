import { useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { useFornecedores } from "../../context/FornecedorContext";

export default function Fornecedores() {
    const {
        fornecedores,
        carregando,
        salvando,
        cadastrarFornecedor,
        atualizarFornecedor,
        excluirFornecedor
    } = useFornecedores();

    const [pesquisa, setPesquisa] =
        useState("");

    const [dialogAberto, setDialogAberto] =
        useState(false);

    const [dialogExclusaoAberto, setDialogExclusaoAberto] =
        useState(false);

    const [fornecedorSelecionado, setFornecedorSelecionado] =
        useState(null);

    const [nome, setNome] =
        useState("");

    const [erro, setErro] =
        useState(null);

    const fornecedoresFiltrados = useMemo(() => {
        const termo = pesquisa
            .trim()
            .toLowerCase();

        if (!termo) {
            return fornecedores;
        }

        return fornecedores.filter(
            (fornecedor) =>
                String(fornecedor.nome ?? "")
                    .toLowerCase()
                    .includes(termo)
        );
    }, [fornecedores, pesquisa]);

    function abrirNovoFornecedor() {
        setFornecedorSelecionado(null);
        setNome("");
        setErro(null);
        setDialogAberto(true);
    }

    function abrirEdicao(fornecedor) {
        setFornecedorSelecionado(fornecedor);
        setNome(fornecedor.nome ?? "");
        setErro(null);
        setDialogAberto(true);
    }

    function fecharDialog() {
        if (salvando) {
            return;
        }

        setDialogAberto(false);
        setFornecedorSelecionado(null);
        setNome("");
        setErro(null);
    }

    async function salvar() {
        const nomeNormalizado =
            nome.trim();

        if (!nomeNormalizado) {
            setErro(
                "Informe o nome do fornecedor."
            );

            return;
        }

        setErro(null);

        try {
            if (fornecedorSelecionado) {
                await atualizarFornecedor(
                    fornecedorSelecionado.id,
                    nomeNormalizado
                );
            } else {
                await cadastrarFornecedor(
                    nomeNormalizado
                );
            }

            fecharDialog();
        } catch (error) {
            console.error(
                "Erro ao salvar fornecedor:",
                error
            );

            setErro(
                error?.message ||
                    "Não foi possível salvar o fornecedor."
            );
        }
    }

    function abrirExclusao(fornecedor) {
        setFornecedorSelecionado(fornecedor);
        setErro(null);
        setDialogExclusaoAberto(true);
    }

    function fecharExclusao() {
        if (salvando) {
            return;
        }

        setDialogExclusaoAberto(false);
        setFornecedorSelecionado(null);
        setErro(null);
    }

    async function confirmarExclusao() {
        if (!fornecedorSelecionado) {
            return;
        }

        setErro(null);

        try {
            await excluirFornecedor(
                fornecedorSelecionado.id
            );

            fecharExclusao();
        } catch (error) {
            console.error(
                "Erro ao excluir fornecedor:",
                error
            );

            setErro(
                error?.message ||
                    "Não foi possível excluir o fornecedor."
            );
        }
    }

    function limparPesquisa() {
        setPesquisa("");
    }

    return (
        <Box>
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
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        <StorefrontOutlinedIcon sx={{ fontSize: 48, color: "#ff9b3d", verticalAlign: "middle", mr: 1 }} />Fornecedores
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        Cadastre e gerencie os fornecedores
                        utilizados nas compras.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={abrirNovoFornecedor}
                >
                    Novo fornecedor
                </Button>
            </Stack>

            {erro && !dialogAberto && !dialogExclusaoAberto && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {erro}
                </Alert>
            )}

            <Paper
                sx={{
                    p: 2,
                    mb: 2
                }}
            >
                <TextField
                    fullWidth
                    size="small"
                    label="Pesquisar fornecedor"
                    placeholder="Digite o nome do fornecedor"
                    value={pesquisa}
                    onChange={(event) =>
                        setPesquisa(
                            event.target.value
                        )
                    }
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon
                                    color="action"
                                />
                            </InputAdornment>
                        ),
                        endAdornment:
                            pesquisa && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={
                                            limparPesquisa
                                        }
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                    }}
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Nome
                            </TableCell>

                            <TableCell
                                align="right"
                                sx={{
                                    width: 140
                                }}
                            >
                                Ações
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {carregando && (
                            <TableRow>
                                <TableCell
                                    colSpan={2}
                                    align="center"
                                >
                                    <Box
                                        sx={{
                                            py: 4
                                        }}
                                    >
                                        <CircularProgress
                                            size={28}
                                        />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}

                        {!carregando &&
                            fornecedoresFiltrados.length ===
                                0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={2}
                                        align="center"
                                    >
                                        <Box
                                            sx={{
                                                py: 4
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                gutterBottom
                                            >
                                                Nenhum fornecedor
                                                encontrado.
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {pesquisa
                                                    ? "Tente alterar a pesquisa."
                                                    : "Cadastre o primeiro fornecedor para começar."}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}

                        {!carregando &&
                            fornecedoresFiltrados.map(
                                (fornecedor) => (
                                    <TableRow
                                        key={
                                            fornecedor.id
                                        }
                                        hover
                                    >
                                        <TableCell>
                                            <Typography
                                                fontWeight={600}
                                            >
                                                {
                                                    fornecedor.nome
                                                }
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() =>
                                                    abrirEdicao(
                                                        fornecedor
                                                    )
                                                }
                                                title="Editar"
                                            >
                                                <EditOutlinedIcon fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    abrirExclusao(
                                                        fornecedor
                                                    )
                                                }
                                                title="Excluir"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
            >
                {fornecedoresFiltrados.length} fornecedor(es)
                encontrado(s)
            </Typography>

            {/* =========================
                DIALOG NOVO / EDITAR
            ========================= */}

            <Dialog
                open={dialogAberto}
                onClose={fecharDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {fornecedorSelecionado
                        ? "Editar fornecedor"
                        : "Novo fornecedor"}
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{ pt: 1 }}
                    >
                        {erro && (
                            <Alert severity="error">
                                {erro}
                            </Alert>
                        )}

                        <TextField
                            autoFocus
                            fullWidth
                            label="Nome do fornecedor"
                            value={nome}
                            onChange={(event) =>
                                setNome(
                                    event.target.value
                                )
                            }
                            disabled={salvando}
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter"
                                ) {
                                    salvar();
                                }
                            }}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={fecharDialog}
                        disabled={salvando}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={salvar}
                        disabled={
                            salvando ||
                            !nome.trim()
                        }
                        startIcon={
                            salvando ? (
                                <CircularProgress
                                    size={18}
                                />
                            ) : null
                        }
                    >
                        {salvando
                            ? "Salvando..."
                            : fornecedorSelecionado
                              ? "Salvar"
                              : "Cadastrar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* =========================
                DIALOG EXCLUSÃO
            ========================= */}

            <Dialog
                open={dialogExclusaoAberto}
                onClose={fecharExclusao}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Excluir fornecedor?
                </DialogTitle>

                <DialogContent>
                    {erro && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {erro}
                        </Alert>
                    )}

                    <Typography>
                        Tem certeza que deseja excluir o
                        fornecedor{" "}
                        <strong>
                            {fornecedorSelecionado?.nome}
                        </strong>
                        ?
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Essa ação não poderá ser desfeita.
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={fecharExclusao}
                        disabled={salvando}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={confirmarExclusao}
                        disabled={salvando}
                        startIcon={
                            salvando ? (
                                <CircularProgress
                                    size={18}
                                />
                            ) : (
                                <DeleteIcon />
                            )
                        }
                    >
                        {salvando
                            ? "Excluindo..."
                            : "Excluir"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
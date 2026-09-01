
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
    FormControl,
    IconButton,
    InputLabel,
    Menu,
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
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";
import LanguageIcon from "@mui/icons-material/Language";
import StoreIcon from "@mui/icons-material/Store";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";

import { useSolicitacoesCompra } from "../../context/SolicitacaoCompraContext";
import { useProdutos } from "../../context/ProdutoContext";

import {
    usePermissions,
    PERMISSOES
} from "../../context/PermissionContext";

export default function SolicitacoesCompra() {

    const {
        solicitacoes = [],
        carregando,
        salvando,
        criarSolicitacao,
        alterarStatus,
        excluir
    } = useSolicitacoesCompra();

    const { produtos = [] } = useProdutos();

    const { temPermissao } = usePermissions();

    const podeSolicitar = temPermissao(
        PERMISSOES.COMPRAS_SOLICITAR
    );

    const podeAprovar = temPermissao(
        PERMISSOES.COMPRAS_APROVAR
    );

    const podeCancelar = temPermissao(
        PERMISSOES.COMPRAS_CANCELAR
    );

    // =====================================================
    // DIALOG NOVA SOLICITAÇÃO
    // =====================================================

    const [
        dialogAberto,
        setDialogAberto
    ] = useState(false);

    // =====================================================
    // DIALOG DETALHES
    // =====================================================

    const [
        dialogDetalhesAberto,
        setDialogDetalhesAberto
    ] = useState(false);

    const [
        solicitacaoDetalhes,
        setSolicitacaoDetalhes
    ] = useState(null);

    // =====================================================
    // DIALOG REJEIÇÃO
    // =====================================================

    const [
        dialogRejeicaoAberto,
        setDialogRejeicaoAberto
    ] = useState(false);

    const [
        solicitacaoRejeicao,
        setSolicitacaoRejeicao
    ] = useState(null);

    const [
        motivoRejeicao,
        setMotivoRejeicao
    ] = useState("");

    const [menuAcoes, setMenuAcoes] = useState(null);

    // =====================================================
    // CAMPOS NOVA SOLICITAÇÃO
    // =====================================================

    const [
        tipo,
        setTipo
    ] = useState("existente");

    const [
        produtoId,
        setProdutoId
    ] = useState("");

    const [
        nomeItem,
        setNomeItem
    ] = useState("");

    const [
        quantidade,
        setQuantidade
    ] = useState("1");

    const [
        observacao,
        setObservacao
    ] = useState("");

    const [
        compraOnline,
        setCompraOnline
    ] = useState(false);

    const [
        urlCompra,
        setUrlCompra
    ] = useState("");

    const [
        fornecedorSugerido,
        setFornecedorSugerido
    ] = useState("");

    const [
        valorUnitarioSugerido,
        setValorUnitarioSugerido
    ] = useState("");

    // =====================================================
    // ERROS
    // =====================================================

    const [
        erro,
        setErro
    ] = useState(null);

    const [
        erroLista,
        setErroLista
    ] = useState(null);

    // =====================================================
    // PRODUTO SELECIONADO
    // =====================================================

    const produtoSelecionado = useMemo(() => {

        return produtos.find(
            (produto) =>
                String(produto.id) === String(produtoId)
        );

    }, [
        produtos,
        produtoId
    ]);

    // =====================================================
    // FORMATAÇÃO DE MOEDA
    // =====================================================

    function formatarMoeda(valor) {

        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return "R$ 0,00";
        }

        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }

    // =====================================================
    // VALIDAR URL
    // =====================================================

    function validarUrl(url) {

        if (!url?.trim()) {
            return false;
        }

        try {

            const endereco = new URL(
                url.trim()
            );

            return (
                endereco.protocol === "http:" ||
                endereco.protocol === "https:"
            );

        } catch {

            return false;
        }
    }

    // =====================================================
    // NOVA SOLICITAÇÃO
    // =====================================================

    function abrirNovaSolicitacao() {

        setTipo("existente");
        setProdutoId("");
        setNomeItem("");
        setQuantidade("1");
        setObservacao("");
        setCompraOnline(false);
        setUrlCompra("");
        setFornecedorSugerido("");
        setValorUnitarioSugerido("");
        setErro(null);

        setDialogAberto(true);
    }

    function fecharDialog() {

        if (salvando) {
            return;
        }

        setDialogAberto(false);
        setErro(null);
    }

    // =====================================================
    // ALTERAR TIPO
    // =====================================================

    function alterarTipo(event) {

        const novoTipo =
            event.target.value;

        setTipo(novoTipo);
        setProdutoId("");
        setNomeItem("");
        setErro(null);
    }

    // =====================================================
    // ALTERAR TIPO DE COMPRA
    // =====================================================

    function alterarCompraOnline(event) {

        const valor =
            event.target.value === "sim";

        setCompraOnline(valor);

        if (!valor) {
            setUrlCompra("");
        }

        setErro(null);
    }

    // =====================================================
    // SALVAR SOLICITAÇÃO
    // =====================================================

    async function salvar() {

        setErro(null);

        const quantidadeNumero =
            Number(quantidade);

        if (
            !Number.isFinite(quantidadeNumero) ||
            quantidadeNumero <= 0
        ) {

            setErro(
                "Informe uma quantidade maior que zero."
            );

            return;
        }

        if (
            tipo === "existente" &&
            !produtoId
        ) {

            setErro(
                "Selecione o produto que deseja comprar."
            );

            return;
        }

        if (
            tipo === "existente" &&
            !produtoSelecionado
        ) {

            setErro(
                "O produto selecionado não foi encontrado."
            );

            return;
        }

        if (
            tipo === "novo" &&
            !nomeItem.trim()
        ) {

            setErro(
                "Informe o nome do novo item."
            );

            return;
        }

        if (compraOnline) {

            if (!urlCompra.trim()) {

                setErro(
                    "Informe o link do produto para compras pela internet."
                );

                return;
            }

            if (!validarUrl(urlCompra)) {

                setErro(
                    "Informe uma URL válida iniciando com http:// ou https://."
                );

                return;
            }
        }

        let valorSugerido = null;

        if (
            valorUnitarioSugerido !== "" &&
            valorUnitarioSugerido !== null &&
            valorUnitarioSugerido !== undefined
        ) {

            valorSugerido =
                Number(
                    valorUnitarioSugerido
                );

            if (
                !Number.isFinite(valorSugerido) ||
                valorSugerido < 0
            ) {

                setErro(
                    "Informe um valor sugerido válido."
                );

                return;
            }
        }

        try {

            await criarSolicitacao({

                tipo,

                produtoId:
                    tipo === "existente"
                        ? produtoId
                        : null,

                produtoNome:
                    tipo === "existente"
                        ? produtoSelecionado?.nome || null
                        : null,

                nomeItem:
                    tipo === "novo"
                        ? nomeItem
                            .trim()
                            .toUpperCase()
                        : null,

                quantidade:
                    quantidadeNumero,

                observacao:
                    observacao.trim(),

                compraOnline,

                urlCompra:
                    compraOnline
                        ? urlCompra.trim()
                        : "",

                fornecedorSugerido:
                    fornecedorSugerido
                        .trim() || null,

                valorUnitarioSugerido:
                    valorSugerido
            });

            fecharDialog();

        } catch (error) {

            console.error(
                "Erro ao criar solicitação:",
                error
            );

            setErro(
                error?.message ||
                "Não foi possível criar a solicitação."
            );
        }
    }

    // =====================================================
    // DETALHES
    // =====================================================

    function abrirDetalhes(solicitacao) {

        setSolicitacaoDetalhes(
            solicitacao
        );

        setDialogDetalhesAberto(true);
    }

    function fecharDetalhes() {

        setDialogDetalhesAberto(false);
        setSolicitacaoDetalhes(null);
    }

    // =====================================================
    // APROVAR
    // =====================================================

    async function aprovarSolicitacao(
        solicitacao
    ) {

        if (!podeAprovar) {
            return;
        }

        const confirmar =
            window.confirm(
                "Deseja aprovar esta solicitação de compra?"
            );

        if (!confirmar) {
            return;
        }

        setErroLista(null);

        try {

            await alterarStatus(
                solicitacao.id,
                "aprovada"
            );

        } catch (error) {

            console.error(
                "Erro ao aprovar solicitação:",
                error
            );

            setErroLista(
                error?.message ||
                "Não foi possível aprovar a solicitação."
            );
        }
    }

    // =====================================================
    // REJEIÇÃO
    // =====================================================

    function abrirRejeicao(
        solicitacao
    ) {

        setSolicitacaoRejeicao(
            solicitacao
        );

        setMotivoRejeicao("");
        setErroLista(null);

        setDialogRejeicaoAberto(true);
    }

    function fecharRejeicao() {

        if (salvando) {
            return;
        }

        setDialogRejeicaoAberto(false);
        setSolicitacaoRejeicao(null);
        setMotivoRejeicao("");
    }

    async function confirmarRejeicao() {

        if (!solicitacaoRejeicao) {
            return;
        }

        const motivo =
            motivoRejeicao.trim();

        if (!motivo) {

            setErroLista(
                "Informe o motivo da rejeição."
            );

            return;
        }

        setErroLista(null);

        try {

            await alterarStatus(
                solicitacaoRejeicao.id,
                "rejeitada",
                motivo
            );

            fecharRejeicao();

        } catch (error) {

            console.error(
                "Erro ao rejeitar solicitação:",
                error
            );

            setErroLista(
                error?.message ||
                "Não foi possível rejeitar a solicitação."
            );
        }
    }

    // =====================================================
    // CANCELAR
    // =====================================================

    async function cancelarSolicitacao(
        solicitacao
    ) {

        if (!podeCancelar) {
            return;
        }

        const confirmar =
            window.confirm(
                "Deseja cancelar esta solicitação?"
            );

        if (!confirmar) {
            return;
        }

        setErroLista(null);

        try {

            await alterarStatus(
                solicitacao.id,
                "cancelada"
            );

        } catch (error) {

            console.error(
                "Erro ao cancelar solicitação:",
                error
            );

            setErroLista(
                error?.message ||
                "Não foi possível cancelar a solicitação."
            );
        }
    }

    // =====================================================
    // EXCLUIR
    // =====================================================

    async function handleExcluir(
        solicitacao
    ) {

        const confirmar =
            window.confirm(
                "Deseja excluir esta solicitação?"
            );

        if (!confirmar) {
            return;
        }

        setErroLista(null);

        try {

            await excluir(
                solicitacao.id
            );

        } catch (error) {

            console.error(
                "Erro ao excluir solicitação:",
                error
            );

            setErroLista(
                error?.message ||
                "Não foi possível excluir a solicitação."
            );
        }
    }

    // =====================================================
    // NOME ITEM
    // =====================================================

    function obterNomeItem(
        solicitacao
    ) {

        if (
            solicitacao.tipo ===
            "existente"
        ) {

            return (
                solicitacao.produtoNome ||
                "Produto"
            );
        }

        return (
            solicitacao.nomeItem ||
            "Item novo"
        );
    }

    // =====================================================
    // TIPO
    // =====================================================

    function obterTipoLabel(
        solicitacao
    ) {

        return solicitacao.tipo ===
            "existente"
            ? "Existente"
            : "Novo";
    }

    // =====================================================
    // STATUS
    // =====================================================

    function obterStatusLabel(
        status
    ) {

        switch (status) {

            case "pendente":
                return "Pendente";

            case "aprovada":
                return "Aprovada";

            case "rejeitada":
                return "Rejeitada";

            case "comprada":
                return "Comprada";

            case "cancelada":
                return "Cancelada";

            default:
                return status || "-";
        }
    }

    // =====================================================
    // COR STATUS
    // =====================================================

    function obterStatusColor(
        status
    ) {

        switch (status) {

            case "aprovada":
            case "comprada":
                return "success.main";

            case "rejeitada":
                return "error.main";

            case "cancelada":
                return "warning.main";

            case "pendente":
            default:
                return "info.main";
        }
    }

    // =====================================================
    // DATA
    // =====================================================

    function obterData(
        data
    ) {

        if (!data) {
            return "-";
        }

        try {

            if (
                typeof data.toDate ===
                "function"
            ) {

                return data
                    .toDate()
                    .toLocaleString(
                        "pt-BR"
                    );
            }

            if (
                data.seconds !==
                undefined
            ) {

                return new Date(
                    data.seconds * 1000
                ).toLocaleString(
                    "pt-BR"
                );
            }

            const resultado =
                new Date(data);

            if (
                Number.isNaN(
                    resultado.getTime()
                )
            ) {

                return "-";
            }

            return resultado.toLocaleString(
                "pt-BR"
            );

        } catch {

            return "-";
        }
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <Box>

            {/* =================================================
                CABEÇALHO
            ================================================= */}

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
                        sx={{
                            letterSpacing: "-0.02em"
                        }}
                    >
                        <RequestQuoteOutlinedIcon sx={{ fontSize: 48, color: "#ff9b3d", verticalAlign: "middle", mr: 1 }} />Solicitações de Compra
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5
                        }}
                    >
                        Crie, acompanhe e gerencie
                        as solicitações de compra.
                    </Typography>

                </Box>

                {podeSolicitar && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={
                            abrirNovaSolicitacao
                        }
                        sx={{
                            minWidth: 180,
                            fontWeight: 600
                        }}
                    >
                        Nova solicitação
                    </Button>
                )}

            </Stack>

            {/* =================================================
                ERRO
            ================================================= */}

            {erroLista && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2
                    }}
                    onClose={() =>
                        setErroLista(null)
                    }
                >
                    {erroLista}
                </Alert>
            )}

            {/* =================================================
                TABELA
            ================================================= */}

            <TableContainer className="solicitacoes-table" component={Paper}
                elevation={0}
                sx={{
                    width: "100%",
                    overflowX: "auto",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2
                }}
            >

                <Table
                    size="small"
                    sx={{ width: "100%", tableLayout: "fixed" }}
                >

                    <TableHead>

                        <TableRow
                            sx={{
                                "& th": {
                                    fontWeight: 700,
                                    backgroundColor:
                                        "action.hover",
                                    whiteSpace:
                                        "nowrap"
                                }
                            }}
                        >

                            <TableCell>
                                Item
                            </TableCell>

                            <TableCell align="center">
                                Qtd.
                            </TableCell>

                            <TableCell>
                                Compra
                            </TableCell>

                            <TableCell>
                                Fornecedor
                            </TableCell>

                            <TableCell align="right">
                                Valor sugerido
                            </TableCell>

                            <TableCell>
                                Status
                            </TableCell>

                            <TableCell align="right">
                                Ações
                            </TableCell>

                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {carregando && (

                            <TableRow>

                                <TableCell
                                    colSpan={7}
                                    align="center"
                                >

                                    <Box
                                        sx={{
                                            py: 5
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
                            solicitacoes.length === 0 && (

                                <TableRow>

                                    <TableCell
                                        colSpan={7}
                                        align="center"
                                    >

                                        <Box
                                            sx={{
                                                py: 6
                                            }}
                                        >

                                            <Typography
                                                variant="h6"
                                                fontWeight={600}
                                            >
                                                Nenhuma solicitação
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.5
                                                }}
                                            >
                                                Ainda não existem
                                                solicitações de compra.
                                            </Typography>

                                            {podeSolicitar && (
                                                <Button
                                                    variant="outlined"
                                                    startIcon={
                                                        <AddIcon />
                                                    }
                                                    onClick={
                                                        abrirNovaSolicitacao
                                                    }
                                                    sx={{
                                                        mt: 2
                                                    }}
                                                >
                                                    Criar primeira solicitação
                                                </Button>
                                            )}

                                        </Box>

                                    </TableCell>

                                </TableRow>

                            )}

                        {!carregando &&
                            solicitacoes.filter((item) => item.status !== "cancelada").map(
                                (solicitacao) => (

                                    <TableRow
                                        key={
                                            solicitacao.id
                                        }
                                        hover
                                    >

                                        {/* ITEM */}

                                        <TableCell
                                            sx={{
                                                py: 1.2,
                                                maxWidth: 260
                                            }}
                                        >

                                            <Typography
                                                fontWeight={600}
                                                noWrap
                                            >
                                                {obterNomeItem(
                                                    solicitacao
                                                )}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {obterTipoLabel(
                                                    solicitacao
                                                )}
                                            </Typography>

                                        </TableCell>

                                        {/* QUANTIDADE */}

                                        <TableCell
                                            align="center"
                                            sx={{
                                                py: 1.2,
                                                fontWeight: 600
                                            }}
                                        >
                                            {
                                                solicitacao.quantidade
                                            }
                                        </TableCell>

                                        {/* COMPRA */}

                                        <TableCell
                                            sx={{
                                                py: 1.2
                                            }}
                                        >

                                            {solicitacao.compraOnline ? (

                                                <Tooltip
                                                    title="Compra pela internet"
                                                >

                                                    <Box
                                                        sx={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 0.7
                                                        }}
                                                    >

                                                        <LanguageIcon
                                                            fontSize="small"
                                                        />

                                                    </Box>

                                                </Tooltip>

                                            ) : (

                                                <Tooltip
                                                    title="Compra em loja física"
                                                >

                                                    <Box
                                                        sx={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 0.7
                                                        }}
                                                    >

                                                        <StoreIcon
                                                            fontSize="small"
                                                        />

                                                    </Box>

                                                </Tooltip>

                                            )}

                                        </TableCell>

                                        {/* FORNECEDOR */}

                                        <TableCell
                                            sx={{
                                                py: 1.2,
                                                maxWidth: 180
                                            }}
                                        >

                                            <Typography
                                                variant="body2"
                                                noWrap
                                            >
                                                {
                                                    solicitacao.fornecedorSugerido ||
                                                    solicitacao.fornecedorNome ||
                                                    "-"
                                                }
                                            </Typography>

                                        </TableCell>

                                        {/* VALOR */}

                                        <TableCell
                                            align="right"
                                            sx={{
                                                py: 1.2,
                                                whiteSpace:
                                                    "nowrap"
                                            }}
                                        >

                                            {solicitacao.valorUnitarioSugerido !==
                                                undefined &&
                                            solicitacao.valorUnitarioSugerido !==
                                                null &&
                                            solicitacao.valorUnitarioSugerido !==
                                                ""
                                                ? formatarMoeda(
                                                    solicitacao.valorUnitarioSugerido
                                                )
                                                : "-"}

                                        </TableCell>

                                        {/* STATUS */}

                                        <TableCell
                                            sx={{
                                                py: 1.2
                                            }}
                                        >

                                            <Typography
                                                variant="body2"
                                                fontWeight={700}
                                                sx={{
                                                    color:
                                                        obterStatusColor(
                                                            solicitacao.status
                                                        )
                                                }}
                                            >
                                                {
                                                    obterStatusLabel(
                                                        solicitacao.status
                                                    )
                                                }
                                            </Typography>

                                        </TableCell>

                                        {/* AÇÕES */}

                                        <TableCell align="right" className="solicitacao-acoes-cell" sx={{ py: 0.7, minWidth: 150, width: 150 }}
                                        >

                                            <Stack className="solicitacao-acoes" direction="row" spacing={0.2} justifyContent="flex-end">
                                                <Tooltip title="Ver detalhes"><IconButton size="small" onClick={() => abrirDetalhes(solicitacao)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                                                {solicitacao.status === "pendente" && (podeAprovar || podeCancelar) && <><Tooltip title="Mais ações"><IconButton size="small" onClick={(event) => setMenuAcoes({ anchor: event.currentTarget, solicitacao })}><MoreVertIcon fontSize="small" sx={{ color: "#ff9b3d" }} /></IconButton></Tooltip><Menu anchorEl={menuAcoes?.anchor} open={Boolean(menuAcoes?.anchor && menuAcoes.solicitacao.id === solicitacao.id)} onClose={() => setMenuAcoes(null)}><MenuItem disabled={!podeAprovar} onClick={() => { setMenuAcoes(null); aprovarSolicitacao(solicitacao); }}><CheckIcon fontSize="small" sx={{ mr: 1, color: "#63d391" }} />Aprovar</MenuItem><MenuItem disabled={!podeAprovar} onClick={() => { setMenuAcoes(null); abrirRejeicao(solicitacao); }}><CloseIcon fontSize="small" sx={{ mr: 1, color: "#ff6b6b" }} />Rejeitar</MenuItem><MenuItem disabled={!podeCancelar} onClick={() => { setMenuAcoes(null); cancelarSolicitacao(solicitacao); }}><CancelIcon fontSize="small" sx={{ mr: 1, color: "#ffbd5c" }} />Cancelar</MenuItem><MenuItem onClick={() => { setMenuAcoes(null); handleExcluir(solicitacao); }}><DeleteIcon fontSize="small" sx={{ mr: 1, color: "#ff6b6b" }} />Excluir</MenuItem></Menu></>}
                                            </Stack>

                                        </TableCell>

                                    </TableRow>

                                )
                            )}

                    </TableBody>

                </Table>

            </TableContainer>

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    display: "block",
                    mt: 1
                }}
            >
                {solicitacoes.length} solicitação(ões)
            </Typography>

            {/* =================================================
                DIALOG NOVA SOLICITAÇÃO
            ================================================= */}

            <Dialog
                open={dialogAberto}
                onClose={fecharDialog}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle
                    sx={{
                        fontWeight: 700
                    }}
                >
                    Nova solicitação de compra
                </DialogTitle>

                <DialogContent dividers>

                    {erro && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2
                            }}
                        >
                            {erro}
                        </Alert>
                    )}

                    <Stack
                        spacing={2}
                        sx={{
                            mt: 0.5
                        }}
                    >

                        {/* TIPO */}

                        <FormControl fullWidth>

                            <InputLabel>
                                Tipo
                            </InputLabel>

                            <Select
                                value={tipo}
                                label="Tipo"
                                onChange={
                                    alterarTipo
                                }
                                disabled={salvando}
                            >

                                <MenuItem value="existente">
                                    Produto existente
                                </MenuItem>

                                <MenuItem value="novo">
                                    Novo item
                                </MenuItem>

                            </Select>

                        </FormControl>

                        {/* PRODUTO */}

                        {tipo === "existente" ? (

                            <FormControl fullWidth>

                                <InputLabel>
                                    Produto
                                </InputLabel>

                                <Select
                                    value={produtoId}
                                    label="Produto"
                                    onChange={(event) =>
                                        setProdutoId(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        salvando
                                    }
                                >

                                    {produtos.length === 0 ? (

                                        <MenuItem
                                            disabled
                                        >
                                            Nenhum produto disponível
                                        </MenuItem>

                                    ) : (

                                        produtos.map(
                                            (produto) => (

                                                <MenuItem
                                                    key={
                                                        produto.id
                                                    }
                                                    value={
                                                        produto.id
                                                    }
                                                >
                                                    {
                                                        produto.nome
                                                    }
                                                </MenuItem>

                                            )
                                        )

                                    )}

                                </Select>

                            </FormControl>

                        ) : (

                            <TextField
                                fullWidth
                                label="Nome do item"
                                value={
                                    nomeItem
                                }
                                onChange={(event) =>
                                    setNomeItem(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    salvando
                                }
                            />

                        )}

                        {/* QUANTIDADE */}

                        <TextField
                            fullWidth
                            label="Quantidade"
                            type="number"
                            value={
                                quantidade
                            }
                            onChange={(event) =>
                                setQuantidade(
                                    event.target.value
                                )
                            }
                            disabled={
                                salvando
                            }
                            inputProps={{
                                min: 1
                            }}
                        />

                        {/* TIPO DE COMPRA */}

                        <FormControl fullWidth>

                            <InputLabel>
                                Tipo de compra
                            </InputLabel>

                            <Select
                                value={
                                    compraOnline
                                        ? "sim"
                                        : "nao"
                                }
                                label="Tipo de compra"
                                onChange={
                                    alterarCompraOnline
                                }
                                disabled={
                                    salvando
                                }
                            >

                                <MenuItem value="nao">
                                    Compra local
                                </MenuItem>

                                <MenuItem value="sim">
                                    Compra pela internet
                                </MenuItem>

                            </Select>

                        </FormControl>

                        {/* URL */}

                        {compraOnline && (

                            <TextField
                                fullWidth
                                label="Link do produto"
                                placeholder="https://..."
                                value={
                                    urlCompra
                                }
                                onChange={(event) =>
                                    setUrlCompra(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    salvando
                                }
                                InputProps={{
                                    endAdornment:
                                        urlCompra &&
                                        validarUrl(
                                            urlCompra
                                        ) ? (
                                            <Tooltip
                                                title="Abrir link"
                                            >
                                                <IconButton
                                                    size="small"
                                                    component="a"
                                                    href={
                                                        urlCompra
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <OpenInNewIcon
                                                        fontSize="small"
                                                    />
                                                </IconButton>
                                            </Tooltip>
                                        ) : null
                                }}
                            />

                        )}

                        {/* FORNECEDOR */}

                        <TextField
                            fullWidth
                            label="Fornecedor sugerido"
                            placeholder="Opcional"
                            value={
                                fornecedorSugerido
                            }
                            onChange={(event) =>
                                setFornecedorSugerido(
                                    event.target.value
                                )
                            }
                            disabled={
                                salvando
                            }
                        />

                        {/* VALOR */}

                        <TextField
                            fullWidth
                            label="Valor unitário sugerido"
                            type="number"
                            value={
                                valorUnitarioSugerido
                            }
                            onChange={(event) =>
                                setValorUnitarioSugerido(
                                    event.target.value
                                )
                            }
                            disabled={
                                salvando
                            }
                            inputProps={{
                                min: 0,
                                step: "0.01"
                            }}
                        />

                        {/* OBSERVAÇÃO */}

                        <TextField
                            fullWidth
                            label="Observação"
                            multiline
                            minRows={3}
                            value={
                                observacao
                            }
                            onChange={(event) =>
                                setObservacao(
                                    event.target.value
                                )
                            }
                            disabled={
                                salvando
                            }
                        />

                    </Stack>

                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2
                    }}
                >

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
                            salvar
                        }
                        disabled={
                            salvando
                        }
                        startIcon={
                            salvando ? (
                                <CircularProgress
                                    size={18}
                                />
                            ) : (
                                <AddIcon />
                            )
                        }
                    >
                        {salvando
                            ? "Salvando..."
                            : "Criar solicitação"}
                    </Button>

                </DialogActions>

            </Dialog>

            {/* =================================================
                DIALOG DETALHES
            ================================================= */}

            <Dialog
                open={
                    dialogDetalhesAberto
                }
                onClose={
                    fecharDetalhes
                }
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle
                    sx={{
                        fontWeight: 700
                    }}
                >
                    Detalhes da solicitação
                </DialogTitle>

                <DialogContent dividers>

                    {solicitacaoDetalhes && (

                        <Stack spacing={2.5}>

                            <Box>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Item
                                </Typography>

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    {obterNomeItem(
                                        solicitacaoDetalhes
                                    )}
                                </Typography>

                            </Box>

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row"
                                }}
                                spacing={2}
                            >

                                <Box
                                    sx={{
                                        flex: 1
                                    }}
                                >

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Tipo
                                    </Typography>

                                    <Typography>
                                        {obterTipoLabel(
                                            solicitacaoDetalhes
                                        )}
                                    </Typography>

                                </Box>

                                <Box
                                    sx={{
                                        flex: 1
                                    }}
                                >

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Quantidade
                                    </Typography>

                                    <Typography
                                        fontWeight={600}
                                    >
                                        {
                                            solicitacaoDetalhes.quantidade
                                        }
                                    </Typography>

                                </Box>

                                <Box
                                    sx={{
                                        flex: 1
                                    }}
                                >

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Status
                                    </Typography>

                                    <Typography
                                        fontWeight={700}
                                        sx={{
                                            color:
                                                obterStatusColor(
                                                    solicitacaoDetalhes.status
                                                )
                                        }}
                                    >
                                        {obterStatusLabel(
                                            solicitacaoDetalhes.status
                                        )}
                                    </Typography>

                                </Box>

                            </Stack>

                            <Box>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Tipo de compra
                                </Typography>

                                <Typography>
                                    {
                                        solicitacaoDetalhes.compraOnline
                                            ? "Compra pela internet"
                                            : "Compra local"
                                    }
                                </Typography>

                            </Box>

                            {solicitacaoDetalhes.urlCompra && (

                                <Box>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Link do produto
                                    </Typography>

                                    <Box
                                        sx={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: 1
                                        }}
                                    >

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                wordBreak:
                                                    "break-all"
                                            }}
                                        >
                                            {
                                                solicitacaoDetalhes.urlCompra
                                            }
                                        </Typography>

                                        <Tooltip
                                            title="Abrir link"
                                        >

                                            <IconButton
                                                size="small"
                                                component="a"
                                                href={
                                                    solicitacaoDetalhes.urlCompra
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <OpenInNewIcon
                                                    fontSize="small"
                                                />
                                            </IconButton>

                                        </Tooltip>

                                    </Box>

                                </Box>

                            )}

                            <Box>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Fornecedor sugerido
                                </Typography>

                                <Typography>
                                    {
                                        solicitacaoDetalhes.fornecedorSugerido ||
                                        "-"
                                    }
                                </Typography>

                            </Box>

                            <Box>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Valor unitário sugerido
                                </Typography>

                                <Typography
                                    fontWeight={600}
                                >
                                    {solicitacaoDetalhes.valorUnitarioSugerido !==
                                        undefined &&
                                    solicitacaoDetalhes.valorUnitarioSugerido !==
                                        null &&
                                    solicitacaoDetalhes.valorUnitarioSugerido !==
                                        ""
                                        ? formatarMoeda(
                                            solicitacaoDetalhes.valorUnitarioSugerido
                                        )
                                        : "-"}
                                </Typography>

                            </Box>

                            <Box>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Observação
                                </Typography>

                                <Typography
                                    sx={{
                                        whiteSpace:
                                            "pre-wrap"
                                    }}
                                >
                                    {
                                        solicitacaoDetalhes.observacao ||
                                        "-"
                                    }
                                </Typography>

                            </Box>

                            {solicitacaoDetalhes.motivoRejeicao && (

                                <Box>

                                    <Typography
                                        variant="caption"
                                        color="error"
                                    >
                                        Motivo da rejeição
                                    </Typography>

                                    <Typography
                                        sx={{
                                            whiteSpace:
                                                "pre-wrap"
                                        }}
                                    >
                                        {
                                            solicitacaoDetalhes.motivoRejeicao
                                        }
                                    </Typography>

                                </Box>

                            )}

                            <Box>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Criada em
                                </Typography>

                                <Typography>
                                    {obterData(
                                        solicitacaoDetalhes.criadaEm ||
                                        solicitacaoDetalhes.createdAt
                                    )}
                                </Typography>

                            </Box>

                            {solicitacaoDetalhes.compradaEm && (

                                <Box>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Comprada em
                                    </Typography>

                                    <Typography>
                                        {obterData(
                                            solicitacaoDetalhes.compradaEm
                                        )}
                                    </Typography>

                                </Box>

                            )}

                        </Stack>

                    )}

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={
                            fecharDetalhes
                        }
                    >
                        Fechar
                    </Button>

                </DialogActions>

            </Dialog>

            {/* =================================================
                DIALOG REJEIÇÃO
            ================================================= */}

            <Dialog
                open={
                    dialogRejeicaoAberto
                }
                onClose={
                    fecharRejeicao
                }
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle
                    sx={{
                        fontWeight: 700
                    }}
                >
                    Rejeitar solicitação
                </DialogTitle>

                <DialogContent dividers>

                    {erroLista && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2
                            }}
                        >
                            {erroLista}
                        </Alert>
                    )}

                    {solicitacaoRejeicao && (

                        <Typography
                            variant="body2"
                            sx={{
                                mb: 2
                            }}
                        >
                            Você está rejeitando a solicitação de{" "}
                            <strong>
                                {obterNomeItem(
                                    solicitacaoRejeicao
                                )}
                            </strong>
                            .
                        </Typography>

                    )}

                    <TextField
                        fullWidth
                        autoFocus
                        label="Motivo da rejeição"
                        placeholder="Informe o motivo..."
                        multiline
                        minRows={4}
                        value={
                            motivoRejeicao
                        }
                        onChange={(event) =>
                            setMotivoRejeicao(
                                event.target.value
                            )
                        }
                        disabled={
                            salvando
                        }
                    />

                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2
                    }}
                >

                    <Button
                        onClick={
                            fecharRejeicao
                        }
                        disabled={
                            salvando
                        }
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={
                            confirmarRejeicao
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
                            ) : (
                                <CloseIcon />
                            )
                        }
                    >
                        {salvando
                            ? "Salvando..."
                            : "Rejeitar"}
                    </Button>

                </DialogActions>

            </Dialog>

        </Box>
    );
}

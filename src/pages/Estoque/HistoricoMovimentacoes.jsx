import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
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
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

import {
    usePermissions,
    PERMISSOES
} from "../../context/PermissionContext";

import {
    listarMovimentacoesEstoque
} from "../../services/movimentacaoService";

export default function HistoricoMovimentacoes() {
    const navigate = useNavigate();

    const { temPermissao } = usePermissions();

    const podeVisualizar = temPermissao(
        PERMISSOES.ESTOQUE_VISUALIZAR
    );

    const [movimentacoes, setMovimentacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [filtroTipo, setFiltroTipo] = useState("todos");

    // ==========================================
    // FILTRO DE PERÍODO
    // ==========================================

    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");

    const [filtrosAplicados, setFiltrosAplicados] = useState({
        tipo: "todos",
        dataInicial: "",
        dataFinal: ""
    });

    // ==========================================
    // CONVERTER DATA DD/MM/AAAA -> AAAA-MM-DD
    // ==========================================

    function converterDataParaISO(valor) {
        if (!valor) {
            return "";
        }

        const somenteNumeros = valor.replace(/\D/g, "");

        if (somenteNumeros.length !== 8) {
            return "";
        }

        const dia = somenteNumeros.substring(0, 2);
        const mes = somenteNumeros.substring(2, 4);
        const ano = somenteNumeros.substring(4, 8);

        const data = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia)
        );

        if (
            data.getFullYear() !== Number(ano) ||
            data.getMonth() !== Number(mes) - 1 ||
            data.getDate() !== Number(dia)
        ) {
            return "";
        }

        return `${ano}-${mes}-${dia}`;
    }

    // ==========================================
    // FORMATAR DATA DIGITADA
    // ==========================================

    function formatarCampoData(valor) {
        const numeros = valor.replace(/\D/g, "").slice(0, 8);

        if (numeros.length <= 2) {
            return numeros;
        }

        if (numeros.length <= 4) {
            return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
        }

        return `${numeros.slice(0, 2)}/${numeros.slice(
            2,
            4
        )}/${numeros.slice(4)}`;
    }

    // ==========================================
    // CARREGAR MOVIMENTAÇÕES
    // ==========================================

    const carregarMovimentacoes = useCallback(
        async (filtros = {}) => {
            setErro("");
            setCarregando(true);

            try {
                const lista =
                    await listarMovimentacoesEstoque(
                        filtros
                    );

                setMovimentacoes(
                    Array.isArray(lista)
                        ? lista
                        : []
                );
            } catch (error) {
                console.error(
                    "Erro ao carregar histórico:",
                    error
                );

                setErro(
                    error?.message ||
                        "Não foi possível carregar o histórico de movimentações."
                );

                setMovimentacoes([]);
            } finally {
                setCarregando(false);
            }
        },
        []
    );

    // ==========================================
    // CARGA INICIAL
    // ==========================================

    useEffect(() => {
        if (!podeVisualizar) {
            setCarregando(false);
            return;
        }

        carregarMovimentacoes({
            tipo: "todos",
            dataInicial: "",
            dataFinal: "",
            limite: 100
        });
    }, [
        podeVisualizar,
        carregarMovimentacoes
    ]);

    // ==========================================
    // APLICAR FILTROS
    // ==========================================

    async function aplicarFiltros() {
        setErro("");

        const isoInicial =
            converterDataParaISO(dataInicial);

        const isoFinal =
            converterDataParaISO(dataFinal);

        if (dataInicial && !isoInicial) {
            setErro(
                "A data inicial é inválida. Use o formato DD/MM/AAAA."
            );
            return;
        }

        if (dataFinal && !isoFinal) {
            setErro(
                "A data final é inválida. Use o formato DD/MM/AAAA."
            );
            return;
        }

        if (
            isoInicial &&
            isoFinal &&
            isoInicial > isoFinal
        ) {
            setErro(
                "A data inicial não pode ser maior que a data final."
            );
            return;
        }

        const novosFiltros = {
            tipo: filtroTipo,
            dataInicial: isoInicial,
            dataFinal: isoFinal,
            limite: 100
        };

        setFiltrosAplicados(novosFiltros);

        await carregarMovimentacoes(
            novosFiltros
        );
    }

    // ==========================================
    // LIMPAR FILTROS
    // ==========================================

    async function limparFiltros() {
        const novosFiltros = {
            tipo: "todos",
            dataInicial: "",
            dataFinal: "",
            limite: 100
        };

        setFiltroTipo("todos");
        setDataInicial("");
        setDataFinal("");
        setFiltrosAplicados(novosFiltros);

        await carregarMovimentacoes(
            novosFiltros
        );
    }

    // ==========================================
    // ATUALIZAR
    // ==========================================

    async function atualizar() {
        await carregarMovimentacoes(
            filtrosAplicados
        );
    }

    // ==========================================
    // VOLTAR
    // ==========================================

    function voltar() {
        navigate("/estoque");
    }

    // ==========================================
    // CONVERTER TIMESTAMP
    // ==========================================

    function obterData(timestamp) {
        if (!timestamp) {
            return null;
        }

        try {
            if (
                typeof timestamp.toDate ===
                "function"
            ) {
                return timestamp.toDate();
            }

            if (
                typeof timestamp === "object" &&
                typeof timestamp.seconds ===
                    "number"
            ) {
                return new Date(
                    timestamp.seconds * 1000
                );
            }

            const data = new Date(timestamp);

            if (
                Number.isNaN(data.getTime())
            ) {
                return null;
            }

            return data;
        } catch {
            return null;
        }
    }

    // ==========================================
    // FORMATAR DATA
    // ==========================================

    function formatarData(timestamp) {
        const data = obterData(timestamp);

        if (!data) {
            return "-";
        }

        return data.toLocaleString("pt-BR");
    }

    // ==========================================
    // FORMATAR NÚMERO
    // ==========================================

    function formatarNumero(valor) {
        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return "0";
        }

        return numero.toLocaleString(
            "pt-BR",
            {
                maximumFractionDigits: 2
            }
        );
    }

    // ==========================================
    // FORMATAR MOEDA
    // ==========================================

    function formatarMoeda(valor) {
        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {
            return "-";
        }

        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return "-";
        }

        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }

    // ==========================================
    // ORIGEM
    // ==========================================

    function obterOrigemLabel(origem) {
        const labels = {
            compra: "Compra",
            notaFiscal: "Nota fiscal",
            entradaManual: "Entrada manual",
            devolucao: "Devolução",
            ajuste: "Ajuste",
            outros: "Outros"
        };

        return (
            labels[origem] ||
            origem ||
            "-"
        );
    }

    // ==========================================
    // RESUMO
    // ==========================================

    const resumo = useMemo(() => {
        let entradas = 0;
        let saidas = 0;

        movimentacoes.forEach(
            (movimentacao) => {
                if (
                    movimentacao.tipo ===
                    "entrada"
                ) {
                    entradas++;
                }

                if (
                    movimentacao.tipo ===
                    "saida"
                ) {
                    saidas++;
                }
            }
        );

        return {
            total: movimentacoes.length,
            entradas,
            saidas
        };
    }, [movimentacoes]);

    // ==========================================
    // PERMISSÃO
    // ==========================================

    if (!podeVisualizar) {
        return (
            <Box>
                <Alert severity="error">
                    Você não possui permissão para
                    visualizar o histórico de estoque.
                </Alert>

                <Button
                    sx={{ mt: 2 }}
                    startIcon={
                        <ArrowBackIcon />
                    }
                    onClick={voltar}
                >
                    Voltar para o estoque
                </Button>
            </Box>
        );
    }

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <Box>
            {/* CABEÇALHO */}

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
                        <HistoryOutlinedIcon sx={{ fontSize: 48, color: "#ff9b3d", verticalAlign: "middle", mr: 1 }} />Histórico de movimentações
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        Consulte as entradas e saídas
                        realizadas no estoque.
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
                        onClick={atualizar}
                        disabled={carregando}
                    >
                        {carregando
                            ? "Atualizando..."
                            : "Atualizar"}
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={
                            <ArrowBackIcon />
                        }
                        onClick={voltar}
                    >
                        Voltar
                    </Button>
                </Stack>
            </Stack>

            {/* ERRO */}

            {erro && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setErro("")}
                >
                    {erro}
                </Alert>
            )}

            {/* FILTROS */}

            <Paper
                sx={{
                    p: 2,
                    mb: 2
                }}
            >
                <Stack spacing={2}>
                    {/* TIPO */}

                    <FormControl
                        size="small"
                        sx={{
                            width: {
                                xs: "100%",
                                sm: 220
                            }
                        }}
                    >
                        <InputLabel id="tipo-filtro-label">
                            Tipo
                        </InputLabel>

                        <Select
                            labelId="tipo-filtro-label"
                            value={filtroTipo}
                            label="Tipo"
                            onChange={(event) =>
                                setFiltroTipo(
                                    event.target.value
                                )
                            }
                        >
                            <MenuItem value="todos">
                                Todas
                            </MenuItem>

                            <MenuItem value="entrada">
                                Entradas
                            </MenuItem>

                            <MenuItem value="saida">
                                Saídas
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {/* PERÍODO */}

                    <Box>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            Filtrar por período
                        </Typography>

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row"
                            }}
                            spacing={2}
                            alignItems={{
                                xs: "stretch",
                                sm: "center"
                            }}
                        >
                            {/* DATA INICIAL */}

                            <TextField
                                size="small"
                                label="Data inicial"
                                placeholder="DD/MM/AAAA"
                                value={dataInicial}
                                onChange={(event) =>
                                    setDataInicial(
                                        formatarCampoData(
                                            event.target.value
                                        )
                                    )
                                }
                                inputProps={{
                                    inputMode:
                                        "numeric",
                                    maxLength: 10
                                }}
                                sx={{
                                    width: {
                                        xs: "100%",
                                        sm: 190
                                    }
                                }}
                            />

                            {/* DATA FINAL */}

                            <TextField
                                size="small"
                                label="Data final"
                                placeholder="DD/MM/AAAA"
                                value={dataFinal}
                                onChange={(event) =>
                                    setDataFinal(
                                        formatarCampoData(
                                            event.target.value
                                        )
                                    )
                                }
                                inputProps={{
                                    inputMode:
                                        "numeric",
                                    maxLength: 10
                                }}
                                sx={{
                                    width: {
                                        xs: "100%",
                                        sm: 190
                                    }
                                }}
                            />

                            {/* BOTÕES */}

                            <Stack
                                direction="row"
                                spacing={1}
                            >
                                <Button
                                    variant="contained"
                                    startIcon={
                                        <FilterAltOutlinedIcon />
                                    }
                                    onClick={
                                        aplicarFiltros
                                    }
                                    disabled={
                                        carregando
                                    }
                                >
                                    Filtrar
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={
                                        <ClearIcon />
                                    }
                                    onClick={
                                        limparFiltros
                                    }
                                    disabled={
                                        carregando
                                    }
                                >
                                    Limpar
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* RESUMO */}

                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row"
                        }}
                        spacing={2}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {resumo.total}{" "}
                            movimentação(ões)
                        </Typography>

                        <Typography
                            variant="body2"
                            color="success.main"
                        >
                            {resumo.entradas} entrada(s)
                        </Typography>

                        <Typography
                            variant="body2"
                            color="error.main"
                        >
                            {resumo.saidas} saída(s)
                        </Typography>
                    </Stack>
                </Stack>
            </Paper>

            {/* TABELA */}

            <Paper>
                {carregando ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "center",
                            alignItems:
                                "center",
                            py: 8
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : movimentacoes.length ===
                  0 ? (
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
                            Nenhuma movimentação
                            encontrada
                        </Typography>

                        <Typography
                            color="text.secondary"
                        >
                            Não existem movimentações
                            para os filtros selecionados.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table
                            size="small"
                            sx={{
                                minWidth: 1100
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Data
                                    </TableCell>

                                    <TableCell>
                                        Tipo
                                    </TableCell>

                                    <TableCell>
                                        Produto
                                    </TableCell>

                                    <TableCell>
                                        Quantidade
                                    </TableCell>

                                    <TableCell>
                                        Estoque anterior
                                    </TableCell>

                                    <TableCell>
                                        Estoque posterior
                                    </TableCell>

                                    <TableCell>
                                        Custo unitário
                                    </TableCell>

                                    <TableCell>
                                        Origem
                                    </TableCell>

                                    <TableCell>
                                        Observação
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {movimentacoes.map(
                                    (movimentacao) => {
                                        const entrada =
                                            movimentacao.tipo ===
                                            "entrada";

                                        return (
                                            <TableRow
                                                key={
                                                    movimentacao.id
                                                }
                                                hover
                                            >
                                                <TableCell
                                                    sx={{
                                                        whiteSpace:
                                                            "nowrap"
                                                    }}
                                                >
                                                    {formatarData(
                                                        movimentacao.movimentadoEm
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={
                                                            entrada
                                                                ? "Entrada"
                                                                : "Saída"
                                                        }
                                                        color={
                                                            entrada
                                                                ? "success"
                                                                : "error"
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        fontWeight={
                                                            600
                                                        }
                                                    >
                                                        {
                                                            movimentacao.produtoNome
                                                        }
                                                    </Typography>

                                                    {movimentacao.produtoCodigo && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Código:{" "}
                                                            {
                                                                movimentacao.produtoCodigo
                                                            }
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {formatarNumero(
                                                        movimentacao.quantidade
                                                    )}{" "}
                                                    {
                                                        movimentacao.unidade ??
                                                        "UN"
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    {formatarNumero(
                                                        movimentacao.estoqueAnterior
                                                    )}{" "}
                                                    {
                                                        movimentacao.unidade ??
                                                        "UN"
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        fontWeight={
                                                            600
                                                        }
                                                    >
                                                        {formatarNumero(
                                                            movimentacao.estoquePosterior
                                                        )}{" "}
                                                        {
                                                            movimentacao.unidade ??
                                                            "UN"
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    {formatarMoeda(
                                                        movimentacao.custoUnitario
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {obterOrigemLabel(
                                                        movimentacao.origem
                                                    )}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        maxWidth: 260
                                                    }}
                                                >
                                                    {
                                                        movimentacao.observacao ||
                                                        "-"
                                                    }
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
        </Box>
    );
}

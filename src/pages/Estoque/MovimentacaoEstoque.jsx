import { useCallback, useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    MenuItem,
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

import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import InputIcon from "@mui/icons-material/Input";
import OutputIcon from "@mui/icons-material/Output";

import { listarMovimentacoesEstoque } from "../../services/estoqueService";

export default function MovimentacoesEstoque() {
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    const [pesquisa, setPesquisa] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("todos");

    // =========================
    // FILTROS DE DATA
    // =========================

    const [dataInicial, setDataInicial] = useState("");
    const [dataFinal, setDataFinal] = useState("");

    const [filtrosAplicados, setFiltrosAplicados] = useState({
        dataInicial: "",
        dataFinal: ""
    });

    // =========================
    // CARREGAR MOVIMENTAÇÕES
    // =========================

    const carregarMovimentacoes = useCallback(async () => {
        setCarregando(true);
        setErro(null);

        try {
            const lista = await listarMovimentacoesEstoque();

            setMovimentacoes(lista);
        } catch (error) {
            console.error(
                "Erro ao carregar movimentações:",
                error
            );

            setErro(
                "Não foi possível carregar o histórico de movimentações."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarMovimentacoes();
    }, [carregarMovimentacoes]);

    // =========================
    // CONVERTER DATA FIREBASE
    // =========================

    function obterDataMovimentacao(movimentacao) {
        const valor = movimentacao?.movimentadoEm;

        if (!valor) {
            return null;
        }

        if (
            typeof valor?.toDate === "function"
        ) {
            return valor.toDate();
        }

        if (valor instanceof Date) {
            return valor;
        }

        if (
            typeof valor === "object" &&
            typeof valor.seconds === "number"
        ) {
            return new Date(
                valor.seconds * 1000
            );
        }

        const data = new Date(valor);

        if (
            Number.isNaN(data.getTime())
        ) {
            return null;
        }

        return data;
    }

    // =========================
    // FORMATAR DATA
    // =========================

    function formatarData(data) {
        if (!data) {
            return "-";
        }

        return new Intl.DateTimeFormat(
            "pt-BR",
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        ).format(data);
    }

    // =========================
    // APLICAR FILTROS
    // =========================

    function aplicarFiltros() {
        if (
            dataInicial &&
            dataFinal &&
            dataInicial > dataFinal
        ) {
            setErro(
                "A data inicial não pode ser maior que a data final."
            );

            return;
        }

        setErro(null);

        setFiltrosAplicados({
            dataInicial,
            dataFinal
        });
    }

    // =========================
    // LIMPAR FILTROS
    // =========================

    function limparFiltros() {
        setPesquisa("");
        setFiltroTipo("todos");

        setDataInicial("");
        setDataFinal("");

        setFiltrosAplicados({
            dataInicial: "",
            dataFinal: ""
        });

        setErro(null);
    }

    // =========================
    // MOVIMENTAÇÕES FILTRADAS
    // =========================

    const movimentacoesFiltradas = useMemo(() => {
        const termo = pesquisa
            .trim()
            .toLowerCase();

        let dataInicialAplicada = null;
        let dataFinalAplicada = null;

        if (filtrosAplicados.dataInicial) {
            const [ano, mes, dia] =
                filtrosAplicados.dataInicial
                    .split("-")
                    .map(Number);

            dataInicialAplicada = new Date(
                ano,
                mes - 1,
                dia,
                0,
                0,
                0,
                0
            );
        }

        if (filtrosAplicados.dataFinal) {
            const [ano, mes, dia] =
                filtrosAplicados.dataFinal
                    .split("-")
                    .map(Number);

            dataFinalAplicada = new Date(
                ano,
                mes - 1,
                dia,
                23,
                59,
                59,
                999
            );
        }

        return movimentacoes.filter(
            (movimentacao) => {
                // =========================
                // PESQUISA
                // =========================

                const correspondePesquisa =
                    !termo ||
                    String(
                        movimentacao.produtoCodigo ?? ""
                    )
                        .toLowerCase()
                        .includes(termo) ||
                    String(
                        movimentacao.produtoNome ?? ""
                    )
                        .toLowerCase()
                        .includes(termo) ||
                    String(
                        movimentacao.observacao ?? ""
                    )
                        .toLowerCase()
                        .includes(termo);

                if (!correspondePesquisa) {
                    return false;
                }

                // =========================
                // TIPO
                // =========================

                const correspondeTipo =
                    filtroTipo === "todos" ||
                    movimentacao.tipo === filtroTipo;

                if (!correspondeTipo) {
                    return false;
                }

                // =========================
                // DATA
                // =========================

                const dataMovimentacao =
                    obterDataMovimentacao(
                        movimentacao
                    );

                if (dataInicialAplicada) {
                    if (
                        !dataMovimentacao ||
                        dataMovimentacao <
                            dataInicialAplicada
                    ) {
                        return false;
                    }
                }

                if (dataFinalAplicada) {
                    if (
                        !dataMovimentacao ||
                        dataMovimentacao >
                            dataFinalAplicada
                    ) {
                        return false;
                    }
                }

                return true;
            }
        );
    }, [
        movimentacoes,
        pesquisa,
        filtroTipo,
        filtrosAplicados
    ]);

    // =========================
    // ATUALIZAR
    // =========================

    function atualizarAgora() {
        carregarMovimentacoes();
    }

    // =========================
    // RENDER
    // =========================

    return (
        <Box>
            {/* =========================
                CABEÇALHO
            ========================= */}

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
                        Histórico de movimentações
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        Consulte as entradas e saídas
                        realizadas no estoque.
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={
                        carregando ? (
                            <CircularProgress size={18} />
                        ) : (
                            <RefreshIcon />
                        )
                    }
                    onClick={atualizarAgora}
                    disabled={carregando}
                >
                    {carregando
                        ? "Atualizando..."
                        : "Atualizar"}
                </Button>
            </Stack>

            {/* =========================
                ERRO
            ========================= */}

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

            {/* =========================
                FILTROS
            ========================= */}

            <Paper
                sx={{
                    p: 2,
                    mb: 2
                }}
            >
                <Stack spacing={2}>
                    {/* PESQUISA + TIPO */}

                    <Stack
                        direction={{
                            xs: "column",
                            md: "row"
                        }}
                        spacing={2}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            label="Pesquisar"
                            placeholder="Código, produto ou observação"
                            value={pesquisa}
                            onChange={(event) =>
                                setPesquisa(
                                    event.target.value
                                )
                            }
                            InputProps={{
                                startAdornment: (
                                    <SearchIcon
                                        sx={{
                                            mr: 1,
                                            color:
                                                "text.secondary"
                                        }}
                                    />
                                )
                            }}
                        />

                        <TextField
                            select
                            size="small"
                            label="Tipo"
                            value={filtroTipo}
                            onChange={(event) =>
                                setFiltroTipo(
                                    event.target.value
                                )
                            }
                            sx={{
                                minWidth: {
                                    xs: "100%",
                                    md: 180
                                }
                            }}
                        >
                            <MenuItem value="todos">
                                Todos
                            </MenuItem>

                            <MenuItem value="entrada">
                                Entradas
                            </MenuItem>

                            <MenuItem value="saida">
                                Saídas
                            </MenuItem>
                        </TextField>
                    </Stack>

                    {/* =========================
                        FILTRO POR DATA
                    ========================= */}

                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                mb: 1
                            }}
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
                            <TextField
                                type="date"
                                label="Data inicial"
                                size="small"
                                value={dataInicial}
                                onChange={(event) =>
                                    setDataInicial(
                                        event.target.value
                                    )
                                }
                                InputLabelProps={{
                                    shrink: true
                                }}
                                fullWidth
                            />

                            <TextField
                                type="date"
                                label="Data final"
                                size="small"
                                value={dataFinal}
                                onChange={(event) =>
                                    setDataFinal(
                                        event.target.value
                                    )
                                }
                                InputLabelProps={{
                                    shrink: true
                                }}
                                fullWidth
                            />

                            <Button
                                variant="contained"
                                startIcon={
                                    <FilterAltOutlinedIcon />
                                }
                                onClick={
                                    aplicarFiltros
                                }
                                sx={{
                                    minWidth: {
                                        xs: "100%",
                                        sm: 130
                                    }
                                }}
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
                                sx={{
                                    minWidth: {
                                        xs: "100%",
                                        sm: 130
                                    }
                                }}
                            >
                                Limpar
                            </Button>
                        </Stack>
                    </Box>

                    {/* RESUMO */}

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {movimentacoesFiltradas.length}{" "}
                        movimentação(ões) encontrada(s)
                    </Typography>
                </Stack>
            </Paper>

            {/* =========================
                TABELA
            ========================= */}

            <TableContainer
                component={Paper}
            >
                <Table>
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
                                Código
                            </TableCell>

                            <TableCell align="right">
                                Quantidade
                            </TableCell>

                            <TableCell align="right">
                                Estoque anterior
                            </TableCell>

                            <TableCell align="right">
                                Estoque posterior
                            </TableCell>

                            <TableCell align="right">
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
                        {carregando && (
                            <TableRow>
                                <TableCell
                                    colSpan={10}
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
                            movimentacoesFiltradas.length ===
                                0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
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
                                                Nenhuma
                                                movimentação
                                                encontrada.
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Tente alterar
                                                os filtros ou
                                                o período
                                                selecionado.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}

                        {!carregando &&
                            movimentacoesFiltradas.map(
                                (movimentacao) => {
                                    const data =
                                        obterDataMovimentacao(
                                            movimentacao
                                        );

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
                                            <TableCell>
                                                {formatarData(
                                                    data
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                >
                                                    {entrada ? (
                                                        <InputIcon color="success" />
                                                    ) : (
                                                        <OutputIcon color="error" />
                                                    )}

                                                    <Typography
                                                        fontWeight={
                                                            600
                                                        }
                                                        color={
                                                            entrada
                                                                ? "success.main"
                                                                : "error.main"
                                                        }
                                                    >
                                                        {entrada
                                                            ? "Entrada"
                                                            : "Saída"}
                                                    </Typography>
                                                </Stack>
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
                                            </TableCell>

                                            <TableCell>
                                                {movimentacao.produtoCodigo ??
                                                    "-"}
                                            </TableCell>

                                            <TableCell align="right">
                                                {movimentacao.quantidade ??
                                                    0}{" "}
                                                {movimentacao.unidade ??
                                                    "UN"}
                                            </TableCell>

                                            <TableCell align="right">
                                                {movimentacao.estoqueAnterior ??
                                                    0}{" "}
                                                {movimentacao.unidade ??
                                                    "UN"}
                                            </TableCell>

                                            <TableCell align="right">
                                                {movimentacao.estoquePosterior ??
                                                    0}{" "}
                                                {movimentacao.unidade ??
                                                    "UN"}
                                            </TableCell>

                                            <TableCell align="right">
                                                {movimentacao.custoUnitario !==
                                                    null &&
                                                movimentacao.custoUnitario !==
                                                    undefined
                                                    ? Number(
                                                          movimentacao.custoUnitario
                                                      ).toLocaleString(
                                                          "pt-BR",
                                                          {
                                                              style: "currency",
                                                              currency:
                                                                  "BRL"
                                                          }
                                                      )
                                                    : "-"}
                                            </TableCell>

                                            <TableCell>
                                                {movimentacao.origem ??
                                                    "-"}
                                            </TableCell>

                                            <TableCell>
                                                {movimentacao.observacao ||
                                                    "-"}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
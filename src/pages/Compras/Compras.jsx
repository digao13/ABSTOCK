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
    Divider,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { useNavigate } from "react-router-dom";
import { useCompras } from "../../context/CompraContext";

export default function Compras() {
    const navigate = useNavigate();

    const {
        compras,
        carregando,
        carregarCompras
    } = useCompras();

    const [compraSelecionada, setCompraSelecionada] =
        useState(null);

    const [dialogAberto, setDialogAberto] =
        useState(false);

    const [erro, setErro] =
        useState(null);

    // =========================================================
    // COMPRAS
    // =========================================================

    const listaCompras = useMemo(() => {
        return Array.isArray(compras)
            ? compras
            : [];
    }, [compras]);

    // =========================================================
    // FORMATAR VALOR
    // =========================================================

    function formatarValor(valor) {
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

    // =========================================================
    // FORMATAR DATA
    // =========================================================

    function formatarData(data) {
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
                    .toLocaleDateString(
                        "pt-BR"
                    );
            }

            if (
                data instanceof Date
            ) {
                return data.toLocaleDateString(
                    "pt-BR"
                );
            }

            const dataConvertida =
                new Date(data);

            if (
                Number.isNaN(
                    dataConvertida.getTime()
                )
            ) {
                return "-";
            }

            return dataConvertida.toLocaleDateString(
                "pt-BR"
            );
        } catch {
            return "-";
        }
    }

    // =========================================================
    // STATUS
    // =========================================================

    function obterStatusTexto(status) {
        switch (status) {
            case "pendente":
                return "Pendente";

            case "realizada":
                return "Realizada";

            case "aguardandoRecebimento":
                return "Aguardando recebimento";

            case "recebida":
                return "Recebida";

            case "cancelada":
                return "Cancelada";

            default:
                return status || "-";
        }
    }

    // =========================================================
    // ABRIR DETALHES
    // =========================================================

    function abrirDetalhes(compra) {
        setErro(null);

        setCompraSelecionada(
            compra
        );

        setDialogAberto(true);
    }

    // =========================================================
    // FECHAR DETALHES
    // =========================================================

    function fecharDetalhes() {
        setDialogAberto(false);

        setCompraSelecionada(null);

        setErro(null);
    }

    // =========================================================
    // RECARREGAR
    // =========================================================

    async function atualizarLista() {
        setErro(null);

        try {
            await carregarCompras();
        } catch (error) {
            console.error(
                "Erro ao atualizar compras:",
                error
            );

            setErro(
                error?.message ||
                "Não foi possível atualizar a lista de compras."
            );
        }
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Box>

            {/* =====================================================
                CABEÇALHO
            ===================================================== */}

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

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >

                        <ShoppingCartIcon />

                        <Typography
                            variant="h4"
                            fontWeight={700}
                        >
                            Compras
                        </Typography>

                    </Stack>

                    <Typography
                        color="text.secondary"
                    >
                        Gerencie as compras realizadas
                        e acompanhe seus produtos.
                    </Typography>

                </Box>

                <Stack
                    direction="row"
                    spacing={1}
                >

                    <Button
                        variant="outlined"
                        onClick={
                            atualizarLista
                        }
                        disabled={
                            carregando
                        }
                    >
                        Atualizar
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={
                            <AddIcon />
                        }
                        onClick={() =>
                            navigate(
                                "/compras/nova"
                            )
                        }
                    >
                        Nova compra
                    </Button>

                </Stack>

            </Stack>

            {/* =====================================================
                ERRO
            ===================================================== */}

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

            {/* =====================================================
                TABELA
            ===================================================== */}

            <TableContainer
                component={Paper}
            >

                <Table>

                    <TableHead>

                        <TableRow>

                            <TableCell>
                                Fornecedor
                            </TableCell>

                            <TableCell>
                                Produtos
                            </TableCell>

                            <TableCell>
                                Total
                            </TableCell>

                            <TableCell>
                                Data
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

                        {/* =================================================
                            CARREGANDO
                        ================================================= */}

                        {carregando && (
                            <TableRow>

                                <TableCell
                                    colSpan={6}
                                    align="center"
                                >

                                    <Box
                                        sx={{
                                            py: 5
                                        }}
                                    >

                                        <CircularProgress
                                            size={30}
                                        />

                                    </Box>

                                </TableCell>

                            </TableRow>
                        )}

                        {/* =================================================
                            VAZIO
                        ================================================= */}

                        {!carregando &&
                            listaCompras.length === 0 && (
                                <TableRow>

                                    <TableCell
                                        colSpan={6}
                                        align="center"
                                    >

                                        <Box
                                            sx={{
                                                py: 6
                                            }}
                                        >

                                            <ShoppingCartIcon
                                                sx={{
                                                    fontSize: 45,
                                                    color: "text.secondary",
                                                    mb: 1
                                                }}
                                            />

                                            <Typography
                                                variant="h6"
                                            >
                                                Nenhuma compra encontrada
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2
                                                }}
                                            >
                                                Cadastre sua primeira
                                                compra para começar.
                                            </Typography>

                                            <Button
                                                variant="contained"
                                                startIcon={
                                                    <AddIcon />
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        "/compras/nova"
                                                    )
                                                }
                                            >
                                                Nova compra
                                            </Button>

                                        </Box>

                                    </TableCell>

                                </TableRow>
                            )}

                        {/* =================================================
                            COMPRAS
                        ================================================= */}

                        {!carregando &&
                            listaCompras.map(
                                (compra) => {

                                    const itens =
                                        Array.isArray(
                                            compra.itens
                                        )
                                            ? compra.itens
                                            : [];

                                    return (
                                        <TableRow
                                            key={
                                                compra.id
                                            }
                                            hover
                                        >

                                            {/* FORNECEDOR */}

                                            <TableCell>

                                                <Typography
                                                    fontWeight={600}
                                                >
                                                    {
                                                        compra.fornecedorNome ||
                                                        "-"
                                                    }
                                                </Typography>

                                            </TableCell>

                                            {/* PRODUTOS */}

                                            <TableCell>

                                                <Typography
                                                    fontWeight={500}
                                                >
                                                    {
                                                        itens.length
                                                    }{" "}
                                                    {itens.length === 1
                                                        ? "item"
                                                        : "itens"}
                                                </Typography>

                                            </TableCell>

                                            {/* TOTAL */}

                                            <TableCell>

                                                <Typography
                                                    fontWeight={600}
                                                >
                                                    {formatarValor(
                                                        compra.total
                                                    )}
                                                </Typography>

                                            </TableCell>

                                            {/* DATA */}

                                            <TableCell>

                                                {formatarData(
                                                    compra.criadoEm
                                                )}

                                            </TableCell>

                                            {/* STATUS */}

                                            <TableCell>

                                                <Typography
                                                    fontWeight={500}
                                                >
                                                    {obterStatusTexto(
                                                        compra.status
                                                    )}
                                                </Typography>

                                            </TableCell>

                                            {/* AÇÕES */}

                                            <TableCell
                                                align="right"
                                            >

                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={
                                                        <VisibilityIcon />
                                                    }
                                                    onClick={() =>
                                                        abrirDetalhes(
                                                            compra
                                                        )
                                                    }
                                                >
                                                    Ver detalhes
                                                </Button>

                                            </TableCell>

                                        </TableRow>
                                    );
                                }
                            )}

                    </TableBody>

                </Table>

            </TableContainer>

            {/* =====================================================
                CONTADOR
            ===================================================== */}

            {!carregando && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 2
                    }}
                >
                    {listaCompras.length}{" "}
                    {listaCompras.length === 1
                        ? "compra cadastrada"
                        : "compras cadastradas"}
                </Typography>
            )}

            {/* =====================================================
                MODAL DE DETALHES
            ===================================================== */}

            <Dialog
                open={dialogAberto}
                onClose={
                    fecharDetalhes
                }
                fullWidth
                maxWidth="md"
            >

                <DialogTitle>
                    Detalhes da compra
                </DialogTitle>

                <DialogContent>

                    {compraSelecionada && (
                        <Stack
                            spacing={3}
                            sx={{
                                pt: 1
                            }}
                        >

                            {/* =========================================
                                CABEÇALHO DA COMPRA
                            ========================================= */}

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2
                                }}
                            >

                                <Stack
                                    spacing={1}
                                >

                                    <Typography
                                        variant="subtitle2"
                                        color="text.secondary"
                                    >
                                        Fornecedor
                                    </Typography>

                                    <Typography
                                        variant="h6"
                                        fontWeight={600}
                                    >
                                        {
                                            compraSelecionada.fornecedorNome ||
                                            "-"
                                        }
                                    </Typography>

                                    <Divider />

                                    <Stack
                                        direction={{
                                            xs: "column",
                                            sm: "row"
                                        }}
                                        spacing={{
                                            xs: 1,
                                            sm: 4
                                        }}
                                    >

                                        <Box>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Data da compra
                                            </Typography>

                                            <Typography
                                                fontWeight={500}
                                            >
                                                {formatarData(
                                                    compraSelecionada.criadoEm
                                                )}
                                            </Typography>

                                        </Box>

                                        <Box>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Status
                                            </Typography>

                                            <Typography
                                                fontWeight={500}
                                            >
                                                {obterStatusTexto(
                                                    compraSelecionada.status
                                                )}
                                            </Typography>

                                        </Box>

                                        <Box>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Total
                                            </Typography>

                                            <Typography
                                                fontWeight={700}
                                            >
                                                {formatarValor(
                                                    compraSelecionada.total
                                                )}
                                            </Typography>

                                        </Box>

                                    </Stack>

                                </Stack>

                            </Paper>

                            {/* =========================================
                                PRODUTOS
                            ========================================= */}

                            <Box>

                                <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    sx={{
                                        mb: 1.5
                                    }}
                                >
                                    Produtos da compra
                                </Typography>

                                <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                >

                                    <Table
                                        size="small"
                                    >

                                        <TableHead>

                                            <TableRow>

                                                <TableCell>
                                                    Produto
                                                </TableCell>

                                                <TableCell>
                                                    Quantidade
                                                </TableCell>

                                                <TableCell>
                                                    Custo unitário
                                                </TableCell>

                                                <TableCell
                                                    align="right"
                                                >
                                                    Subtotal
                                                </TableCell>

                                            </TableRow>

                                        </TableHead>

                                        <TableBody>

                                            {(
                                                compraSelecionada.itens ||
                                                []
                                            ).map(
                                                (
                                                    item,
                                                    index
                                                ) => {

                                                    const quantidade =
                                                        Number(
                                                            item.quantidade
                                                        );

                                                    const custo =
                                                        Number(
                                                            item.custoUnitario
                                                        );

                                                    const subtotal =
                                                        Number.isFinite(
                                                            Number(
                                                                item.subtotal
                                                            )
                                                        )
                                                            ? Number(
                                                                item.subtotal
                                                            )
                                                            : quantidade *
                                                              custo;

                                                    return (
                                                        <TableRow
                                                            key={
                                                                item.produtoId ||
                                                                index
                                                            }
                                                        >

                                                            <TableCell>

                                                                <Typography
                                                                    fontWeight={
                                                                        500
                                                                    }
                                                                >
                                                                    {
                                                                        item.produtoNome ||
                                                                        "Item"
                                                                    }
                                                                </Typography>

                                                            </TableCell>

                                                            <TableCell>

                                                                {
                                                                    item.quantidade
                                                                }

                                                            </TableCell>

                                                            <TableCell>

                                                                {formatarValor(
                                                                    item.custoUnitario
                                                                )}

                                                            </TableCell>

                                                            <TableCell
                                                                align="right"
                                                            >

                                                                {formatarValor(
                                                                    subtotal
                                                                )}

                                                            </TableCell>

                                                        </TableRow>
                                                    );
                                                }
                                            )}

                                        </TableBody>

                                    </Table>

                                </TableContainer>

                            </Box>

                            {/* =========================================
                                TOTAL
                            ========================================= */}

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2
                                }}
                            >

                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >

                                    <Typography
                                        variant="h6"
                                        fontWeight={600}
                                    >
                                        Total da compra
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {formatarValor(
                                            compraSelecionada.total
                                        )}
                                    </Typography>

                                </Stack>

                            </Paper>

                            {/* =========================================
                                OBSERVAÇÃO
                            ========================================= */}

                            {compraSelecionada.observacao && (
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2
                                    }}
                                >

                                    <Typography
                                        variant="subtitle2"
                                        color="text.secondary"
                                        sx={{
                                            mb: 0.5
                                        }}
                                    >
                                        Observação
                                    </Typography>

                                    <Typography>
                                        {
                                            compraSelecionada.observacao
                                        }
                                    </Typography>

                                </Paper>
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

        </Box>
    );
}
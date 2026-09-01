import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
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

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { useCompras } from "../../context/CompraContext";


function formatarMoeda(valor) {
    return Number(valor ?? 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function formatarData(data) {
    if (!data) {
        return "-";
    }

    try {
        if (
            typeof data?.toDate === "function"
        ) {
            return data
                .toDate()
                .toLocaleString("pt-BR");
        }

        if (
            data instanceof Date
        ) {
            return data.toLocaleString("pt-BR");
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

        return dataConvertida.toLocaleString(
            "pt-BR"
        );
    } catch {
        return "-";
    }
}


function obterStatusLabel(status) {
    switch (status) {
        case "pendente":
            return "Pendente";

        case "recebida":
            return "Recebida";

        case "cancelada":
            return "Cancelada";

        case "emProcessamento":
            return "Em processamento";

        case "finalizada":
            return "Finalizada";

        default:
            return status || "Sem status";
    }
}


function obterStatusColor(status) {
    switch (status) {
        case "recebida":
        case "finalizada":
            return "success";

        case "cancelada":
            return "error";

        case "emProcessamento":
            return "warning";

        case "pendente":
        default:
            return "default";
    }
}


export default function DetalhesCompra() {
    const navigate = useNavigate();

    const { id } = useParams();

    const {
        buscarPorId
    } = useCompras();

    const [compra, setCompra] =
        useState(null);

    const [carregando, setCarregando] =
        useState(true);

    const [erro, setErro] =
        useState("");


    useEffect(() => {
        async function carregar() {
            try {
                setCarregando(true);
                setErro("");

                const resultado =
                    await buscarPorId(id);

                if (!resultado) {
                    setErro(
                        "Compra não encontrada."
                    );
                    return;
                }

                setCompra(resultado);
            } catch (error) {
                console.error(
                    "Erro ao carregar compra:",
                    error
                );

                setErro(
                    error?.message ||
                    "Não foi possível carregar os dados da compra."
                );
            } finally {
                setCarregando(false);
            }
        }

        if (id) {
            carregar();
        }
    }, [id, buscarPorId]);


    function voltar() {
        navigate("/compras/realizar");
    }


    function editarCompra() {
        navigate(
            `/compras/realizar?editar=${id}`
        );
    }


    function receberCompra() {
        navigate(
            `/compras/receber/${id}`
        );
    }


    if (carregando) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 300
                }}
            >
                <CircularProgress />
            </Box>
        );
    }


    if (erro || !compra) {
        return (
            <Box>
                <Alert severity="error">
                    {erro ||
                        "Compra não encontrada."}
                </Alert>

                <Button
                    sx={{ mt: 2 }}
                    startIcon={
                        <ArrowBackIcon />
                    }
                    onClick={voltar}
                >
                    Voltar para compras
                </Button>
            </Box>
        );
    }


    const itens =
        Array.isArray(compra.itens)
            ? compra.itens
            : [];


    const status =
        compra.status ||
        "pendente";


    const podeReceber =
        status === "pendente" ||
        status === "emProcessamento";


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
                sx={{ mb: 3 }}
            >

                <Box>

                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Detalhes da compra
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        Visualize os dados e os
                        produtos desta compra.
                    </Typography>

                </Box>


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


            {/* =================================================
                INFORMAÇÕES DA COMPRA
            ================================================= */}

            <Paper
                sx={{
                    p: {
                        xs: 2,
                        sm: 3
                    },
                    mb: 3
                }}
            >

                <Stack
                    direction={{
                        xs: "column",
                        md: "row"
                    }}
                    spacing={3}
                    justifyContent="space-between"
                >

                    <Box>

                        <Typography
                            variant="overline"
                            color="text.secondary"
                        >
                            Fornecedor
                        </Typography>

                        <Typography
                            variant="h6"
                            fontWeight={600}
                        >
                            {compra.fornecedorNome ||
                                "-"}
                        </Typography>

                    </Box>


                    <Box>

                        <Typography
                            variant="overline"
                            color="text.secondary"
                        >
                            Status
                        </Typography>

                        <Box sx={{ mt: 0.5 }}>
                            <Chip
                                label={
                                    obterStatusLabel(
                                        status
                                    )
                                }
                                color={
                                    obterStatusColor(
                                        status
                                    )
                                }
                            />
                        </Box>

                    </Box>


                    <Box>

                        <Typography
                            variant="overline"
                            color="text.secondary"
                        >
                            Data da compra
                        </Typography>

                        <Typography>
                            {formatarData(
                                compra.criadoEm
                            )}
                        </Typography>

                    </Box>


                    <Box>

                        <Typography
                            variant="overline"
                            color="text.secondary"
                        >
                            Total
                        </Typography>

                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            {formatarMoeda(
                                compra.total
                            )}
                        </Typography>

                    </Box>

                </Stack>

            </Paper>


            {/* =================================================
                ITENS
            ================================================= */}

            <Paper
                sx={{
                    mb: 3
                }}
            >

                <Box
                    sx={{
                        p: {
                            xs: 2,
                            sm: 3
                        }
                    }}
                >

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >

                        <ShoppingCartIcon />

                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Produtos da compra
                        </Typography>

                    </Stack>

                </Box>


                <Divider />


                {itens.length === 0 ? (

                    <Box sx={{ p: 3 }}>
                        <Alert severity="warning">
                            Esta compra não possui
                            produtos cadastrados.
                        </Alert>
                    </Box>

                ) : (

                    <TableContainer>

                        <Table>

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        Produto
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                    >
                                        Quantidade
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                    >
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

                                {itens.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <TableRow
                                            key={
                                                item.produtoId ||
                                                index
                                            }
                                        >

                                            <TableCell>

                                                <Typography
                                                    fontWeight={600}
                                                >
                                                    {
                                                        item.produtoNome ||
                                                        "-"
                                                    }
                                                </Typography>

                                                {item.produtoId && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        ID:{" "}
                                                        {
                                                            item.produtoId
                                                        }
                                                    </Typography>
                                                )}

                                            </TableCell>


                                            <TableCell
                                                align="right"
                                            >
                                                {Number(
                                                    item.quantidade ??
                                                    0
                                                ).toLocaleString(
                                                    "pt-BR"
                                                )}
                                            </TableCell>


                                            <TableCell
                                                align="right"
                                            >
                                                {formatarMoeda(
                                                    item.custoUnitario
                                                )}
                                            </TableCell>


                                            <TableCell
                                                align="right"
                                            >
                                                <Typography
                                                    fontWeight={600}
                                                >
                                                    {formatarMoeda(
                                                        item.subtotal
                                                    )}
                                                </Typography>
                                            </TableCell>

                                        </TableRow>

                                    )
                                )}

                            </TableBody>

                        </Table>

                    </TableContainer>

                )}

            </Paper>


            {/* =================================================
                OBSERVAÇÃO
            ================================================= */}

            {compra.observacao && (

                <Paper
                    sx={{
                        p: {
                            xs: 2,
                            sm: 3
                        },
                        mb: 3
                    }}
                >

                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ mb: 1 }}
                    >
                        Observação
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        {compra.observacao}
                    </Typography>

                </Paper>

            )}


            {/* =================================================
                AÇÕES
            ================================================= */}

            <Paper
                sx={{
                    p: {
                        xs: 2,
                        sm: 3
                    }
                }}
            >

                <Stack
                    direction={{
                        xs: "column",
                        sm: "row"
                    }}
                    justifyContent="flex-end"
                    spacing={1}
                >

                    <Button
                        variant="outlined"
                        startIcon={
                            <EditOutlinedIcon fontSize="small" />
                        }
                        onClick={
                            editarCompra
                        }
                    >
                        Editar compra
                    </Button>


                    {podeReceber && (

                        <Button
                            variant="contained"
                            color="success"
                            startIcon={
                                <InventoryIcon />
                            }
                            onClick={
                                receberCompra
                            }
                        >
                            Receber compra
                        </Button>

                    )}

                </Stack>

            </Paper>

        </Box>
    );
}
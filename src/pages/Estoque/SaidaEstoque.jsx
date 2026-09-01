import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

import {
    usePermissions,
    PERMISSOES
} from "../../context/PermissionContext";

import { useProdutos } from "../../context/ProdutoContext";

import {
    registrarSaidaEstoque
} from "../../services/movimentacaoService";

export default function SaidaEstoque() {
    const navigate = useNavigate();

    const {
        produtos,
        carregando,
        atualizarProdutoLocal
    } = useProdutos();

    const {
        temPermissao
    } = usePermissions();

    const podeRetirar =
        temPermissao(
            PERMISSOES.ESTOQUE_RETIRAR
        );

    const [produtoId, setProdutoId] =
        useState("");

    const [quantidade, setQuantidade] =
        useState("");

    const [observacao, setObservacao] =
        useState("");

    const [salvando, setSalvando] =
        useState(false);

    const [erro, setErro] =
        useState("");

    const [sucesso, setSucesso] =
        useState("");

    const produtoSelecionado =
        produtos.find(
            (produto) =>
                produto.id === produtoId
        );

    const estoqueAtual =
        Number(
            produtoSelecionado?.estoqueAtual ?? 0
        );

    function voltar() {
        navigate("/estoque");
    }

    function alterarQuantidade(event) {
        const valor =
            event.target.value;

        if (valor === "") {
            setQuantidade("");
            return;
        }

        if (valor.includes("-")) {
            return;
        }

        const numero =
            Number(valor);

        if (
            !Number.isFinite(numero) ||
            numero < 0
        ) {
            return;
        }

        if (
            numero > estoqueAtual
        ) {
            setQuantidade(
                String(estoqueAtual)
            );
            return;
        }

        setQuantidade(valor);
    }

    async function salvarSaida(event) {
        event.preventDefault();

        setErro("");
        setSucesso("");

        if (!podeRetirar) {
            setErro(
                "Você não possui permissão para registrar saídas de estoque."
            );
            return;
        }

        if (!produtoId) {
            setErro(
                "Selecione um produto."
            );
            return;
        }

        const quantidadeNumerica =
            Number(quantidade);

        if (
            !Number.isFinite(
                quantidadeNumerica
            ) ||
            quantidadeNumerica <= 0
        ) {
            setErro(
                "Informe uma quantidade maior que zero."
            );
            return;
        }

        if (
            quantidadeNumerica >
            estoqueAtual
        ) {
            setErro(
                `Quantidade maior que o estoque disponível. Disponível: ${estoqueAtual} ${produtoSelecionado?.unidade ?? "UN"}.`
            );
            return;
        }

        try {
            setSalvando(true);

            await registrarSaidaEstoque({
                produtoId,
                quantidade:
                    quantidadeNumerica,
                observacao
            });

            const novoEstoque =
                estoqueAtual -
                quantidadeNumerica;

            atualizarProdutoLocal(
                produtoId,
                {
                    estoqueAtual:
                        novoEstoque
                }
            );

            setSucesso(
                "Saída de estoque registrada com sucesso."
            );

            setQuantidade("");
            setObservacao("");

            setTimeout(() => {
                navigate("/estoque");
            }, 800);
        } catch (error) {
            console.error(
                "Erro ao registrar saída:",
                error
            );

            setErro(
                error?.message ||
                "Não foi possível registrar a saída de estoque."
            );
        } finally {
            setSalvando(false);
        }
    }

    if (!podeRetirar) {
        return (
            <Box>
                <Alert severity="error">
                    Você não possui permissão para
                    registrar saídas de estoque.
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
                        Saída de estoque
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        Registre a retirada de produtos
                        do estoque.
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

            <Paper
                sx={{
                    p: {
                        xs: 2,
                        sm: 3
                    }
                }}
            >
                <Box
                    component="form"
                    onSubmit={salvarSaida}
                >
                    <Stack spacing={2.5}>
                        {erro && (
                            <Alert severity="error">
                                {erro}
                            </Alert>
                        )}

                        {sucesso && (
                            <Alert severity="success">
                                {sucesso}
                            </Alert>
                        )}

                        {carregando ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent:
                                        "center",
                                    py: 4
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TextField
                                    select
                                    required
                                    fullWidth
                                    label="Produto"
                                    value={produtoId}
                                    onChange={(event) => {
                                        setProdutoId(
                                            event.target.value
                                        );
                                        setQuantidade("");
                                        setErro("");
                                    }}
                                >
                                    <MenuItem value="">
                                        Selecione um produto
                                    </MenuItem>

                                    {produtos
                                        .filter(
                                            (produto) =>
                                                produto.status !==
                                                "inativo"
                                        )
                                        .map(
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
                                                        produto.codigo
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        produto.nome
                                                    }
                                                </MenuItem>
                                            )
                                        )}
                                </TextField>

                                {produtoSelecionado && (
                                    <Alert severity="info">
                                        Estoque disponível:{" "}
                                        <strong>
                                            {
                                                produtoSelecionado.estoqueAtual ??
                                                0
                                            }{" "}
                                            {
                                                produtoSelecionado.unidade ??
                                                "UN"
                                            }
                                        </strong>
                                    </Alert>
                                )}

                                <TextField
                                    required
                                    fullWidth
                                    label="Quantidade"
                                    type="number"
                                    value={quantidade}
                                    onChange={
                                        alterarQuantidade
                                    }
                                    inputProps={{
                                        min: 0,
                                        max:
                                            estoqueAtual,
                                        step: "0.01"
                                    }}
                                    helperText={
                                        produtoSelecionado
                                            ? `Máximo disponível: ${estoqueAtual} ${produtoSelecionado.unidade ?? "UN"}`
                                            : "Selecione um produto para informar a quantidade."
                                    }
                                />

                                <TextField
                                    fullWidth
                                    label="Observação"
                                    value={observacao}
                                    onChange={(event) =>
                                        setObservacao(
                                            event.target.value
                                        )
                                    }
                                    multiline
                                    minRows={3}
                                    placeholder="Ex.: Venda, consumo interno, perda, ajuste..."
                                />

                                {produtoSelecionado &&
                                    quantidade !== "" &&
                                    Number.isFinite(
                                        Number(quantidade)
                                    ) &&
                                    Number(quantidade) > 0 &&
                                    Number(quantidade) <=
                                        estoqueAtual && (
                                        <Alert severity="success">
                                            Novo estoque:{" "}
                                            <strong>
                                                {(
                                                    estoqueAtual -
                                                    Number(
                                                        quantidade
                                                    )
                                                ).toLocaleString(
                                                    "pt-BR"
                                                )}{" "}
                                                {
                                                    produtoSelecionado.unidade ??
                                                    "UN"
                                                }
                                            </strong>
                                        </Alert>
                                    )}

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
                                        onClick={voltar}
                                        disabled={salvando}
                                    >
                                        Cancelar
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={
                                            salvando ? (
                                                <CircularProgress
                                                    size={18}
                                                    color="inherit"
                                                />
                                            ) : (
                                                <SaveIcon />
                                            )
                                        }
                                        disabled={
                                            salvando ||
                                            carregando ||
                                            !produtoId ||
                                            !quantidade ||
                                            Number(
                                                quantidade
                                            ) <= 0 ||
                                            Number(
                                                quantidade
                                            ) > estoqueAtual
                                        }
                                    >
                                        {salvando
                                            ? "Registrando..."
                                            : "Registrar saída"}
                                    </Button>
                                </Stack>
                            </>
                        )}
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
}
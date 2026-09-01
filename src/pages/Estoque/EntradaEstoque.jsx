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
    registrarEntradaEstoque
} from "../../services/movimentacaoService";

export default function EntradaEstoque() {
    const navigate = useNavigate();

    const {
        produtos,
        carregando,
        atualizarProdutoLocal
    } = useProdutos();

    const {
        temPermissao
    } = usePermissions();

    const podeCadastrar =
        temPermissao(
            PERMISSOES.ESTOQUE_CADASTRAR
        );

    const [produtoId, setProdutoId] =
        useState("");

    const [quantidade, setQuantidade] =
        useState("");

    const [custoUnitario, setCustoUnitario] =
        useState("");

    const [observacao, setObservacao] =
        useState("");

    const [origem, setOrigem] =
        useState("entradaManual");

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

    function voltar() {
        navigate("/estoque");
    }

    function atualizarQuantidade(event) {
        const valor = event.target.value;

        if (valor === "") {
            setQuantidade("");
            return;
        }

        if (valor.includes("-")) {
            return;
        }

        const numero = Number(valor);

        if (
            !Number.isFinite(numero) ||
            numero < 0
        ) {
            return;
        }

        setQuantidade(valor);
    }

    function atualizarCusto(event) {
        const valor = event.target.value;

        if (valor === "") {
            setCustoUnitario("");
            return;
        }

        if (valor.includes("-")) {
            return;
        }

        const numero = Number(valor);

        if (
            !Number.isFinite(numero) ||
            numero < 0
        ) {
            return;
        }

        setCustoUnitario(valor);
    }

    async function salvarEntrada(event) {
        event.preventDefault();

        setErro("");
        setSucesso("");

        if (!podeCadastrar) {
            setErro(
                "Você não possui permissão para registrar entradas de estoque."
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

        const estoqueAtual =
            Number(
                produtoSelecionado?.estoqueAtual ?? 0
            );

        const estoqueMaximo =
            Number(
                produtoSelecionado?.estoqueMaximo ?? 0
            );

        if (
            !Number.isFinite(
                estoqueAtual
            ) ||
            estoqueAtual < 0
        ) {
            setErro(
                "O estoque atual do produto é inválido."
            );
            return;
        }

        if (
            !Number.isFinite(
                estoqueMaximo
            ) ||
            estoqueMaximo < 0
        ) {
            setErro(
                "O estoque máximo do produto é inválido."
            );
            return;
        }

        const novoEstoque =
            estoqueAtual +
            quantidadeNumerica;

        if (
            estoqueMaximo > 0 &&
            novoEstoque > estoqueMaximo
        ) {
            setErro(
                `Essa entrada ultrapassa o estoque máximo. Máximo: ${estoqueMaximo} ${produtoSelecionado?.unidade ?? "UN"}.`
            );
            return;
        }

        const custoNumerico =
            custoUnitario === ""
                ? ""
                : Number(custoUnitario);

        if (
            custoNumerico !== "" &&
            (
                !Number.isFinite(
                    custoNumerico
                ) ||
                custoNumerico < 0
            )
        ) {
            setErro(
                "Informe um custo unitário válido."
            );
            return;
        }

        try {
            setSalvando(true);

            await registrarEntradaEstoque({
                produtoId,
                quantidade:
                    quantidadeNumerica,
                custoUnitario:
                    custoNumerico,
                observacao,
                origem
            });

            const dadosAtualizados = {
                estoqueAtual:
                    novoEstoque
            };

            if (custoNumerico !== "") {
                dadosAtualizados.custoAtual =
                    custoNumerico;
            }

            atualizarProdutoLocal(
                produtoId,
                dadosAtualizados
            );

            setSucesso(
                "Entrada de estoque registrada com sucesso."
            );

            setQuantidade("");
            setCustoUnitario("");
            setObservacao("");

            setTimeout(() => {
                navigate("/estoque");
            }, 800);
        } catch (error) {
            console.error(
                "Erro ao registrar entrada:",
                error
            );

            setErro(
                error?.message ||
                "Não foi possível registrar a entrada de estoque."
            );
        } finally {
            setSalvando(false);
        }
    }

    if (!podeCadastrar) {
        return (
            <Box>
                <Alert severity="error">
                    Você não possui permissão para
                    registrar entradas de estoque.
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

    const estoqueAtual =
        Number(
            produtoSelecionado?.estoqueAtual ?? 0
        );

    const estoqueMaximo =
        Number(
            produtoSelecionado?.estoqueMaximo ?? 0
        );

    const quantidadeNumerica =
        Number(quantidade);

    const novoEstoque =
        estoqueAtual +
        quantidadeNumerica;

    const ultrapassaMaximo =
        produtoSelecionado &&
        quantidade !== "" &&
        Number.isFinite(
            quantidadeNumerica
        ) &&
        quantidadeNumerica > 0 &&
        estoqueMaximo > 0 &&
        novoEstoque > estoqueMaximo;

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
                        Entrada de estoque
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        Registre a entrada de produtos
                        no estoque.
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
                    onSubmit={salvarEntrada}
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
                                    <Stack spacing={1}>
                                        <Alert severity="info">
                                            Estoque atual:{" "}
                                            <strong>
                                                {estoqueAtual}{" "}
                                                {
                                                    produtoSelecionado.unidade ??
                                                    "UN"
                                                }
                                            </strong>
                                        </Alert>

                                        <Alert
                                            severity={
                                                estoqueMaximo > 0 &&
                                                estoqueAtual >=
                                                    estoqueMaximo
                                                    ? "warning"
                                                    : "info"
                                            }
                                        >
                                            Estoque máximo:{" "}
                                            <strong>
                                                {estoqueMaximo > 0
                                                    ? `${estoqueMaximo} ${produtoSelecionado.unidade ?? "UN"}`
                                                    : "Sem limite"}
                                            </strong>
                                        </Alert>
                                    </Stack>
                                )}

                                <TextField
                                    required
                                    fullWidth
                                    label="Quantidade"
                                    type="number"
                                    value={quantidade}
                                    onChange={
                                        atualizarQuantidade
                                    }
                                    inputProps={{
                                        min: 0,
                                        step: "0.01"
                                    }}
                                    error={Boolean(
                                        ultrapassaMaximo
                                    )}
                                    helperText={
                                        ultrapassaMaximo
                                            ? `A entrada ultrapassa o estoque máximo de ${estoqueMaximo} ${produtoSelecionado?.unidade ?? "UN"}.`
                                            : ""
                                    }
                                />

                                <TextField
                                    fullWidth
                                    label="Custo unitário"
                                    type="number"
                                    value={
                                        custoUnitario
                                    }
                                    onChange={
                                        atualizarCusto
                                    }
                                    inputProps={{
                                        min: 0,
                                        step: "0.01"
                                    }}
                                />

                                <TextField
                                    select
                                    fullWidth
                                    label="Origem"
                                    value={origem}
                                    onChange={(event) =>
                                        setOrigem(
                                            event.target.value
                                        )
                                    }
                                >
                                    <MenuItem value="entradaManual">
                                        Entrada manual
                                    </MenuItem>

                                    <MenuItem value="compra">
                                        Compra
                                    </MenuItem>

                                    <MenuItem value="notaFiscal">
                                        Nota fiscal
                                    </MenuItem>

                                    <MenuItem value="devolucao">
                                        Devolução
                                    </MenuItem>

                                    <MenuItem value="ajuste">
                                        Ajuste
                                    </MenuItem>

                                    <MenuItem value="outros">
                                        Outros
                                    </MenuItem>
                                </TextField>

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
                                    placeholder="Ex.: Compra de fornecedor, reposição, devolução..."
                                />

                                {produtoSelecionado &&
                                    quantidade !== "" &&
                                    Number.isFinite(
                                        quantidadeNumerica
                                    ) &&
                                    quantidadeNumerica > 0 && (
                                        ultrapassaMaximo ? (
                                            <Alert severity="error">
                                                Não é possível registrar esta
                                                entrada.
                                                <br />
                                                Estoque após entrada:{" "}
                                                <strong>
                                                    {novoEstoque}{" "}
                                                    {
                                                        produtoSelecionado.unidade ??
                                                        "UN"
                                                    }
                                                </strong>
                                                <br />
                                                Estoque máximo:{" "}
                                                <strong>
                                                    {estoqueMaximo}{" "}
                                                    {
                                                        produtoSelecionado.unidade ??
                                                        "UN"
                                                    }
                                                </strong>
                                            </Alert>
                                        ) : (
                                            <Alert severity="success">
                                                Novo estoque:{" "}
                                                <strong>
                                                    {novoEstoque}{" "}
                                                    {
                                                        produtoSelecionado.unidade ??
                                                        "UN"
                                                    }
                                                </strong>
                                            </Alert>
                                        )
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
                                            Boolean(
                                                ultrapassaMaximo
                                            )
                                        }
                                    >
                                        {salvando
                                            ? "Registrando..."
                                            : "Registrar entrada"}
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
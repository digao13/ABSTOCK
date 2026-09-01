import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { useCompras } from "../../context/CompraContext";
import { useProdutos } from "../../context/ProdutoContext";
import { useFornecedores } from "../../context/FornecedorContext";

export default function NovaCompra() {
    const navigate = useNavigate();

    const {
        criarCompra,
        salvando
    } = useCompras();

    const {
        produtos,
        carregando: carregandoProdutos
    } = useProdutos();

    const {
        fornecedores,
        carregando: carregandoFornecedores
    } = useFornecedores();

    const [fornecedorId, setFornecedorId] =
        useState("");

    const [observacao, setObservacao] =
        useState("");

    const [itens, setItens] = useState([
        {
            produtoId: "",
            produtoNome: "",
            quantidade: "",
            custoUnitario: ""
        }
    ]);

    const [erro, setErro] =
        useState("");

    const [sucesso, setSucesso] =
        useState("");

    // =========================================================
    // FORNECEDOR SELECIONADO
    // =========================================================

    const fornecedorSelecionado =
        fornecedores.find(
            (fornecedor) =>
                fornecedor.id === fornecedorId
        );

    // =========================================================
    // PRODUTOS ATIVOS
    // =========================================================

    const produtosAtivos =
        produtos.filter(
            (produto) =>
                produto.status !== "inativo"
        );

    // =========================================================
    // ALTERAR ITEM
    // =========================================================

    function alterarItem(index, campo, valor) {
        setItens((listaAtual) =>
            listaAtual.map(
                (item, itemIndex) => {
                    if (
                        itemIndex !== index
                    ) {
                        return item;
                    }

                    return {
                        ...item,
                        [campo]: valor
                    };
                }
            )
        );

        setErro("");
    }

    // =========================================================
    // SELECIONAR PRODUTO
    // =========================================================

    function selecionarProduto(
        index,
        produtoId
    ) {
        const produto =
            produtos.find(
                (item) =>
                    item.id === produtoId
            );

        setItens((listaAtual) =>
            listaAtual.map(
                (item, itemIndex) => {
                    if (
                        itemIndex !== index
                    ) {
                        return item;
                    }

                    return {
                        ...item,
                        produtoId,
                        produtoNome:
                            produto?.nome ?? ""
                    };
                }
            )
        );

        setErro("");
    }

    // =========================================================
    // QUANTIDADE
    // =========================================================

    function alterarQuantidade(
        index,
        valor
    ) {
        if (valor === "") {
            alterarItem(
                index,
                "quantidade",
                ""
            );
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

        alterarItem(
            index,
            "quantidade",
            valor
        );
    }

    // =========================================================
    // CUSTO
    // =========================================================

    function alterarCusto(
        index,
        valor
    ) {
        if (valor === "") {
            alterarItem(
                index,
                "custoUnitario",
                ""
            );
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

        alterarItem(
            index,
            "custoUnitario",
            valor
        );
    }

    // =========================================================
    // ADICIONAR ITEM
    // =========================================================

    function adicionarItem() {
        setItens((listaAtual) => [
            ...listaAtual,
            {
                produtoId: "",
                produtoNome: "",
                quantidade: "",
                custoUnitario: ""
            }
        ]);
    }

    // =========================================================
    // REMOVER ITEM
    // =========================================================

    function removerItem(index) {
        if (itens.length === 1) {
            setItens([
                {
                    produtoId: "",
                    produtoNome: "",
                    quantidade: "",
                    custoUnitario: ""
                }
            ]);

            return;
        }

        setItens((listaAtual) =>
            listaAtual.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );
    }

    // =========================================================
    // TOTAL
    // =========================================================

    const totalCompra =
        itens.reduce(
            (total, item) => {
                const quantidade =
                    Number(
                        item.quantidade || 0
                    );

                const custo =
                    Number(
                        item.custoUnitario || 0
                    );

                return (
                    total +
                    quantidade * custo
                );
            },
            0
        );

    // =========================================================
    // FORMATAR MOEDA
    // =========================================================

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }

    // =========================================================
    // VOLTAR
    // =========================================================

    function voltar() {
        navigate("/compras");
    }

    // =========================================================
    // SALVAR
    // =========================================================

    async function salvarCompra(event) {
        event.preventDefault();

        setErro("");
        setSucesso("");

        // -----------------------------------------------------
        // FORNECEDOR
        // -----------------------------------------------------

        if (!fornecedorId) {
            setErro(
                "Selecione um fornecedor."
            );
            return;
        }

        if (!fornecedorSelecionado) {
            setErro(
                "O fornecedor selecionado não foi encontrado."
            );
            return;
        }

        // -----------------------------------------------------
        // ITENS
        // -----------------------------------------------------

        if (
            !Array.isArray(itens) ||
            itens.length === 0
        ) {
            setErro(
                "Adicione pelo menos um produto à compra."
            );
            return;
        }

        // -----------------------------------------------------
        // VALIDAR ITENS
        // -----------------------------------------------------

        for (
            let index = 0;
            index < itens.length;
            index++
        ) {
            const item =
                itens[index];

            if (!item.produtoNome) {
                setErro(
                    `Selecione o produto do item ${index + 1}.`
                );
                return;
            }

            const quantidade =
                Number(
                    item.quantidade
                );

            if (
                !Number.isFinite(
                    quantidade
                ) ||
                quantidade <= 0
            ) {
                setErro(
                    `Informe uma quantidade válida no item ${index + 1}.`
                );
                return;
            }

            const custo =
                Number(
                    item.custoUnitario
                );

            if (
                !Number.isFinite(custo) ||
                custo < 0
            ) {
                setErro(
                    `Informe um custo unitário válido no item ${index + 1}.`
                );
                return;
            }
        }

        // -----------------------------------------------------
        // PREPARAR ITENS
        // -----------------------------------------------------

        const itensCompra =
            itens.map((item) => {
                const quantidade =
                    Number(
                        item.quantidade
                    );

                const custoUnitario =
                    Number(
                        item.custoUnitario
                    );

                return {
                    produtoId:
                        item.produtoId ||
                        null,

                    produtoNome:
                        item.produtoNome,

                    quantidade,

                    custoUnitario,

                    subtotal:
                        quantidade *
                        custoUnitario
                };
            });

        try {
            const id =
                await criarCompra({
                    fornecedorId,

                    fornecedorNome:
                        fornecedorSelecionado.nome,

                    itens:
                        itensCompra,

                    total:
                        totalCompra,

                    status:
                        "pendente",

                    observacao
                });

            console.log(
                "Compra cadastrada:",
                id
            );

            setSucesso(
                "Compra cadastrada com sucesso."
            );

            setTimeout(() => {
                navigate(
                    `/compras/${id}`
                );
            }, 800);
        } catch (error) {
            console.error(
                "Erro ao cadastrar compra:",
                error
            );

            setErro(
                error?.message ||
                "Não foi possível cadastrar a compra."
            );
        }
    }

    // =========================================================
    // CARREGANDO
    // =========================================================

    const carregando =
        carregandoProdutos ||
        carregandoFornecedores;

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Box>

            {/* ================================================= */}
            {/* CABEÇALHO */}
            {/* ================================================= */}

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
                        Nova compra
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        Registre uma nova compra
                        de produtos.
                    </Typography>

                </Box>

                <Button
                    variant="outlined"
                    startIcon={
                        <ArrowBackIcon />
                    }
                    onClick={voltar}
                    disabled={salvando}
                >
                    Voltar
                </Button>

            </Stack>

            {/* ================================================= */}
            {/* FORMULÁRIO */}
            {/* ================================================= */}

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
                    onSubmit={salvarCompra}
                >

                    <Stack spacing={3}>

                        {/* ===================================== */}
                        {/* ALERTAS */}
                        {/* ===================================== */}

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

                        {/* ===================================== */}
                        {/* FORNECEDOR */}
                        {/* ===================================== */}

                        <TextField
                            select
                            required
                            fullWidth
                            label="Fornecedor"
                            value={fornecedorId}
                            onChange={(event) => {
                                setFornecedorId(
                                    event.target.value
                                );
                                setErro("");
                            }}
                            disabled={
                                carregando ||
                                salvando
                            }
                        >

                            <MenuItem value="">
                                Selecione um fornecedor
                            </MenuItem>

                            {fornecedores
                                .filter(
                                    (fornecedor) =>
                                        fornecedor.status !==
                                        "inativo"
                                )
                                .map(
                                    (fornecedor) => (
                                        <MenuItem
                                            key={
                                                fornecedor.id
                                            }
                                            value={
                                                fornecedor.id
                                            }
                                        >
                                            {fornecedor.codigo
                                                ? `${fornecedor.codigo} - `
                                                : ""}
                                            {fornecedor.nome}
                                        </MenuItem>
                                    )
                                )}

                        </TextField>

                        {/* ===================================== */}
                        {/* DIVISOR */}
                        {/* ===================================== */}

                        <Divider />

                        {/* ===================================== */}
                        {/* PRODUTOS */}
                        {/* ===================================== */}

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
                        >

                            <Box>

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Produtos
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Adicione os produtos
                                    que fazem parte
                                    desta compra.
                                </Typography>

                            </Box>

                            <Button
                                variant="outlined"
                                startIcon={
                                    <AddIcon />
                                }
                                onClick={
                                    adicionarItem
                                }
                                disabled={
                                    salvando ||
                                    carregando
                                }
                            >
                                Adicionar produto
                            </Button>

                        </Stack>

                        {/* ===================================== */}
                        {/* ITENS */}
                        {/* ===================================== */}

                        <Stack spacing={2}>

                            {itens.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const quantidade =
                                        Number(
                                            item.quantidade ||
                                            0
                                        );

                                    const custo =
                                        Number(
                                            item.custoUnitario ||
                                            0
                                        );

                                    const subtotal =
                                        quantidade *
                                        custo;

                                    return (
                                        <Paper
                                            key={index}
                                            variant="outlined"
                                            sx={{
                                                p: 2
                                            }}
                                        >

                                            <Stack
                                                spacing={2}
                                            >

                                                {/* ================= */}
                                                {/* TÍTULO ITEM */}
                                                {/* ================= */}

                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                >

                                                    <Typography
                                                        fontWeight={600}
                                                    >
                                                        Item{" "}
                                                        {index + 1}
                                                    </Typography>

                                                    <IconButton
                                                        color="error"
                                                        onClick={() =>
                                                            removerItem(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            salvando
                                                        }
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>

                                                </Stack>

                                                {/* ================= */}
                                                {/* PRODUTO */}
                                                {/* ================= */}

                                                <TextField
                                                    select
                                                    required
                                                    fullWidth
                                                    label="Produto"
                                                    value={
                                                        item.produtoId
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        selecionarProduto(
                                                            index,
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    disabled={
                                                        salvando ||
                                                        carregando
                                                    }
                                                >

                                                    <MenuItem value="">
                                                        Selecione um produto
                                                    </MenuItem>

                                                    {produtosAtivos.map(
                                                        (
                                                            produto
                                                        ) => (
                                                            <MenuItem
                                                                key={
                                                                    produto.id
                                                                }
                                                                value={
                                                                    produto.id
                                                                }
                                                            >
                                                                {produto.codigo
                                                                    ? `${produto.codigo} - `
                                                                    : ""}
                                                                {
                                                                    produto.nome
                                                                }
                                                            </MenuItem>
                                                        )
                                                    )}

                                                </TextField>

                                                {/* ================= */}
                                                {/* QUANTIDADE / CUSTO */}
                                                {/* ================= */}

                                                <Stack
                                                    direction={{
                                                        xs: "column",
                                                        sm: "row"
                                                    }}
                                                    spacing={2}
                                                >

                                                    <TextField
                                                        required
                                                        fullWidth
                                                        label="Quantidade"
                                                        type="number"
                                                        value={
                                                            item.quantidade
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            alterarQuantidade(
                                                                index,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        inputProps={{
                                                            min: 0,
                                                            step: "0.01"
                                                        }}
                                                        disabled={
                                                            salvando
                                                        }
                                                    />

                                                    <TextField
                                                        required
                                                        fullWidth
                                                        label="Custo unitário"
                                                        type="number"
                                                        value={
                                                            item.custoUnitario
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            alterarCusto(
                                                                index,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        inputProps={{
                                                            min: 0,
                                                            step: "0.01"
                                                        }}
                                                        disabled={
                                                            salvando
                                                        }
                                                    />

                                                </Stack>

                                                {/* ================= */}
                                                {/* SUBTOTAL */}
                                                {/* ================= */}

                                                <Alert
                                                    severity="info"
                                                >
                                                    Subtotal:{" "}
                                                    <strong>
                                                        {formatarMoeda(
                                                            subtotal
                                                        )}
                                                    </strong>
                                                </Alert>

                                            </Stack>

                                        </Paper>
                                    );
                                }
                            )}

                        </Stack>

                        {/* ===================================== */}
                        {/* TOTAL */}
                        {/* ===================================== */}

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2
                            }}
                        >

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
                                spacing={1}
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
                                    {formatarMoeda(
                                        totalCompra
                                    )}
                                </Typography>

                            </Stack>

                        </Paper>

                        {/* ===================================== */}
                        {/* OBSERVAÇÃO */}
                        {/* ===================================== */}

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
                            placeholder="Ex.: Compra de fornecedor, reposição, condições de pagamento..."
                            disabled={salvando}
                        />

                        {/* ===================================== */}
                        {/* BOTÕES */}
                        {/* ===================================== */}

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
                                    !fornecedorId ||
                                    itens.length === 0
                                }
                            >
                                {salvando
                                    ? "Salvando..."
                                    : "Cadastrar compra"}
                            </Button>

                        </Stack>

                    </Stack>

                </Box>

            </Paper>

        </Box>
    );
}
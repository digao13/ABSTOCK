import { useMemo, useState } from "react";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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

import { useCompras } from "../../context/CompraContext";
import { useProdutos } from "../../context/ProdutoContext";

import {
    registrarEntradaEstoque
} from "../../services/estoqueService";

import {
    atualizarCompra
} from "../../services/compraService";


export default function ReceberCompra() {

    const {
        compras,
        carregando,
        carregarCompras
    } = useCompras();


    const {
        produtos = [],
        atualizarProdutoLocal
    } = useProdutos();


    const [
        dialogAberto,
        setDialogAberto
    ] = useState(false);


    const [
        compraSelecionada,
        setCompraSelecionada
    ] = useState(null);


    const [
        recebendo,
        setRecebendo
    ] = useState(false);


    const [
        erro,
        setErro
    ] = useState(null);


    const [
        sucesso,
        setSucesso
    ] = useState(null);


    // =========================================================
    // COMPRAS AGUARDANDO RECEBIMENTO
    // =========================================================

    const comprasPendentes =
        useMemo(() => {

            return (
                compras || []
            ).filter(
                (compra) =>
                    compra.status === "pendente" ||
                    compra.status === "realizada" ||
                    compra.status === "aguardandoRecebimento"
            );

        }, [compras]);


    // =========================================================
    // FORMATAR VALOR
    // =========================================================

    function formatarValor(valor) {

        const numero =
            Number(valor);

        if (
            !Number.isFinite(numero)
        ) {
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


            return new Date(data)
                .toLocaleDateString(
                    "pt-BR"
                );

        } catch {

            return "-";

        }
    }


    // =========================================================
    // NORMALIZAR TEXTO
    // =========================================================

    function normalizarTexto(valor) {

        return String(
            valor || ""
        )
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );
    }


    // =========================================================
    // LOCALIZAR PRODUTO
    // =========================================================
    //
    // Prioridade:
    //
    // 1. produtoId gravado na compra
    // 2. ID alternativo do produto
    // 3. nome exato do produto
    //
    // Isso permite receber compras antigas que foram
    // cadastradas sem produtoId.
    //

    function localizarProduto(item) {

        const listaProdutos =
            Array.isArray(produtos)
                ? produtos
                : [];


        if (
            listaProdutos.length === 0
        ) {

            return null;

        }


        // =====================================================
        // 1. PROCURAR PELO PRODUTO ID
        // =====================================================

        if (item?.produtoId) {

            const encontradoPorId =
                listaProdutos.find(
                    (produto) =>
                        String(
                            produto.id
                        ) ===
                        String(
                            item.produtoId
                        ) ||
                        String(
                            produto.produtoId
                        ) ===
                        String(
                            item.produtoId
                        )
                );


            if (encontradoPorId) {

                return encontradoPorId;

            }
        }


        // =====================================================
        // 2. PROCURAR PELO NOME
        // =====================================================

        const nomeItem =
            normalizarTexto(
                item?.produtoNome
            );


        if (!nomeItem) {

            return null;

        }


        const encontradoPorNome =
            listaProdutos.find(
                (produto) => {

                    const nomesPossiveis = [

                        produto.nome,

                        produto.nomeProduto,

                        produto.produtoNome,

                        produto.descricao,

                        produto.titulo

                    ];


                    return nomesPossiveis.some(
                        (nome) =>
                            normalizarTexto(
                                nome
                            ) ===
                            nomeItem
                    );

                }
            );


        return encontradoPorNome || null;

    }


    // =========================================================
    // OBTER ID DO PRODUTO
    // =========================================================

    function obterProdutoId(produto) {

        if (!produto) {
            return null;
        }


        return (
            produto.id ||
            produto.produtoId ||
            produto.codigo ||
            null
        );

    }


    // =========================================================
    // ABRIR RECEBIMENTO
    // =========================================================

    function abrirRecebimento(
        compra
    ) {

        setCompraSelecionada(
            compra
        );

        setErro(null);

        setSucesso(null);

        setDialogAberto(true);

    }


    // =========================================================
    // FECHAR DIALOG
    // =========================================================

    function fecharDialog() {

        if (recebendo) {
            return;
        }


        setDialogAberto(false);

        setCompraSelecionada(
            null
        );

        setErro(null);

        setSucesso(null);

    }


    // =========================================================
    // RECEBER COMPRA
    // =========================================================

    async function confirmarRecebimento() {

        setErro(null);

        setSucesso(null);


        if (!compraSelecionada) {

            setErro(
                "Nenhuma compra foi selecionada."
            );

            return;

        }


        if (
            !Array.isArray(
                compraSelecionada.itens
            ) ||
            compraSelecionada.itens.length === 0
        ) {

            setErro(
                "Esta compra não possui itens para receber."
            );

            return;

        }


        setRecebendo(true);


        try {

            // =====================================================
            // VALIDAR TODOS OS PRODUTOS ANTES DE ALTERAR ESTOQUE
            // =====================================================
            //
            // Isso é importante.
            //
            // Se uma compra tiver 5 itens e o quarto estiver
            // inválido, não queremos adicionar os primeiros
            // 3 ao estoque e depois parar.
            //

            const itensProcessados = [];


            for (
                const item
                of compraSelecionada.itens
            ) {

                const produtoEncontrado =
                    localizarProduto(
                        item
                    );


                const produtoId =
                    item?.produtoId ||
                    obterProdutoId(
                        produtoEncontrado
                    );


                // =================================================
                // PRODUTO NÃO ENCONTRADO
                // =================================================

                if (!produtoId) {

                    console.error(
                        "PRODUTO NÃO ENCONTRADO PARA RECEBIMENTO:",
                        {
                            item,
                            produtosDisponiveis:
                                produtos
                        }
                    );


                    throw new Error(
                        `O item "${item?.produtoNome || "sem nome"}" não possui produto vinculado ao estoque. Cadastre o produto ou verifique o nome do item.`
                    );

                }


                // =================================================
                // QUANTIDADE
                // =================================================

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

                    throw new Error(
                        `A quantidade do item "${item?.produtoNome || "sem nome"}" é inválida.`
                    );

                }


                // =================================================
                // CUSTO
                // =================================================

                const custoUnitario =
                    Number(
                        item.custoUnitario
                    );


                if (
                    !Number.isFinite(
                        custoUnitario
                    ) ||
                    custoUnitario < 0
                ) {

                    throw new Error(
                        `O custo do item "${item?.produtoNome || "sem nome"}" é inválido.`
                    );

                }


                itensProcessados.push({

                    item,

                    produtoEncontrado,

                    produtoId,

                    quantidade,

                    custoUnitario

                });

            }


            // =====================================================
            // REGISTRAR ENTRADAS
            // =====================================================

            for (
                const itemProcessado
                of itensProcessados
            ) {

                const {
                    item,
                    produtoId,
                    quantidade,
                    custoUnitario
                } = itemProcessado;


                console.log(
                    "RECEBENDO ITEM:",
                    {
                        produtoNome:
                            item.produtoNome,

                        produtoId,

                        quantidade,

                        custoUnitario
                    }
                );


                // =================================================
                // REGISTRAR ENTRADA NO ESTOQUE
                // =================================================

                const resultado =
                    await registrarEntradaEstoque(
                        {
                            produtoId,

                            quantidade,

                            custoUnitario,

                            observacao:
                                `Recebimento da compra ${compraSelecionada.id}`,

                            origem:
                                "recebimentoCompra"
                        }
                    );


                console.log(
                    "ENTRADA ESTOQUE REALIZADA:",
                    {
                        produtoId,

                        resultado
                    }
                );


                // =================================================
                // ATUALIZAR PRODUTO LOCALMENTE
                // =================================================

                if (
                    typeof atualizarProdutoLocal ===
                    "function"
                ) {

                    const atualizacao = {

                        estoqueAtual:
                            resultado?.estoquePosterior

                    };


                    if (
                        resultado?.custoAtual !==
                            null &&
                        resultado?.custoAtual !==
                            undefined
                    ) {

                        atualizacao.custoAtual =
                            resultado.custoAtual;

                    }


                    atualizarProdutoLocal(
                        produtoId,
                        atualizacao
                    );

                }

            }


            // =====================================================
            // ATUALIZAR STATUS DA COMPRA
            // =====================================================

            await atualizarCompra(
                compraSelecionada.id,
                {
                    status: "recebida"
                }
            );


            // =====================================================
            // RECARREGAR COMPRAS
            // =====================================================

            await carregarCompras();


            // =====================================================
            // SUCESSO
            // =====================================================

            setSucesso(
                "Compra recebida e entrada no estoque realizada com sucesso."
            );


            setTimeout(() => {

                setDialogAberto(
                    false
                );

                setCompraSelecionada(
                    null
                );

                setSucesso(null);

            }, 1200);


        } catch (error) {

            console.error(
                "Erro ao receber compra:",
                error
            );


            setErro(
                error?.message ||
                "Não foi possível receber a compra."
            );


        } finally {

            setRecebendo(false);

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

                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        <MoveToInboxOutlinedIcon sx={{ fontSize: 48, color: "#ff9b3d", verticalAlign: "middle", mr: 1 }} />Receber Compras
                    </Typography>


                    <Typography
                        color="text.secondary"
                    >
                        Receba as compras realizadas
                        e dê entrada dos produtos
                        no estoque.
                    </Typography>

                </Box>

            </Stack>


            {/* =====================================================
                SUCESSO
            ===================================================== */}

            {sucesso && (

                <Alert
                    severity="success"
                    sx={{
                        mb: 2
                    }}
                >
                    {sucesso}
                </Alert>

            )}


            {/* =====================================================
                ERRO
            ===================================================== */}

            {erro &&
                !dialogAberto && (

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
                                Itens
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


                        {/* =================================================
                            VAZIO
                        ================================================= */}

                        {!carregando &&
                            comprasPendentes.length === 0 && (

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

                                            <Typography
                                                variant="h6"
                                            >
                                                Nenhuma compra
                                                aguardando
                                                recebimento
                                            </Typography>


                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                As compras
                                                realizadas
                                                aparecerão
                                                aqui para
                                                serem
                                                recebidas.
                                            </Typography>

                                        </Box>

                                    </TableCell>

                                </TableRow>

                            )}


                        {/* =================================================
                            COMPRAS
                        ================================================= */}

                        {!carregando &&
                            comprasPendentes.map(
                                (compra) => (

                                    <TableRow
                                        key={
                                            compra.id
                                        }
                                        hover
                                    >

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


                                        <TableCell>

                                            {
                                                Array.isArray(
                                                    compra.itens
                                                )
                                                    ? compra.itens.length
                                                    : 0
                                            }

                                        </TableCell>


                                        <TableCell>

                                            {formatarValor(
                                                compra.total
                                            )}

                                        </TableCell>


                                        <TableCell>

                                            {formatarData(
                                                compra.criadoEm
                                            )}

                                        </TableCell>


                                        <TableCell>

                                            {compra.status ===
                                            "aguardandoRecebimento"
                                                ? "Aguardando recebimento"
                                                : compra.status ===
                                                  "realizada"
                                                ? "Realizada"
                                                : "Pendente"}

                                        </TableCell>


                                        <TableCell
                                            align="right"
                                        >

                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() =>
                                                    abrirRecebimento(
                                                        compra
                                                    )
                                                }
                                                disabled={
                                                    recebendo
                                                }
                                            >
                                                Receber compra
                                            </Button>

                                        </TableCell>

                                    </TableRow>

                                )
                            )}

                    </TableBody>

                </Table>

            </TableContainer>


            {/* =====================================================
                CONTADOR
            ===================================================== */}

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mt: 2
                }}
            >
                {comprasPendentes.length} compra(s)
                aguardando recebimento
            </Typography>


            {/* =====================================================
                DIALOG
            ===================================================== */}

            <Dialog
                open={dialogAberto}
                onClose={fecharDialog}
                fullWidth
                maxWidth="md"
            >

                <DialogTitle>
                    Receber compra
                </DialogTitle>


                <DialogContent>

                    <Stack
                        spacing={2}
                        sx={{
                            pt: 1
                        }}
                    >

                        {/* =============================================
                            ERRO
                        ============================================= */}

                        {erro && (

                            <Alert
                                severity="error"
                            >
                                {erro}
                            </Alert>

                        )}


                        {/* =============================================
                            INFORMAÇÕES DA COMPRA
                        ============================================= */}

                        {compraSelecionada && (

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


                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Total da compra:{" "}
                                        {formatarValor(
                                            compraSelecionada.total
                                        )}
                                    </Typography>

                                </Stack>

                            </Paper>

                        )}


                        {/* =============================================
                            ITENS
                        ============================================= */}

                        {compraSelecionada && (

                            <Box>

                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    sx={{
                                        mb: 1
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

                                                    const produtoEncontrado =
                                                        localizarProduto(
                                                            item
                                                        );


                                                    const produtoId =
                                                        item?.produtoId ||
                                                        obterProdutoId(
                                                            produtoEncontrado
                                                        );


                                                    return (

                                                        <TableRow
                                                            key={
                                                                item.produtoId ||
                                                                index
                                                            }
                                                        >

                                                            <TableCell>

                                                                <Typography
                                                                    fontWeight={500}
                                                                >
                                                                    {
                                                                        item.produtoNome ||
                                                                        "Item"
                                                                    }
                                                                </Typography>


                                                                {!produtoId && (

                                                                    <Typography
                                                                        variant="caption"
                                                                        color="error"
                                                                    >
                                                                        Produto não
                                                                        localizado
                                                                        no cadastro
                                                                    </Typography>

                                                                )}


                                                                {produtoId &&
                                                                    !item.produtoId && (

                                                                        <Typography
                                                                            variant="caption"
                                                                            color="success.main"
                                                                        >
                                                                            Produto
                                                                            vinculado
                                                                            pelo nome
                                                                        </Typography>

                                                                    )}

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
                                                                    item.subtotal
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

                        )}


                        {/* =============================================
                            AVISO
                        ============================================= */}

                        <Alert
                            severity="warning"
                        >
                            Ao confirmar o recebimento, a
                            quantidade de cada produto será
                            adicionada ao estoque e a compra
                            será marcada como recebida.
                        </Alert>

                    </Stack>

                </DialogContent>


                {/* =====================================================
                    AÇÕES
                ===================================================== */}

                <DialogActions>

                    <Button
                        onClick={
                            fecharDialog
                        }
                        disabled={
                            recebendo
                        }
                    >
                        Cancelar
                    </Button>


                    <Button
                        variant="contained"
                        onClick={
                            confirmarRecebimento
                        }
                        disabled={
                            recebendo
                        }
                    >

                        {recebendo ? (

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                            >

                                <CircularProgress
                                    size={18}
                                    color="inherit"
                                />

                                <span>
                                    Recebendo...
                                </span>

                            </Stack>

                        ) : (

                            "Confirmar recebimento"

                        )}

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>

    );

}

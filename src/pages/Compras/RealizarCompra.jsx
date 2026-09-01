import { useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
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
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useSolicitacoesCompra } from "../../context/SolicitacaoCompraContext";
import { useFornecedores } from "../../context/FornecedorContext";

export default function RealizarCompra() {

    const {
        solicitacoes,
        carregando,
        salvando,
        realizarCompra,
        usuarios,
        carregandoUsuarios
    } = useSolicitacoesCompra();

    const {
        fornecedores,
        carregando: carregandoFornecedores
    } = useFornecedores();

    const [dialogAberto, setDialogAberto] = useState(false);

    const [
        solicitacaoSelecionada,
        setSolicitacaoSelecionada
    ] = useState(null);

    const [
        fornecedorId,
        setFornecedorId
    ] = useState("");

    const [
        valorUnitario,
        setValorUnitario
    ] = useState("");

    const [
        previsaoEntrega,
        setPrevisaoEntrega
    ] = useState("");

    const [
        usuariosSelecionados,
        setUsuariosSelecionados
    ] = useState([]);

    const [
        observacao,
        setObservacao
    ] = useState("");

    const [erro, setErro] = useState(null);

    const [erroLista, setErroLista] = useState(null);


    // =========================================================
    // SOLICITAÇÕES APROVADAS
    // =========================================================

    const solicitacoesAprovadas = useMemo(() => {

        return (solicitacoes || []).filter(
            (solicitacao) =>
                solicitacao.status === "aprovada"
        );

    }, [solicitacoes]);


    // =========================================================
    // NOME DO ITEM
    // =========================================================

    function obterNomeItem(solicitacao) {

        if (solicitacao?.tipo === "existente") {

            return (
                solicitacao.produtoNome ||
                "Produto"
            );
        }

        return (
            solicitacao?.nomeItem ||
            "Item novo"
        );
    }


    // =========================================================
    // VERIFICAR SE É COMPRA ONLINE
    // =========================================================

    function compraEhOnline(solicitacao = solicitacaoSelecionada) {

        return Boolean(
            solicitacao?.compraOnline
        );
    }


    // =========================================================
    // ABRIR LINK DA COMPRA
    // =========================================================

    function abrirLinkCompra() {

        const url =
            solicitacaoSelecionada?.urlCompra;

        if (!url) {
            return;
        }

        let urlFinal = url.trim();

        if (
            !urlFinal.startsWith("http://") &&
            !urlFinal.startsWith("https://")
        ) {
            urlFinal = `https://${urlFinal}`;
        }

        window.open(
            urlFinal,
            "_blank",
            "noopener,noreferrer"
        );
    }


    // =========================================================
    // ABRIR COMPRA
    // =========================================================

    function abrirCompra(solicitacao) {

        setSolicitacaoSelecionada(
            solicitacao
        );

        setErro(null);
        setErroLista(null);

        // -----------------------------------------------------
        // FORNECEDOR SUGERIDO
        // -----------------------------------------------------

        setFornecedorId(
            solicitacao?.fornecedorSugerido?.id ||
            solicitacao?.fornecedorSugerido ||
            ""
        );


        // -----------------------------------------------------
        // VALOR SUGERIDO
        // -----------------------------------------------------

        const valorSugerido =
            solicitacao?.valorUnitarioSugerido;

        if (
            valorSugerido !== undefined &&
            valorSugerido !== null &&
            valorSugerido !== ""
        ) {

            setValorUnitario(
                String(valorSugerido)
                    .replace(".", ",")
            );

        } else {

            setValorUnitario("");
        }


        // -----------------------------------------------------
        // COMPRA ONLINE
        // -----------------------------------------------------

        if (solicitacao?.compraOnline) {

            setPrevisaoEntrega(
                solicitacao?.previsaoEntrega ||
                ""
            );

        } else {

            setPrevisaoEntrega("");
        }


        // -----------------------------------------------------
        // USUÁRIOS
        // -----------------------------------------------------

        setUsuariosSelecionados([]);


        // -----------------------------------------------------
        // OBSERVAÇÃO
        // -----------------------------------------------------

        setObservacao("");


        setDialogAberto(true);
    }


    // =========================================================
    // FECHAR DIALOG
    // =========================================================

    function fecharDialog() {

        if (salvando) {
            return;
        }

        setDialogAberto(false);

        setSolicitacaoSelecionada(null);

        setFornecedorId("");

        setValorUnitario("");

        setPrevisaoEntrega("");

        setUsuariosSelecionados([]);

        setObservacao("");

        setErro(null);

        setErroLista(null);
    }


    // =========================================================
    // ALTERAR VALOR UNITÁRIO
    // =========================================================

    function alterarValorUnitario(event) {

        let valor =
            event.target.value;

        valor =
            valor.replace(
                /[^\d.,]/g,
                ""
            );

        const partes =
            valor.split(/[.,]/);

        if (partes.length > 2) {

            valor =
                partes[0] +
                "," +
                partes
                    .slice(1)
                    .join("");
        }

        setValorUnitario(valor);
    }


    // =========================================================
    // CONVERTER VALOR
    // =========================================================

    function converterValor(valor) {

        if (!valor) {
            return 0;
        }

        let texto =
            String(valor).trim();

        if (
            texto.includes(".") &&
            texto.includes(",")
        ) {

            texto =
                texto
                    .replace(/\./g, "")
                    .replace(",", ".");

        } else if (
            texto.includes(",")
        ) {

            texto =
                texto.replace(",", ".");
        }

        const numero =
            Number(texto);

        return Number.isFinite(numero)
            ? numero
            : 0;
    }


    // =========================================================
    // FORMATAR VALOR
    // =========================================================

    function formatarValor(valor) {

        const numero =
            Number(valor);

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
    // VALORES
    // =========================================================

    const valorNumerico =
        converterValor(
            valorUnitario
        );

    const quantidadeSelecionada =
        Number(
            solicitacaoSelecionada?.quantidade || 0
        );

    const valorTotalEstimado =
        valorNumerico *
        quantidadeSelecionada;


    // =========================================================
    // ALTERAR USUÁRIOS
    // =========================================================

    function alterarUsuariosSelecionados(event) {

        const valor =
            event.target.value;

        setUsuariosSelecionados(
            typeof valor === "string"
                ? valor.split(",")
                : valor
        );
    }


    // =========================================================
    // CONFIRMAR COMPRA
    // =========================================================

    async function confirmarCompra() {

        setErro(null);


        // -----------------------------------------------------
        // SOLICITAÇÃO
        // -----------------------------------------------------

        if (!solicitacaoSelecionada) {

            setErro(
                "Nenhuma solicitação foi selecionada."
            );

            return;
        }


        // -----------------------------------------------------
        // FORNECEDOR
        // -----------------------------------------------------

        if (!fornecedorId) {

            setErro(
                "Selecione o fornecedor da compra."
            );

            return;
        }


        // -----------------------------------------------------
        // VALOR UNITÁRIO
        // -----------------------------------------------------

        const valor =
            converterValor(
                valorUnitario
            );

        if (
            !Number.isFinite(valor) ||
            valor <= 0
        ) {

            setErro(
                "Informe um valor unitário maior que zero."
            );

            return;
        }


        // -----------------------------------------------------
        // QUANTIDADE
        // -----------------------------------------------------

        const quantidade =
            Number(
                solicitacaoSelecionada.quantidade
            );

        if (
            !Number.isFinite(quantidade) ||
            quantidade <= 0
        ) {

            setErro(
                "A quantidade da solicitação é inválida."
            );

            return;
        }


        // -----------------------------------------------------
        // PREVISÃO DE ENTREGA
        // SOMENTE COMPRA ONLINE
        // -----------------------------------------------------

        if (
            compraEhOnline() &&
            !previsaoEntrega
        ) {

            setErro(
                "Informe a previsão de entrega da compra online."
            );

            return;
        }


        // -----------------------------------------------------
        // USUÁRIOS
        // -----------------------------------------------------

        if (
            !usuariosSelecionados ||
            usuariosSelecionados.length === 0
        ) {

            setErro(
                "Selecione pelo menos um usuário para receber a notificação."
            );

            return;
        }


        // -----------------------------------------------------
        // FORNECEDOR SELECIONADO
        // -----------------------------------------------------

        const fornecedorSelecionado =
            (fornecedores || []).find(
                (fornecedor) =>
                    fornecedor.id === fornecedorId
            );


        try {

            await realizarCompra(
                solicitacaoSelecionada.id,
                {

                    // -------------------------------------------------
                    // FORNECEDOR
                    // -------------------------------------------------

                    fornecedorId,

                    fornecedorNome:
                        fornecedorSelecionado?.nome ||
                        solicitacaoSelecionada?.fornecedorSugerido?.nome ||
                        null,


                    // -------------------------------------------------
                    // QUANTIDADE
                    // -------------------------------------------------

                    quantidade,


                    // -------------------------------------------------
                    // VALORES
                    // -------------------------------------------------

                    valorUnitario:
                        valor,

                    valorTotal:
                        valor *
                        quantidade,


                    // -------------------------------------------------
                    // TIPO DA COMPRA
                    // HERDADO DA SOLICITAÇÃO
                    // -------------------------------------------------

                    tipoCompra:
                        compraEhOnline()
                            ? "online"
                            : "presencial",


                    compraOnline:
                        compraEhOnline(),


                    // -------------------------------------------------
                    // URL
                    //
                    // A URL é mantida no registro da compra para
                    // consulta interna, mas NÃO será utilizada
                    // no e-mail.
                    // -------------------------------------------------

                    urlCompra:
                        compraEhOnline()
                            ? (
                                solicitacaoSelecionada?.urlCompra ||
                                null
                            )
                            : null,


                    // -------------------------------------------------
                    // PREVISÃO DE ENTREGA
                    // -------------------------------------------------

                    previsaoEntrega:
                        compraEhOnline()
                            ? previsaoEntrega
                            : null,


                    // -------------------------------------------------
                    // USUÁRIOS QUE RECEBERÃO E-MAIL
                    // -------------------------------------------------

                    usuariosSelecionados,


                    // -------------------------------------------------
                    // OBSERVAÇÃO
                    // -------------------------------------------------

                    observacaoCompra:
                        observacao.trim()
                }
            );


            fecharDialog();

        } catch (error) {

            console.error(
                "Erro ao realizar compra:",
                error
            );

            setErro(
                error?.message ||
                "Não foi possível realizar a compra."
            );
        }
    }


    // =========================================================
    // RENDER
    // =========================================================

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
                    >
                        <ShoppingCartOutlinedIcon sx={{ fontSize: 48, color: "#ff9b3d", verticalAlign: "middle", mr: 1 }} />Realizar Compra
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        Solicitações aprovadas
                        aguardando compra.
                    </Typography>

                </Box>

            </Stack>


            {/* =================================================
                ERRO DA LISTA
            ================================================= */}

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


            {/* =================================================
                TABELA
            ================================================= */}

            <TableContainer
                component={Paper}
            >

                <Table>

                    <TableHead>

                        <TableRow>

                            <TableCell>
                                Item
                            </TableCell>

                            <TableCell>
                                Tipo
                            </TableCell>

                            <TableCell>
                                Quantidade
                            </TableCell>

                            <TableCell>
                                Observação
                            </TableCell>

                            <TableCell align="right">
                                Ações
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        {/* CARREGANDO */}

                        {carregando && (

                            <TableRow>

                                <TableCell
                                    colSpan={5}
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


                        {/* VAZIO */}

                        {!carregando &&
                            solicitacoesAprovadas.length ===
                            0 && (

                                <TableRow>

                                    <TableCell
                                        colSpan={5}
                                        align="center"
                                    >

                                        <Box
                                            sx={{
                                                py: 5
                                            }}
                                        >

                                            <ShoppingCartOutlinedIcon
                                                sx={{
                                                    fontSize: 48,
                                                    opacity: 0.5,
                                                    mb: 1
                                                }}
                                            />

                                            <Typography
                                                variant="h6"
                                            >
                                                Nenhuma compra
                                                pendente
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Não existem
                                                solicitações
                                                aprovadas
                                                aguardando
                                                realização
                                                da compra.
                                            </Typography>

                                        </Box>

                                    </TableCell>

                                </TableRow>
                            )}


                        {/* SOLICITAÇÕES */}

                        {!carregando &&
                            solicitacoesAprovadas.map(
                                (solicitacao) => (

                                    <TableRow
                                        key={
                                            solicitacao.id
                                        }
                                        hover
                                    >

                                        <TableCell>

                                            <Typography
                                                fontWeight={600}
                                            >
                                                {obterNomeItem(
                                                    solicitacao
                                                )}
                                            </Typography>

                                        </TableCell>


                                        <TableCell>

                                            {solicitacao.compraOnline
                                                ? "Compra online"
                                                : "Compra presencial"}

                                        </TableCell>


                                        <TableCell>

                                            {
                                                solicitacao.quantidade
                                            }

                                        </TableCell>


                                        <TableCell>

                                            {
                                                solicitacao.observacao ||
                                                "-"
                                            }

                                        </TableCell>


                                        <TableCell align="right">

                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={
                                                    <ShoppingCartOutlinedIcon />
                                                }
                                                onClick={() =>
                                                    abrirCompra(
                                                        solicitacao
                                                    )
                                                }
                                                disabled={
                                                    salvando
                                                }
                                            >
                                                Realizar compra
                                            </Button>

                                        </TableCell>

                                    </TableRow>
                                )
                            )}

                    </TableBody>

                </Table>

            </TableContainer>


            {/* =================================================
                CONTADOR
            ================================================= */}

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mt: 2
                }}
            >
                {solicitacoesAprovadas.length} compra(s)
                aguardando realização
            </Typography>


            {/* =================================================
                DIALOG
            ================================================= */}

            <Dialog
                open={dialogAberto}
                onClose={fecharDialog}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>
                    Realizar compra
                </DialogTitle>


                <DialogContent>

                    <Stack
                        spacing={2}
                        sx={{
                            pt: 1
                        }}
                    >

                        {/* ERRO */}

                        {erro && (

                            <Alert severity="error">
                                {erro}
                            </Alert>
                        )}


                        {/* =================================================
                            ITEM
                        ================================================= */}

                        {solicitacaoSelecionada && (

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2
                                }}
                            >

                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                    Item solicitado
                                </Typography>

                                <Typography
                                    variant="h6"
                                    fontWeight={600}
                                >
                                    {obterNomeItem(
                                        solicitacaoSelecionada
                                    )}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Quantidade:{" "}
                                    {
                                        solicitacaoSelecionada.quantidade
                                    }
                                </Typography>

                            </Paper>
                        )}


                        {/* =================================================
                            TIPO DA COMPRA
                            SOMENTE INFORMATIVO
                        ================================================= */}

                        {solicitacaoSelecionada && (

                            <Alert
                                severity={
                                    compraEhOnline()
                                        ? "info"
                                        : "success"
                                }
                            >

                                {compraEhOnline()
                                    ? "Esta solicitação foi registrada como compra online."
                                    : "Esta solicitação foi registrada como compra presencial."}

                            </Alert>
                        )}


                        {/* =================================================
                            FORNECEDOR
                        ================================================= */}

                        <FormControl
                            fullWidth
                            disabled={
                                salvando ||
                                carregandoFornecedores
                            }
                        >

                            <InputLabel>
                                Fornecedor
                            </InputLabel>

                            <Select
                                value={fornecedorId}
                                label="Fornecedor"
                                onChange={(event) =>
                                    setFornecedorId(
                                        event.target.value
                                    )
                                }
                            >

                                {(fornecedores || []).map(
                                    (fornecedor) => (

                                        <MenuItem
                                            key={
                                                fornecedor.id
                                            }
                                            value={
                                                fornecedor.id
                                            }
                                        >
                                            {
                                                fornecedor.nome
                                            }
                                        </MenuItem>

                                    )
                                )}

                            </Select>

                        </FormControl>


                        {/* SEM FORNECEDORES */}

                        {!carregandoFornecedores &&
                            (!fornecedores ||
                                fornecedores.length ===
                                0) && (

                                <Alert severity="warning">

                                    Nenhum fornecedor
                                    cadastrado.
                                    Cadastre um
                                    fornecedor antes
                                    de realizar a
                                    compra.

                                </Alert>
                            )}


                        {/* =================================================
                            INFORMAÇÕES DA COMPRA ONLINE
                        ================================================= */}

                        {compraEhOnline() && (

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2
                                }}
                            >

                                <Stack spacing={1.5}>

                                    <Typography
                                        variant="subtitle2"
                                        color="text.secondary"
                                    >
                                        Compra online
                                    </Typography>


                                    {/* LINK */}

                                    {solicitacaoSelecionada?.urlCompra && (

                                        <Box>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 0.5
                                                }}
                                            >
                                                Link da compra
                                            </Typography>

                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={
                                                    <OpenInNewIcon />
                                                }
                                                onClick={
                                                    abrirLinkCompra
                                                }
                                                disabled={
                                                    salvando
                                                }
                                            >
                                                Abrir link da compra
                                            </Button>

                                        </Box>
                                    )}


                                    {/* SEM LINK */}

                                    {!solicitacaoSelecionada?.urlCompra && (

                                        <Alert
                                            severity="warning"
                                        >
                                            Esta solicitação foi
                                            marcada como compra
                                            online, mas não possui
                                            um link cadastrado.
                                        </Alert>
                                    )}

                                </Stack>

                            </Paper>
                        )}


                        {/* =================================================
                            PREVISÃO DE ENTREGA
                        ================================================= */}

                        {compraEhOnline() && (<TextField
    fullWidth
    label="Previsão de entrega"
    type="date"
    value={previsaoEntrega}
    onChange={(event) =>
        setPrevisaoEntrega(event.target.value)
    }
    disabled={salvando}
    slotProps={{
        inputLabel: {
            shrink: true
        },
        input: {
            startAdornment: (
                <CalendarMonthOutlinedIcon
                    sx={{
                        mr: 1,
                        color: "text.secondary"
                    }}
                />
            )
        }
    }}
    helperText="Selecione a data prevista para entrega."
/>


                        )}


                        {/* =================================================
                            VALOR UNITÁRIO
                        ================================================= */}

                        <TextField
                            fullWidth
                            label="Valor unitário"
                            value={
                                valorUnitario
                            }
                            onChange={
                                alterarValorUnitario
                            }
                            disabled={
                                salvando
                            }
                            placeholder="0,00"
                            inputMode="decimal"
                            type="text"
                            helperText={
                                solicitacaoSelecionada?.valorUnitarioSugerido
                                    ? "Valor sugerido pela solicitação. Você pode alterar se necessário."
                                    : "Informe somente números. Ex.: 25,90"
                            }
                        />


                        {/* =================================================
                            VALOR TOTAL
                        ================================================= */}

                        {solicitacaoSelecionada &&
                            valorUnitario && (

                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2
                                    }}
                                >

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Valor total
                                        estimado
                                    </Typography>

                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        {formatarValor(
                                            valorTotalEstimado
                                        )}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {
                                            solicitacaoSelecionada.quantidade
                                        }{" "}
                                        x{" "}
                                        {formatarValor(
                                            valorNumerico
                                        )}
                                    </Typography>

                                </Paper>
                            )}


                        {/* =================================================
                            USUÁRIOS
                        ================================================= */}

                        <FormControl
                            fullWidth
                            disabled={
                                salvando ||
                                carregandoUsuarios
                            }
                        >

                            <InputLabel>
                                Notificar usuários
                            </InputLabel>

                            <Select
                                multiple
                                value={
                                    usuariosSelecionados
                                }
                                onChange={
                                    alterarUsuariosSelecionados
                                }
                                input={
                                    <OutlinedInput
                                        label="Notificar usuários"
                                    />
                                }
                                renderValue={(
                                    selecionados
                                ) => {

                                    const nomes =
                                        (usuarios || [])
                                            .filter(
                                                (usuario) =>
                                                    selecionados.includes(
                                                        usuario.id
                                                    )
                                            )
                                            .map(
                                                (usuario) =>
                                                    usuario.nome ||
                                                    usuario.email
                                            );

                                    return nomes.join(
                                        ", "
                                    );
                                }}
                            >

                                {(usuarios || []).map(
                                    (usuario) => (

                                        <MenuItem
                                            key={
                                                usuario.id
                                            }
                                            value={
                                                usuario.id
                                            }
                                        >

                                            <Checkbox
                                                checked={
                                                    usuariosSelecionados.includes(
                                                        usuario.id
                                                    )
                                                }
                                            />

                                            <ListItemText
                                                primary={
                                                    usuario.nome ||
                                                    "Usuário"
                                                }
                                                secondary={
                                                    usuario.email
                                                }
                                            />

                                        </MenuItem>

                                    )
                                )}

                            </Select>

                        </FormControl>


                        {/* SEM USUÁRIOS */}

                        {!carregandoUsuarios &&
                            (!usuarios ||
                                usuarios.length === 0) && (

                                <Alert severity="warning">

                                    Nenhum usuário
                                    disponível para
                                    receber a
                                    notificação.

                                </Alert>
                            )}


                        {/* =================================================
                            OBSERVAÇÃO
                        ================================================= */}

                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="Observação da compra"
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
                            helperText="Campo opcional."
                        />

                    </Stack>

                </DialogContent>


                {/* =================================================
                    AÇÕES
                ================================================= */}

                <DialogActions>

                    <Button
                        onClick={
                            fecharDialog
                        }
                        disabled={
                            salvando
                        }
                        startIcon={
                            <CloseIcon />
                        }
                    >
                        Cancelar
                    </Button>


                    <Button
                        variant="contained"
                        onClick={
                            confirmarCompra
                        }
                        disabled={
                            salvando ||
                            carregandoFornecedores ||
                            !fornecedores ||
                            fornecedores.length === 0 ||
                            carregandoUsuarios ||
                            !usuarios ||
                            usuarios.length === 0
                        }
                        startIcon={
                            salvando ? (
                                <CircularProgress
                                    size={18}
                                />
                            ) : (
                                <ShoppingCartOutlinedIcon />
                            )
                        }
                    >

                        {salvando
                            ? "Salvando..."
                            : "Confirmar compra"}

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>
    );
}
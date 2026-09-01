import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
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

import AddIcon from "@mui/icons-material/Add";
import InputIcon from "@mui/icons-material/Input";
import OutputIcon from "@mui/icons-material/Output";
import HistoryIcon from "@mui/icons-material/History";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import {
    usePermissions,
    PERMISSOES
} from "../../context/PermissionContext";

import { useProdutos } from "../../context/ProdutoContext";

const produtoInicial = {
    codigo: "",
    nome: "",
    descricao: "",
    categoria: "",
    unidade: "UN",
    estoqueAtual: 0,
    estoqueMinimo: 0,
    estoqueMaximo: 0,
    custoAtual: 0,
    status: "ativo"
};

function normalizarProduto(produto) {
    return {
        ...produtoInicial,
        ...produto
    };
}

export default function Estoque() {
    const navigate = useNavigate();

    const {
        produtos,
        carregando,
        salvando,
        erro,
        cadastrarProduto,
        atualizarProduto,
        excluirProduto
    } = useProdutos();

    const { temPermissao } = usePermissions();

    const [dialogAberto, setDialogAberto] = useState(false);

    const [produtoEmEdicao, setProdutoEmEdicao] =
        useState(null);

    const [formulario, setFormulario] =
        useState(produtoInicial);

    const [erroFormulario, setErroFormulario] =
        useState(null);

    const [pesquisa, setPesquisa] = useState("");

    const [filtroStatus, setFiltroStatus] =
        useState("todos");

    const podeCadastrar =
        temPermissao(
            PERMISSOES.ESTOQUE_CADASTRAR
        );

    const podeEditar =
        temPermissao(
            PERMISSOES.ESTOQUE_EDITAR
        );

    const podeRetirar =
        temPermissao(
            PERMISSOES.ESTOQUE_RETIRAR
        );

    const podeExcluir =
        temPermissao(
            PERMISSOES.ESTOQUE_EXCLUIR
        );

    const produtosFiltrados = useMemo(() => {
        const termo = pesquisa
            .trim()
            .toLowerCase();

        return produtos.filter((produto) => {
            const correspondePesquisa =
                !termo ||
                String(
                    produto.codigo ?? ""
                )
                    .toLowerCase()
                    .includes(termo) ||
                String(
                    produto.nome ?? ""
                )
                    .toLowerCase()
                    .includes(termo) ||
                String(
                    produto.categoria ?? ""
                )
                    .toLowerCase()
                    .includes(termo);

            const correspondeStatus =
                filtroStatus === "todos" ||
                (
                    filtroStatus === "ativos" &&
                    produto.status !== "inativo"
                ) ||
                (
                    filtroStatus === "inativos" &&
                    produto.status === "inativo"
                );

            return (
                correspondePesquisa &&
                correspondeStatus
            );
        });
    }, [
        produtos,
        pesquisa,
        filtroStatus
    ]);

    function abrirCadastro() {
        setProdutoEmEdicao(null);

        setFormulario({
            ...produtoInicial
        });

        setErroFormulario(null);
        setDialogAberto(true);
    }

    function abrirEdicao(produto) {
        setProdutoEmEdicao(produto);

        setFormulario(
            normalizarProduto(produto)
        );

        setErroFormulario(null);
        setDialogAberto(true);
    }

    function fecharDialog() {
        if (!salvando) {
            setDialogAberto(false);
        }
    }

    function atualizarCampo(event) {
        const {
            name,
            value
        } = event.target;

        setFormulario((estadoAtual) => ({
            ...estadoAtual,
            [name]: value
        }));
    }

    async function salvarProduto(event) {
        event.preventDefault();

        setErroFormulario(null);

        const dadosProduto = {
            ...formulario,

            codigo:
                formulario.codigo.trim(),

            nome:
                formulario.nome.trim(),

            descricao:
                formulario.descricao.trim(),

            categoria:
                formulario.categoria.trim(),

            unidade:
                formulario.unidade.trim() || "UN",

            estoqueAtual:
                Number(
                    formulario.estoqueAtual
                ),

            estoqueMinimo:
                Number(
                    formulario.estoqueMinimo
                ),

            estoqueMaximo:
                Number(
                    formulario.estoqueMaximo
                ),

            custoAtual:
                Number(
                    formulario.custoAtual
                )
        };

        if (
            !dadosProduto.codigo ||
            !dadosProduto.nome
        ) {
            setErroFormulario(
                "Informe o código e o nome do produto."
            );

            return;
        }

        if (
            !Number.isFinite(
                dadosProduto.estoqueAtual
            ) ||
            dadosProduto.estoqueAtual < 0
        ) {
            setErroFormulario(
                "O estoque atual é inválido."
            );

            return;
        }

        if (
            !Number.isFinite(
                dadosProduto.estoqueMinimo
            ) ||
            dadosProduto.estoqueMinimo < 0
        ) {
            setErroFormulario(
                "O estoque mínimo não pode ser negativo."
            );

            return;
        }

        if (
            !Number.isFinite(
                dadosProduto.estoqueMaximo
            ) ||
            dadosProduto.estoqueMaximo < 0
        ) {
            setErroFormulario(
                "O estoque máximo não pode ser negativo."
            );

            return;
        }

        if (
            dadosProduto.estoqueMaximo > 0 &&
            dadosProduto.estoqueMinimo >
                dadosProduto.estoqueMaximo
        ) {
            setErroFormulario(
                "O estoque mínimo não pode ser maior que o estoque máximo."
            );

            return;
        }

        if (
            !Number.isFinite(
                dadosProduto.custoAtual
            ) ||
            dadosProduto.custoAtual < 0
        ) {
            setErroFormulario(
                "O custo atual não pode ser negativo."
            );

            return;
        }

        try {
            if (produtoEmEdicao) {
                await atualizarProduto(
                    produtoEmEdicao.id,
                    dadosProduto
                );
            } else {
                /*
                 * Produto novo sempre começa
                 * com estoque zero.
                 *
                 * O estoque inicial deve ser
                 * lançado através de uma
                 * entrada de estoque para que
                 * exista histórico da movimentação.
                 */
                dadosProduto.estoqueAtual = 0;

                await cadastrarProduto(
                    dadosProduto
                );
            }

            setDialogAberto(false);
        } catch {
            setErroFormulario(
                "Não foi possível salvar o produto. Tente novamente."
            );
        }
    }

    async function removerProduto(produto) {
        const confirmou =
            window.confirm(
                `Excluir o produto "${produto.nome}"?`
            );

        if (!confirmou) {
            return;
        }

        try {
            await excluirProduto(
                produto.id
            );
        } catch {
            setErroFormulario(
                "Não foi possível excluir o produto. Tente novamente."
            );
        }
    }

    function abrirEntradaEstoque() {
        navigate(
            "/estoque/entrada"
        );
    }

    function abrirSaidaEstoque() {
        navigate(
            "/estoque/saida"
        );
    }

    function abrirHistoricoEstoque() {
        navigate(
            "/estoque/historico"
        );
    }

    function limparFiltros() {
        setPesquisa("");
        setFiltroStatus("todos");
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
                sx={{
                    mb: 3
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Inventory2OutlinedIcon sx={{ fontSize: 52, color: "#ff9b3d" }} />
                    <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Estoque
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        Cadastre e acompanhe os
                        produtos do estoque.
                    </Typography>
                    </Box>
                </Stack>

                <Stack
                    direction={{
                        xs: "column",
                        sm: "row"
                    }}
                    spacing={1}
                    sx={{
                        width: {
                            xs: "100%",
                            sm: "auto"
                        }
                    }}
                >
                    {podeCadastrar && (
                        <Button
                            variant="outlined"
                            startIcon={
                                <InputIcon />
                            }
                            onClick={
                                abrirEntradaEstoque
                            }
                            fullWidth
                        >
                            Entrada de estoque
                        </Button>
                    )}

                    {podeRetirar && (
                        <Button
                            variant="outlined"
                            startIcon={
                                <OutputIcon />
                            }
                            onClick={
                                abrirSaidaEstoque
                            }
                            fullWidth
                        >
                            Saída de estoque
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        startIcon={
                            <HistoryIcon />
                        }
                        onClick={
                            abrirHistoricoEstoque
                        }
                        fullWidth
                    >
                        Histórico
                    </Button>

                    {podeCadastrar && (
                        <Button
                            variant="contained"
                            startIcon={
                                <AddIcon />
                            }
                            onClick={
                                abrirCadastro
                            }
                            fullWidth
                        >
                            Novo produto
                        </Button>
                    )}
                </Stack>
            </Stack>

            {erro && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2
                    }}
                >
                    Não foi possível carregar os
                    produtos.
                </Alert>
            )}

            <Paper
                sx={{
                    p: 2,
                    mb: 2
                }}
            >
                <Stack
                    direction={{
                        xs: "column",
                        md: "row"
                    }}
                    spacing={2}
                    alignItems={{
                        xs: "stretch",
                        md: "center"
                    }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        label="Pesquisar produto"
                        placeholder="Código, nome ou categoria"
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
                        label="Status"
                        value={filtroStatus}
                        onChange={(event) =>
                            setFiltroStatus(
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

                        <MenuItem value="ativos">
                            Ativos
                        </MenuItem>

                        <MenuItem value="inativos">
                            Inativos
                        </MenuItem>
                    </TextField>

                    <Button
                        variant="outlined"
                        onClick={limparFiltros}
                        disabled={
                            pesquisa === "" &&
                            filtroStatus ===
                                "todos"
                        }
                    >
                        Limpar
                    </Button>
                </Stack>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 1.5
                    }}
                >
                    {produtosFiltrados.length}{" "}
                    produto(s) encontrado(s)
                </Typography>
            </Paper>

            <TableContainer
                component={Paper}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Código
                            </TableCell>

                            <TableCell>
                                Produto
                            </TableCell>

                            <TableCell>
                                Categoria
                            </TableCell>

                            <TableCell align="right">
                                Em estoque
                            </TableCell>

                            <TableCell align="right">
                                Mínimo
                            </TableCell>

                            <TableCell>
                                Status
                            </TableCell>

                            {(podeEditar ||
                                podeExcluir) && (
                                <TableCell align="right">
                                    Ações
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {carregando && (
                            <TableRow>
                                <TableCell
                                    colSpan={
                                        podeEditar ||
                                        podeExcluir
                                            ? 7
                                            : 6
                                    }
                                    align="center"
                                >
                                    <CircularProgress
                                        size={24}
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {!carregando &&
                            produtosFiltrados.length ===
                                0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={
                                            podeEditar ||
                                            podeExcluir
                                                ? 7
                                                : 6
                                        }
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
                                                {produtos.length ===
                                                0
                                                    ? "Nenhum produto cadastrado."
                                                    : "Nenhum produto encontrado."}
                                            </Typography>

                                            {produtos.length >
                                                0 && (
                                                <>
                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            mb: 2
                                                        }}
                                                    >
                                                        Tente alterar
                                                        os filtros ou
                                                        a pesquisa.
                                                    </Typography>

                                                    <Button
                                                        variant="outlined"
                                                        onClick={
                                                            limparFiltros
                                                        }
                                                    >
                                                        Limpar filtros
                                                    </Button>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}

                        {!carregando &&
                            produtosFiltrados.map(
                                (produto) => {
                                    const estoqueAtual =
                                        Number(
                                            produto.estoqueAtual ??
                                                0
                                        );

                                    const estoqueMinimo =
                                        Number(
                                            produto.estoqueMinimo ??
                                                0
                                        );

                                    const estoqueBaixo =
                                        estoqueMinimo >
                                            0 &&
                                        estoqueAtual <=
                                            estoqueMinimo;

                                    return (
                                        <TableRow
                                            key={
                                                produto.id
                                            }
                                            hover
                                        >
                                            <TableCell>
                                                {
                                                    produto.codigo
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    fontWeight={
                                                        600
                                                    }
                                                >
                                                    {
                                                        produto.nome
                                                    }
                                                </Typography>

                                                {produto.descricao && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            produto.descricao
                                                        }
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    produto.categoria ||
                                                    "-"
                                                }
                                            </TableCell>

                                            <TableCell align="right">
                                                <Typography
                                                    fontWeight={
                                                        estoqueBaixo
                                                            ? 700
                                                            : 400
                                                    }
                                                    color={
                                                        estoqueBaixo
                                                            ? "error.main"
                                                            : "inherit"
                                                    }
                                                >
                                                    {
                                                        produto.estoqueAtual ??
                                                        0
                                                    }{" "}
                                                    {
                                                        produto.unidade
                                                    }
                                                </Typography>

                                                {estoqueBaixo && (
                                                    <Typography
                                                        variant="caption"
                                                        color="error"
                                                    >
                                                        Estoque baixo
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell align="right">
                                                {
                                                    produto.estoqueMinimo ??
                                                    0
                                                }{" "}
                                                {
                                                    produto.unidade
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    produto.status ===
                                                    "inativo"
                                                        ? "Inativo"
                                                        : "Ativo"
                                                }
                                            </TableCell>

                                            {(podeEditar ||
                                                podeExcluir) && (
                                                <TableCell align="right">
                                                    {podeEditar && (
                                                        <IconButton
                                                            aria-label="Editar produto"
                                                            onClick={() =>
                                                                abrirEdicao(
                                                                    produto
                                                                )
                                                            }
                                                        >
                                                            <EditOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    )}

                                                    {podeExcluir && (
                                                        <IconButton
                                                            aria-label="Excluir produto"
                                                            color="error"
                                                            onClick={() =>
                                                                removerProduto(
                                                                    produto
                                                                )
                                                            }
                                                        >
                                                            <DeleteOutlineIcon />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                }
                            )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={dialogAberto}
                onClose={
                    fecharDialog
                }
                fullWidth
                maxWidth="sm"
            >
                <Box
                    component="form"
                    onSubmit={
                        salvarProduto
                    }
                >
                    <DialogTitle>
                        {produtoEmEdicao
                            ? "Editar produto"
                            : "Novo produto"}
                    </DialogTitle>

                    <DialogContent>
                        <Stack
                            spacing={2}
                            sx={{
                                pt: 1
                            }}
                        >
                            {erroFormulario && (
                                <Alert severity="error">
                                    {
                                        erroFormulario
                                    }
                                </Alert>
                            )}

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row"
                                }}
                                spacing={2}
                            >
                                <TextField
                                    required
                                    label="Código"
                                    name="codigo"
                                    value={
                                        formulario.codigo
                                    }
                                    onChange={
                                        atualizarCampo
                                    }
                                    fullWidth
                                />

                                <TextField
                                    select
                                    label="Status"
                                    name="status"
                                    value={
                                        formulario.status
                                    }
                                    onChange={
                                        atualizarCampo
                                    }
                                    fullWidth
                                >
                                    <MenuItem value="ativo">
                                        Ativo
                                    </MenuItem>

                                    <MenuItem value="inativo">
                                        Inativo
                                    </MenuItem>
                                </TextField>
                            </Stack>

                            <TextField
                                required
                                label="Nome"
                                name="nome"
                                value={
                                    formulario.nome
                                }
                                onChange={
                                    atualizarCampo
                                }
                                fullWidth
                            />

                            <TextField
                                label="Descrição"
                                name="descricao"
                                value={
                                    formulario.descricao
                                }
                                onChange={
                                    atualizarCampo
                                }
                                multiline
                                minRows={2}
                                fullWidth
                            />

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row"
                                }}
                                spacing={2}
                            >
                                <TextField
                                    label="Categoria"
                                    name="categoria"
                                    value={
                                        formulario.categoria
                                    }
                                    onChange={
                                        atualizarCampo
                                    }
                                    fullWidth
                                />

                                <TextField
                                    label="Unidade"
                                    name="unidade"
                                    value={
                                        formulario.unidade
                                    }
                                    onChange={
                                        atualizarCampo
                                    }
                                    fullWidth
                                />
                            </Stack>

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row"
                                }}
                                spacing={2}
                            >
                                <TextField
                                    label="Estoque atual"
                                    name="estoqueAtual"
                                    type="number"
                                    value={
                                        formulario.estoqueAtual
                                    }
                                    disabled
                                    helperText="Alterado somente por entrada ou saída."
                                    fullWidth
                                />

                                <TextField
                                    label="Estoque mínimo"
                                    name="estoqueMinimo"
                                    type="number"
                                    value={
                                        formulario.estoqueMinimo
                                    }
                                    onChange={
                                        atualizarCampo
                                    }
                                    inputProps={{
                                        min: 0,
                                        step: "0.01"
                                    }}
                                    fullWidth
                                />

                                <TextField
                                    label="Estoque máximo"
                                    name="estoqueMaximo"
                                    type="number"
                                    value={
                                        formulario.estoqueMaximo
                                    }
                                    onChange={
                                        atualizarCampo
                                    }
                                    inputProps={{
                                        min: 0,
                                        step: "0.01"
                                    }}
                                    helperText="0 = sem limite"
                                    fullWidth
                                />
                            </Stack>

                            <TextField
                                label="Custo atual"
                                name="custoAtual"
                                type="number"
                                inputProps={{
                                    min: 0,
                                    step: "0.01"
                                }}
                                value={
                                    formulario.custoAtual
                                }
                                onChange={
                                    atualizarCampo
                                }
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions>
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
                            type="submit"
                            variant="contained"
                            disabled={
                                salvando
                            }
                        >
                            {salvando
                                ? "Salvando..."
                                : "Salvar"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
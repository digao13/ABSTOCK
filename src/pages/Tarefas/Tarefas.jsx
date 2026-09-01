import { useMemo, useState } from "react";
import {
    Alert, Box, Button, Card, Checkbox, Chip, Dialog, DialogActions,
    DialogContent, DialogTitle, FormControlLabel, Grid, IconButton, MenuItem,
    Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TextField, Typography
} from "@mui/material";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { useTarefas } from "../../context/TarefaContext";
import { useAuth } from "../../context/AuthContext";
import { useProdutos } from "../../context/ProdutoContext";
import { useFiliais } from "../../context/FilialContext";

function dataHoje() {
    const agora = new Date();
    return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
}

const inicial = (filial = "") => ({ nome: "", motivo: "", filial, dataPlanejada: dataHoje(), itensEstoque: [], concluida: false, estoqueBaixado: false });
const filtrosIniciais = { responsavel: "todas", filial: "", status: "todas", dataInicial: "", dataFinal: "" };

export default function Tarefas() {
    const { usuario } = useAuth();
    const { produtos = [] } = useProdutos();
    const { filiais = [] } = useFiliais();
    const { tarefas, carregando, salvarTarefa, removerTarefa, alternarConclusao } = useTarefas();
    const [filtros, setFiltros] = useState(filtrosIniciais);
    const [form, setForm] = useState(inicial());
    const [produtoId, setProdutoId] = useState("");
    const [quantidade, setQuantidade] = useState("1");
    const [editando, setEditando] = useState(null);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [confirmar, setConfirmar] = useState(null);
    const [processando, setProcessando] = useState(false);

    const lista = useMemo(() => tarefas.filter((item) => {
        if (filtros.responsavel === "minhas" && item.responsavelId !== usuario?.uid) return false;
        if (filtros.responsavel === "outras" && item.responsavelId === usuario?.uid) return false;
        if (filtros.filial && item.filial !== filtros.filial) return false;
        if (filtros.status === "pendentes" && item.concluida) return false;
        if (filtros.status === "concluidas" && !item.concluida) return false;
        if (filtros.dataInicial && item.dataPlanejada < filtros.dataInicial) return false;
        if (filtros.dataFinal && item.dataPlanejada > filtros.dataFinal) return false;
        return true;
    }), [tarefas, filtros, usuario]);

    function abrirCadastro() {
        setEditando(null); setForm(inicial(filiais.find((item) => item.ativa !== false)?.nome || ""));
        setProdutoId(""); setQuantidade("1"); setMensagem(""); setDialogAberto(true);
    }

    function abrirEdicao(item) {
        setEditando(item.id); setForm({ ...inicial(), ...item }); setProdutoId(""); setQuantidade("1"); setMensagem(""); setDialogAberto(true);
    }

    function adicionarItem() {
        const produto = produtos.find((item) => item.id === produtoId);
        const qtd = Number(quantidade);
        if (!produto || !Number.isFinite(qtd) || qtd <= 0) return;
        const existente = form.itensEstoque.find((item) => item.produtoId === produto.id);
        const itens = existente
            ? form.itensEstoque.map((item) => item.produtoId === produto.id ? { ...item, quantidade: item.quantidade + qtd } : item)
            : [...form.itensEstoque, { produtoId: produto.id, produtoNome: produto.nome, produtoCodigo: produto.codigo || "", quantidade: qtd }];
        setForm((atual) => ({ ...atual, itensEstoque: itens })); setProdutoId(""); setQuantidade("1");
    }

    async function enviar(event) {
        event.preventDefault();
        if (!form.nome.trim() || !form.motivo.trim() || !form.filial || !form.dataPlanejada) { setMensagem("Preencha nome, motivo, filial e data planejada."); return; }
        await salvarTarefa({ ...form, responsavelId: usuario?.uid, responsavelNome: usuario?.displayName || usuario?.email || usuario?.uid }, editando);
        setDialogAberto(false); setEditando(null); setForm(inicial(filiais.find((item) => item.ativa !== false)?.nome || "")); setMensagem("Tarefa salva com sucesso.");
    }

    async function concluirConfirmado() {
        if (!confirmar) return;
        setProcessando(true);
        try { await alternarConclusao(confirmar); setMensagem("Tarefa concluída e estoque atualizado."); }
        catch (error) { setMensagem(error.message || "Não foi possível concluir a tarefa."); }
        finally { setProcessando(false); setConfirmar(null); }
    }

    return <Box sx={{ width: "100%", maxWidth: 1280, mx: "auto" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
            <Box><Typography variant="h4" fontWeight={700}><TaskAltOutlinedIcon sx={{ fontSize: 48, color: "#ff9b3d", verticalAlign: "middle", mr: 1 }} />Tarefas</Typography><Typography color="text.secondary">Planeje, acompanhe e conclua as atividades da operação.</Typography></Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCadastro} sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}>Nova tarefa</Button>
        </Stack>
        {mensagem && <Alert severity="info" onClose={() => setMensagem("")} sx={{ mb: 2 }}>{mensagem}</Alert>}

        <Card sx={{ mb: 2, borderRadius: 3 }}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1} sx={{ p: 2 }}><Box><Typography variant="h6">Lista de tarefas</Typography><Typography variant="body2" color="text.secondary">{lista.length} tarefa(s) encontrada(s)</Typography></Box><Button size="small" startIcon={<ClearIcon />} onClick={() => setFiltros(filtrosIniciais)}>Limpar filtros</Button></Stack>
            <Grid className="tarefa-filters-grid" container spacing={1.5} sx={{ px: 2, pb: 2 }}>
                <Grid item xs={12} sm={6} md={2.4}><TextField size="small" select fullWidth label="Responsável" value={filtros.responsavel} onChange={(e) => setFiltros({ ...filtros, responsavel: e.target.value })}><MenuItem value="todas">Todas</MenuItem><MenuItem value="minhas">Minhas tarefas</MenuItem><MenuItem value="outras">De outros usuários</MenuItem></TextField></Grid>
                <Grid item xs={12} sm={6} md={2.4}><TextField size="small" select fullWidth label="Filial" value={filtros.filial} onChange={(e) => setFiltros({ ...filtros, filial: e.target.value })}><MenuItem value="">Todas</MenuItem>{filiais.map((filial) => <MenuItem key={filial.id} value={filial.nome}>{filial.nome}</MenuItem>)}</TextField></Grid>
                <Grid item xs={12} sm={6} md={2.4}><TextField size="small" select fullWidth label="Status" value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}><MenuItem value="todas">Todos</MenuItem><MenuItem value="pendentes">Pendentes</MenuItem><MenuItem value="concluidas">Concluídas</MenuItem></TextField></Grid>
                <Grid item xs={12} sm={6} md={2.4}><Stack spacing={0.5}><Typography variant="caption" color="text.secondary">A partir de</Typography><TextField size="small" fullWidth type="date" inputProps={{ "aria-label": "A partir de" }} value={filtros.dataInicial} onChange={(e) => setFiltros({ ...filtros, dataInicial: e.target.value })} /></Stack></Grid>
                <Grid item xs={12} sm={6} md={2.4}><Stack spacing={0.5}><Typography variant="caption" color="text.secondary">Até</Typography><TextField size="small" fullWidth type="date" inputProps={{ "aria-label": "Até" }} value={filtros.dataFinal} onChange={(e) => setFiltros({ ...filtros, dataFinal: e.target.value })} /></Stack></Grid>
            </Grid>
        </Card>

        <Card sx={{ borderRadius: 3, overflow: "hidden" }}><TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}><Table size="small" sx={{ minWidth: 760 }}><TableHead><TableRow><TableCell>Tarefa</TableCell><TableCell>Filial</TableCell><TableCell>Data planejada</TableCell><TableCell>Estoque</TableCell><TableCell>Status</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead><TableBody>
            {carregando && <TableRow><TableCell colSpan={6}>Carregando tarefas...</TableCell></TableRow>}
            {!carregando && !lista.length && <TableRow><TableCell colSpan={6}><Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>Nenhuma tarefa encontrada.</Typography></TableCell></TableRow>}
            {lista.map((item) => <TableRow key={item.id} hover><TableCell><Typography fontWeight={600} sx={{ textDecoration: item.concluida ? "line-through" : "none" }}>{item.nome}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: "block", maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.motivo}</Typography></TableCell><TableCell>{item.filial || "—"}</TableCell><TableCell><Stack direction="row" spacing={0.5} alignItems="center"><EventOutlinedIcon fontSize="small" color="action" />{item.dataPlanejada || "—"}</Stack></TableCell><TableCell>{item.itensEstoque?.length ? `${item.itensEstoque.length} item(ns)` : "Nenhum"}</TableCell><TableCell><Chip size="small" label={item.concluida ? "Concluída" : "Pendente"} color={item.concluida ? "success" : "warning"} variant="outlined" /></TableCell><TableCell align="right"><Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>{!item.concluida && <Checkbox size="small" checked={false} onChange={() => setConfirmar(item)} inputProps={{ "aria-label": `Concluir ${item.nome}` }} />}<IconButton size="small" color="primary" onClick={() => abrirEdicao(item)} aria-label="Editar tarefa"><EditOutlinedIcon fontSize="small" /></IconButton><IconButton size="small" color="error" onClick={() => removerTarefa(item.id)} aria-label="Excluir tarefa"><DeleteOutlineIcon fontSize="small" /></IconButton></Stack></TableCell></TableRow>)}
        </TableBody></Table></TableContainer></Card>

        <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} fullWidth maxWidth="md" scroll="paper"><DialogTitle sx={{ pb: 1 }}>{editando ? "Editar tarefa" : "Nova tarefa"}<Typography variant="body2" color="text.secondary">Informe os dados da atividade e, se necessário, os itens que terão baixa.</Typography></DialogTitle><DialogContent dividers><Box className="tarefa-modal-form" component="form" id="form-tarefa" onSubmit={enviar} sx={{ pt: 1 }}><Grid container spacing={2}><Grid item xs={12}><TextField fullWidth required label="Nome da tarefa" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Grid><Grid item xs={12}><TextField select fullWidth required label="Filial" value={form.filial} onChange={(e) => setForm({ ...form, filial: e.target.value })}><MenuItem value="">Selecione uma filial</MenuItem>{filiais.filter((item) => item.ativa !== false || item.nome === form.filial).map((filial) => <MenuItem key={filial.id} value={filial.nome}>{filial.nome}</MenuItem>)}</TextField></Grid><Grid item xs={12}><TextField fullWidth required multiline minRows={3} label="Motivo" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} /></Grid><Grid item xs={12}><TextField fullWidth required type="date" label="Data planejada" InputLabelProps={{ shrink: true }} value={form.dataPlanejada} onChange={(e) => setForm({ ...form, dataPlanejada: e.target.value })} /></Grid><Grid item xs={12}><Typography variant="subtitle2" sx={{ mb: -0.5, fontWeight: 700 }}>Itens para baixa de estoque <Typography component="span" variant="caption" color="text.secondary">(opcional)</Typography></Typography></Grid><Grid item xs={12}><TextField select fullWidth label="Produto para saída" value={produtoId} onChange={(e) => setProdutoId(e.target.value)}><MenuItem value="">Selecione um produto</MenuItem>{produtos.map((produto) => <MenuItem key={produto.id} value={produto.id}>{produto.codigo ? `${produto.codigo} - ` : ""}{produto.nome} (saldo: {produto.estoqueAtual ?? 0})</MenuItem>)}</TextField></Grid><Grid item xs={12}><TextField fullWidth type="number" label="Quantidade" inputProps={{ min: 1, step: 1 }} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} /></Grid><Grid item xs={12}><Button fullWidth variant="outlined" onClick={adicionarItem} sx={{ height: "100%", minHeight: 56 }}>Adicionar</Button></Grid>{form.itensEstoque.length > 0 && <Grid item xs={12}><Typography variant="subtitle2" sx={{ mb: 0.5 }}>Itens vinculados à tarefa</Typography><Stack spacing={0.5}>{form.itensEstoque.map((item, index) => <Stack key={item.produtoId} direction="row" alignItems="center" spacing={1}><Typography variant="body2" sx={{ flex: 1 }}>{item.produtoNome} · {item.quantidade}</Typography><IconButton size="small" onClick={() => setForm({ ...form, itensEstoque: form.itensEstoque.filter((_, itemIndex) => itemIndex !== index) })}><DeleteOutlineIcon fontSize="small" /></IconButton></Stack>)}</Stack></Grid>}{editando && <Grid item xs={12}><FormControlLabel control={<Checkbox checked={Boolean(form.concluida)} onChange={(e) => setForm({ ...form, concluida: e.target.checked })} />} label="Tarefa concluída" /></Grid>}{mensagem && <Grid item xs={12}><Alert severity="warning">{mensagem}</Alert></Grid>}</Grid></Box></DialogContent><DialogActions><Button onClick={() => setDialogAberto(false)}>Cancelar</Button><Button type="submit" form="form-tarefa" variant="contained" startIcon={<AddTaskOutlinedIcon />}>{editando ? "Salvar alterações" : "Criar tarefa"}</Button></DialogActions></Dialog>
        <Dialog open={Boolean(confirmar)} onClose={() => !processando && setConfirmar(null)} fullWidth maxWidth="xs"><DialogTitle>Concluir tarefa?</DialogTitle><DialogContent>Os itens vinculados serão baixados do estoque. Confirme para concluir.</DialogContent><DialogActions><Button onClick={() => setConfirmar(null)} disabled={processando}>Cancelar</Button><Button variant="contained" onClick={concluirConfirmado} disabled={processando}>{processando ? "Concluindo..." : "Confirmar conclusão"}</Button></DialogActions></Dialog>
    </Box>;
}
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";

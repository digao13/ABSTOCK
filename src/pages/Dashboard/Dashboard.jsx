import { useMemo } from "react";
import {
    Box, Card, CardContent, Chip, Stack, Table, TableBody,
    TableCell, TableHead, TableRow, Typography
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useProdutos } from "../../context/ProdutoContext";
import { useCompras } from "../../context/CompraContext";
import { useSolicitacoesCompra } from "../../context/SolicitacaoCompraContext";
import { useTarefas } from "../../context/TarefaContext";

const normalizarStatus = (valor) => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[\s_-]/g, "");
const statusLabel = { pendente: "Pendente", aprovada: "Aprovada", realizada: "Realizada", recebida: "Recebida", comprada: "Comprada", rejeitada: "Rejeitada", cancelada: "Cancelada" };
const statusColor = { pendente: "#ff6b6b", aprovada: "#55a8ff", realizada: "#ffbd5c", recebida: "#63d391", comprada: "#63d391", rejeitada: "#ff6b6b", cancelada: "#9ca8b6" };

function formatarData(valor) {
    if (!valor) return "—";
    if (typeof valor?.toDate === "function") return valor.toDate().toLocaleDateString("pt-BR");
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? "—" : data.toLocaleDateString("pt-BR");
}

function Barra({ label, valor, total, cor = "#ff9b3d" }) {
    const percentual = total ? Math.max(4, Math.round((valor / total) * 100)) : 0;
    return <Stack spacing={0.5} sx={{ mb: 1.5 }}><Stack direction="row" justifyContent="space-between"><Typography variant="body2" noWrap>{label}</Typography><Typography variant="body2" fontWeight={700}>{valor}</Typography></Stack><Box sx={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }}><Box sx={{ height: "100%", width: `${percentual}%`, borderRadius: 99, background: cor, transition: "width .35s ease" }} /></Box></Stack>;
}

export default function Dashboard() {
    const { produtos = [] } = useProdutos();
    const { compras = [] } = useCompras();
    const { totalSolicitacoesPendentes = 0 } = useSolicitacoesCompra();
    const { tarefas = [] } = useTarefas();
    const tarefasAbertas = tarefas.filter((item) => !item.concluida);
    const estoqueBaixo = produtos.filter((item) => Number(item.estoqueAtual || 0) <= Number(item.estoqueMinimo || 0));
    const emTransporte = compras.filter((item) => ["realizada", "aguardandorecebimento"].includes(normalizarStatus(item.status))).length;

    const statusCompras = useMemo(() => {
        const mapa = {};
        compras.forEach((item) => { const status = normalizarStatus(item.status) || "pendente"; mapa[status] = (mapa[status] || 0) + 1; });
        return Object.entries(mapa).sort((a, b) => b[1] - a[1]);
    }, [compras]);
    const tarefasFiliais = useMemo(() => {
        const mapa = {};
        tarefas.forEach((item) => { const filial = item.filial || "Sem filial"; mapa[filial] = (mapa[filial] || 0) + 1; });
        return Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 6);
    }, [tarefas]);
    const produtosCriticos = useMemo(() => [...produtos].sort((a, b) => Number(a.estoqueAtual || 0) - Number(b.estoqueAtual || 0)).slice(0, 6), [produtos]);
    const indicadores = [
        ["Produtos", produtos.length, "Itens cadastrados", <Inventory2OutlinedIcon key="produtos" />, "#55a8ff"],
        ["Solicitações pendentes", totalSolicitacoesPendentes, "Aguardando compra", <ShoppingCartOutlinedIcon key="solicitacoes" />, "#ffbd5c"],
        ["Em transporte", emTransporte, "Compras aguardando recebimento", <LocalShippingOutlinedIcon key="transporte" />, "#9b8cff"],
        ["Tarefas abertas", tarefasAbertas.length, "Atividades pendentes", <TaskAltOutlinedIcon key="tarefas" />, "#63d391"],
        ["Estoque baixo", estoqueBaixo.length, "Itens no limite mínimo", <WarningAmberOutlinedIcon key="baixo" />, "#ff6b6b"]
    ];

    return <Box sx={{ width: "100%", maxWidth: 1500, mx: "auto" }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}><DashboardOutlinedIcon sx={{ fontSize: 52, color: "#ff9b3d" }} /><Box><Typography variant="h4" fontWeight={700}>Dashboard</Typography><Typography color="text.secondary">Visão operacional atualizada em tempo real.</Typography></Box></Stack>
        <Box className="dashboard-indicadores" sx={{ mb: 3 }}>{indicadores.map(([titulo, valor, descricao, icon, cor]) => <Card key={titulo} elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}><Box sx={{ height: 4, background: cor }} /><CardContent sx={{ p: 2.25 }}><Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box><Typography variant="body2" color="text.secondary">{titulo}</Typography><Typography variant="h3" fontWeight={700} sx={{ mt: .5 }}>{valor}</Typography></Box><Box sx={{ width: 42, height: 42, borderRadius: 2, display: "grid", placeItems: "center", color: cor, background: `${cor}1f` }}>{icon}</Box></Stack><Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>{descricao}</Typography></CardContent></Card>)}</Box>
        <Box className="dashboard-graficos">
            <Card elevation={0} sx={{ borderRadius: 3 }}><CardContent><Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Compras por status</Typography>{statusCompras.length ? statusCompras.map(([status, valor]) => <Barra key={status} label={statusLabel[status] || status} valor={valor} total={compras.length} cor={statusColor[status] || "#ff9b3d"} />) : <Typography color="text.secondary">Nenhuma compra registrada.</Typography>}</CardContent></Card>
            <Card elevation={0} sx={{ borderRadius: 3 }}><CardContent><Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Tarefas por filial</Typography>{tarefasFiliais.length ? tarefasFiliais.map(([filial, valor]) => <Barra key={filial} label={filial} valor={valor} total={tarefas.length} cor="#55a8ff" />) : <Typography color="text.secondary">Nenhuma tarefa registrada.</Typography>}</CardContent></Card>
            <Card elevation={0} sx={{ borderRadius: 3 }}><CardContent><Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Produtos com menor saldo</Typography>{produtosCriticos.length ? produtosCriticos.map((produto) => <Barra key={produto.id} label={produto.nome || "Produto"} valor={Number(produto.estoqueAtual || 0)} total={Math.max(...produtosCriticos.map((item) => Number(item.estoqueAtual || 0)), 1)} cor={estoqueBaixo.some((item) => item.id === produto.id) ? "#ff6b6b" : "#ff9b3d"} />) : <Typography color="text.secondary">Nenhum produto cadastrado.</Typography>}</CardContent></Card>
        </Box>
        <Card elevation={0} sx={{ borderRadius: 3, mt: 2 }}><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}><Box><Typography variant="h6" fontWeight={700}>Últimas compras</Typography><Typography variant="body2" color="text.secondary">Acompanhamento rápido das movimentações recentes.</Typography></Box><Chip className="dashboard-total-chip" size="small" label={`${compras.length} no total`} variant="outlined" /></Stack><Box sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow><TableCell>Fornecedor</TableCell><TableCell>Itens</TableCell><TableCell>Data</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{compras.slice(0, 6).map((compra) => { const status = normalizarStatus(compra.status); return <TableRow key={compra.id}><TableCell>{compra.fornecedorNome || "Não informado"}</TableCell><TableCell>{compra.itens?.length || 0}</TableCell><TableCell>{formatarData(compra.criadoEm)}</TableCell><TableCell><Chip size="small" label={statusLabel[status] || compra.status || "Pendente"} sx={{ color: statusColor[status] || "#ffbd5c", borderColor: statusColor[status] || "#ffbd5c" }} variant="outlined" /></TableCell></TableRow>; })}</TableBody></Table></Box>{!compras.length && <Typography color="text.secondary" sx={{ py: 2 }}>Nenhuma compra registrada.</Typography>}</CardContent></Card>
    </Box>;
}

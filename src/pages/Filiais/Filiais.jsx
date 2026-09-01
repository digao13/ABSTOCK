import { useMemo, useState } from "react";
import {
    Alert, Box, Button, Card, Chip, Dialog, DialogActions,
    DialogContent, DialogTitle, IconButton, MenuItem, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Typography
} from "@mui/material";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import { useFiliais } from "../../context/FilialContext";

export default function Filiais() {
    const { filiais = [], adicionarFilial, editarFilial } = useFiliais();
    const [nome, setNome] = useState("");
    const [filtro, setFiltro] = useState("ativas");
    const [editando, setEditando] = useState(null);
    const [mensagem, setMensagem] = useState("");

    const visiveis = useMemo(
        () => filiais.filter((item) => filtro === "todas" || (filtro === "ativas" ? item.ativa !== false : item.ativa === false)),
        [filiais, filtro]
    );

    async function salvar(event) {
        event.preventDefault();
        if (!nome.trim()) return;
        try {
            await adicionarFilial(nome);
            setNome("");
            setMensagem("Filial cadastrada com sucesso.");
        } catch (error) {
            setMensagem(error.message || "Não foi possível cadastrar a filial.");
        }
    }

    async function salvarEdicao() {
        if (!editando) return;
        try {
            await editarFilial(editando.id, editando.nome, editando.ativa);
            setEditando(null);
            setMensagem("Filial atualizada com sucesso.");
        } catch (error) {
            setMensagem(error.message || "Não foi possível atualizar a filial.");
        }
    }

    return <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto" }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <StoreOutlinedIcon color="warning" sx={{ fontSize: 42 }} />
            <Box>
                <Typography variant="h4" fontWeight={700}>Filiais</Typography>
                <Typography color="text.secondary">Gerencie unidades sem apagar o histórico.</Typography>
            </Box>
        </Stack>

        {mensagem && <Alert severity="info" onClose={() => setMensagem("")} sx={{ mb: 2 }}>{mensagem}</Alert>}

        <Card sx={{ borderRadius: 3, mb: 2 }}>
            <Box component="form" onSubmit={salvar} sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField fullWidth size="small" label="Nome da filial" value={nome} onChange={(event) => setNome(event.target.value)} required />
                    <Button type="submit" variant="contained" startIcon={<AddIcon />} sx={{ minWidth: { xs: "100%", sm: 150 } }}>Cadastrar</Button>
                </Stack>
            </Box>
        </Card>

        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5} sx={{ p: 2 }}>
                <Box><Typography variant="h6">Filiais cadastradas</Typography><Typography variant="body2" color="text.secondary">{visiveis.length} unidade(s) exibida(s)</Typography></Box>
                <TextField select size="small" label="Exibir" value={filtro} onChange={(event) => setFiltro(event.target.value)} sx={{ minWidth: 170 }}>
                    <MenuItem value="ativas">Ativas</MenuItem><MenuItem value="inativas">Inativas</MenuItem><MenuItem value="todas">Todas</MenuItem>
                </TextField>
            </Stack>
            <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 520 }}>
                    <TableHead><TableRow><TableCell>Filial</TableCell><TableCell>Status</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead>
                    <TableBody>
                        {visiveis.map((item) => <TableRow key={item.id} hover><TableCell><Typography fontWeight={600}>{item.nome}</Typography></TableCell><TableCell><Chip size="small" label={item.ativa === false ? "Inativa" : "Ativa"} color={item.ativa === false ? "default" : "success"} variant="outlined" /></TableCell><TableCell align="right"><IconButton color="primary" size="small" onClick={() => setEditando({ id: item.id, nome: item.nome, ativa: item.ativa !== false })} aria-label={`Editar ${item.nome}`}><EditOutlinedIcon fontSize="small" /></IconButton></TableCell></TableRow>)}
                        {!visiveis.length && <TableRow><TableCell colSpan={3}><Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>Nenhuma filial encontrada.</Typography></TableCell></TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>

        <Dialog open={Boolean(editando)} onClose={() => setEditando(null)} fullWidth maxWidth="xs">
            <DialogTitle>Editar filial<Typography variant="body2" color="text.secondary">Atualize o nome ou inative a unidade sem remover o histórico.</Typography></DialogTitle>
            <DialogContent dividers><Stack spacing={2} sx={{ pt: 1 }}><TextField fullWidth label="Nome da filial" value={editando?.nome || ""} onChange={(event) => setEditando({ ...editando, nome: event.target.value })} /><TextField select fullWidth label="Situação" value={editando?.ativa ? "ativa" : "inativa"} onChange={(event) => setEditando({ ...editando, ativa: event.target.value === "ativa" })}><MenuItem value="ativa">Ativa</MenuItem><MenuItem value="inativa">Inativa</MenuItem></TextField></Stack></DialogContent>
            <DialogActions><Button onClick={() => setEditando(null)}>Cancelar</Button><Button variant="contained" onClick={salvarEdicao}>Salvar alterações</Button></DialogActions>
        </Dialog>
    </Box>;
}

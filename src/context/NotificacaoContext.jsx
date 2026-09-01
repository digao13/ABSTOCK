import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { useAuth } from "./AuthContext";
import { useTarefas } from "./TarefaContext";
import { useCompras } from "./CompraContext";
import { useSolicitacoesCompra } from "./SolicitacaoCompraContext";

const NotificacaoContext = createContext(null);

function nomeItem(item, fallback) {
    return item?.nome || item?.titulo || item?.itemNome || fallback;
}

export function NotificacaoProvider({ children }) {
    const { usuario } = useAuth();
    const { tarefas = [] } = useTarefas();
    const { compras = [] } = useCompras();
    const { solicitacoes = [] } = useSolicitacoesCompra();
    const inicializado = useRef(false);
    const snapshotAnterior = useRef({ tarefas: new Map(), compras: new Map(), solicitacoes: new Map() });
    const [aviso, setAviso] = useState(null);

    const notificar = useCallback((mensagem, severity = "info") => {
        setAviso({ mensagem, severity, chave: Date.now() });
    }, []);

    useEffect(() => {
        if (!usuario) {
            inicializado.current = false;
            snapshotAnterior.current = { tarefas: new Map(), compras: new Map(), solicitacoes: new Map() };
            setAviso(null);
            return;
        }
        const atual = {
            tarefas: new Map(tarefas.map((item) => [item.id, item])),
            compras: new Map(compras.map((item) => [item.id, item])),
            solicitacoes: new Map(solicitacoes.map((item) => [item.id, item]))
        };
        if (!inicializado.current) {
            snapshotAnterior.current = atual;
            inicializado.current = true;
            return;
        }
        const anterior = snapshotAnterior.current;
        const novaTarefa = tarefas.find((item) => !anterior.tarefas.has(item.id));
        const novaSolicitacao = solicitacoes.find((item) => !anterior.solicitacoes.has(item.id));
        const novaCompra = compras.find((item) => !anterior.compras.has(item.id));
        if (novaTarefa) notificar(`Nova tarefa: ${nomeItem(novaTarefa, "atividade")}`, "info");
        else if (novaSolicitacao) notificar(`Nova solicitação de compra: ${nomeItem(novaSolicitacao, "item")}`, "warning");
        else if (novaCompra) notificar(`Nova compra registrada: ${nomeItem(novaCompra, "compra")}`, "success");
        else {
            const compraAlterada = compras.find((item) => {
                const antiga = anterior.compras.get(item.id);
                return antiga && antiga.status !== item.status;
            });
            if (compraAlterada) notificar(`Status da compra atualizado: ${compraAlterada.status || "alterado"}`, "success");
        }
        snapshotAnterior.current = atual;
    }, [usuario, tarefas, compras, solicitacoes, notificar]);

    return <NotificacaoContext.Provider value={{ notificar }}>
        {children}
        <Snackbar key={aviso?.chave} open={Boolean(aviso)} autoHideDuration={5000} onClose={() => setAviso(null)} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
            {aviso ? <Alert severity={aviso.severity} variant="filled" onClose={() => setAviso(null)} sx={{ minWidth: { xs: "calc(100vw - 32px)", sm: 340 }, boxShadow: 6 }}>{aviso.mensagem}</Alert> : undefined}
        </Snackbar>
    </NotificacaoContext.Provider>;
}
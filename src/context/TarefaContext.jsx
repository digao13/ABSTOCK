import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { atualizarTarefa, cadastrarTarefa, excluirTarefa, observarTarefas } from "../services/tarefaService";
import { registrarMovimentacao } from "../services/movimentacaoEstoqueService";

const TarefaContext = createContext(null);

export function TarefaProvider({ children }) {
    const { usuario, carregando: carregandoAuth } = useAuth();
    const [tarefas, setTarefas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        if (carregandoAuth) return undefined;
        if (!usuario) {
            setTarefas([]);
            setCarregando(false);
            return undefined;
        }
        setCarregando(true);
        return observarTarefas(
            (lista) => { setTarefas(lista); setCarregando(false); },
            (error) => { console.error("Erro ao acompanhar tarefas:", error); setErro(error); setCarregando(false); }
        );
    }, [carregandoAuth, usuario]);

    const salvarTarefa = useCallback(async (dados, id = null) => {
        setErro(null);
        try {
            if (id) await atualizarTarefa(id, dados);
            else await cadastrarTarefa(dados);
        } catch (error) { setErro(error); throw error; }
    }, []);

    const removerTarefa = useCallback(async (id) => {
        setErro(null);
        try { await excluirTarefa(id); } catch (error) { setErro(error); throw error; }
    }, []);

    const alternarConclusao = useCallback(async (tarefa) => {
        const concluindo = !tarefa.concluida;
        if (concluindo && !tarefa.estoqueBaixado) {
            for (const item of tarefa.itensEstoque || []) {
                await registrarMovimentacao({ produtoId: item.produtoId, tipo: "saida", origem: "outros", quantidade: Number(item.quantidade), observacao: `Baixa automática da tarefa: ${tarefa.nome}` });
            }
        }
        await salvarTarefa({ ...tarefa, concluida: concluindo, estoqueBaixado: concluindo ? true : tarefa.estoqueBaixado }, tarefa.id);
    }, [salvarTarefa]);
    const valor = useMemo(() => ({ tarefas, carregando, erro, salvarTarefa, removerTarefa, alternarConclusao }), [tarefas, carregando, erro, salvarTarefa, removerTarefa, alternarConclusao]);
    return <TarefaContext.Provider value={valor}>{children}</TarefaContext.Provider>;
}

export function useTarefas() {
    const contexto = useContext(TarefaContext);
    if (!contexto) throw new Error("useTarefas precisa estar dentro de TarefaProvider");
    return contexto;
}



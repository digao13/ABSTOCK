import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { atualizarFilial, cadastrarFilial, observarFiliais } from "../services/filialService";
const FilialContext = createContext(null);
export function FilialProvider({ children }) { const { usuario, carregando: carregandoAuth } = useAuth(); const [filiais, setFiliais] = useState([]); const [carregando, setCarregando] = useState(true); useEffect(() => { if (carregandoAuth) return undefined; if (!usuario) { setFiliais([]); setCarregando(false); return undefined; } return observarFiliais((lista) => { setFiliais(lista); setCarregando(false); }, () => setCarregando(false)); }, [carregandoAuth, usuario]); const adicionarFilial = useCallback((nome) => cadastrarFilial(nome), []); const editarFilial = useCallback((id, nome, ativa) => atualizarFilial(id, nome, ativa), []); const valor = useMemo(() => ({ filiais, carregando, adicionarFilial, editarFilial }), [filiais, carregando, adicionarFilial, editarFilial]); return <FilialContext.Provider value={valor}>{children}</FilialContext.Provider>; }
export function useFiliais() { const contexto = useContext(FilialContext); if (!contexto) throw new Error("useFiliais precisa estar dentro de FilialProvider"); return contexto; }


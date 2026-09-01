import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";

import { auth, db } from "./firebase";

const tarefasCollection = collection(db, "tarefas");

function usuarioAtual() {
    const usuario = auth.currentUser;
    if (!usuario) throw new Error("Usuário não autenticado.");
    return usuario;
}

export function observarTarefas(onChange, onError) {
    return onSnapshot(
        query(tarefasCollection, orderBy("criadoEm", "desc")),
        (snapshot) => onChange(snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
        }))),
        onError
    );
}

export async function cadastrarTarefa(dados) {
    const usuario = usuarioAtual();
    const referencia = await addDoc(tarefasCollection, {
        nome: String(dados.nome || "").trim().toUpperCase(),
        motivo: String(dados.motivo || "").trim().toUpperCase(),
        responsavelId: dados.responsavelId || usuario.uid,
        responsavelNome: dados.responsavelNome || usuario.displayName || usuario.email || usuario.uid,
        filial: String(dados.filial || "").trim().toUpperCase(),
        dataPlanejada: dados.dataPlanejada || "",
        itensEstoque: Array.isArray(dados.itensEstoque) ? dados.itensEstoque : [],
        concluida: Boolean(dados.concluida),
        criadoPor: usuario.uid,
        atualizadoPor: usuario.uid,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
    });
    return referencia.id;
}

export async function atualizarTarefa(id, dados) {
    const usuario = usuarioAtual();
    await updateDoc(doc(db, "tarefas", id), {
        nome: String(dados.nome || "").trim().toUpperCase(),
        motivo: String(dados.motivo || "").trim().toUpperCase(),
        responsavelId: dados.responsavelId || usuario.uid,
        responsavelNome: dados.responsavelNome || usuario.displayName || usuario.email || usuario.uid,
        filial: String(dados.filial || "").trim().toUpperCase(),
        dataPlanejada: dados.dataPlanejada || "",
        itensEstoque: Array.isArray(dados.itensEstoque) ? dados.itensEstoque : [],
        concluida: Boolean(dados.concluida),
        atualizadoPor: usuario.uid,
        atualizadoEm: serverTimestamp()
    });
}

export async function excluirTarefa(id) {
    usuarioAtual();
    await deleteDoc(doc(db, "tarefas", id));
}


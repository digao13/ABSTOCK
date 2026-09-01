import {
    collection,
    getDocs,
    orderBy,
    query
} from "firebase/firestore";

import { db } from "./firebase";

const movimentacoesCollection = collection(
    db,
    "movimentacoesEstoque"
);

export async function listarMovimentacoesEstoque() {
    const consulta = query(
        movimentacoesCollection,
        orderBy("movimentadoEm", "desc")
    );

    const snapshot = await getDocs(consulta);

    return snapshot.docs.map((movimentacao) => ({
        id: movimentacao.id,
        ...movimentacao.data()
    }));
}
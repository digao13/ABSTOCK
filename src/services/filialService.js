import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
const filiaisCollection = collection(db, "filiais");
function uid() { const id = auth.currentUser?.uid; if (!id) throw new Error("Usuário não autenticado."); return id; }
export function observarFiliais(onChange, onError) { return onSnapshot(query(filiaisCollection, orderBy("nome")), (snapshot) => onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), onError); }
export async function cadastrarFilial(nome) { const criadoPor = uid(); const valor = String(nome || "").trim().toUpperCase(); if (!valor) throw new Error("Informe o nome da filial."); return (await addDoc(filiaisCollection, { nome: valor, criadoPor, criadoEm: serverTimestamp() })).id; }
export async function atualizarFilial(id, nome, ativa) { const atualizadoPor = uid(); const valor = String(nome || "").trim().toUpperCase(); if (!valor) throw new Error("Informe o nome da filial."); await updateDoc(doc(db, "filiais", id), { nome: valor, ativa: Boolean(ativa), atualizadoPor, atualizadoEm: serverTimestamp() }); }


import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { PermissionProvider } from "./context/PermissionContext";
import { ProdutoProvider } from "./context/ProdutoContext";
import { CompraProvider } from "./context/CompraContext";
import { MovimentacaoEstoqueProvider } from "./context/MovimentacaoEstoqueContext";
import { FornecedorProvider } from "./context/FornecedorContext";
import { SolicitacaoCompraProvider } from "./context/SolicitacaoCompraContext";
import { TarefaProvider } from "./context/TarefaContext";
import { FilialProvider } from "./context/FilialContext";
import { NotificacaoProvider } from "./context/NotificacaoContext";

import "./index.css";

// Logs detalhados ficam desativados apenas na versão publicada para reduzir ruído e custo de processamento.
if (import.meta.env.PROD) {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
}

ReactDOM.createRoot(
    document.getElementById("root")
).render(

    <React.StrictMode>

        <AuthProvider>

            <PermissionProvider>

                <ProdutoProvider>

                    <CompraProvider>

                        <MovimentacaoEstoqueProvider>

                            <FornecedorProvider>

                                <SolicitacaoCompraProvider>


                                    <TarefaProvider>

                                        <FilialProvider>


                                    <NotificacaoProvider>
                                    <App />
                                    </NotificacaoProvider>

                                        </FilialProvider>

                                    </TarefaProvider>

                                </SolicitacaoCompraProvider>

                            </FornecedorProvider>

                        </MovimentacaoEstoqueProvider>

                    </CompraProvider>

                </ProdutoProvider>

            </PermissionProvider>

        </AuthProvider>

    </React.StrictMode>

);

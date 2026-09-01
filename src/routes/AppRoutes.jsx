import { lazy, Suspense } from "react";
import { Outlet, Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

const Login = lazy(() => import("../pages/Login/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const AcessoNegado = lazy(() => import("../pages/AcessoNegado/AcessoNegado"));

const Estoque = lazy(() => import("../pages/Estoque/Estoque"));
const EntradaEstoque = lazy(() => import("../pages/Estoque/EntradaEstoque"));
const SaidaEstoque = lazy(() => import("../pages/Estoque/SaidaEstoque"));
const HistoricoMovimentacoes = lazy(() => import("../pages/Estoque/HistoricoMovimentacoes"));

const Fornecedores = lazy(() => import("../pages/Compras/Fornecedores"));
const CentralCompras = lazy(() => import("../pages/Compras/CentralCompras"));
const Filiais = lazy(() => import("../pages/Filiais/Filiais"));
const SolicitacoesCompra = lazy(() => import("../pages/Compras/SolicitacoesCompra"));
const RealizarCompra = lazy(() => import("../pages/Compras/RealizarCompra"));
const Tarefas = lazy(() => import("../pages/Tarefas/Tarefas"));
const Relatorios = lazy(() => import("../pages/Relatorios/Relatorios"));
const ReceberCompra = lazy(() => import("../pages/Compras/ReceberCompra"));

const Usuarios = lazy(() => import("../pages/Usuarios/Usuarios"));

import { CompraProvider } from "../context/CompraContext";

import { PERMISSOES } from "../context/PermissionContext";

export default function AppRoutes() {
    return (
        <Suspense fallback={<div className="app-loading" aria-live="polite">Carregando...</div>}>
        <Routes>

            {/* =====================================================
                ROTAS PÚBLICAS
            ===================================================== */}

            <Route
                path="/login"
                element={
                    <Login />
                }
            />

            <Route
                path="/acesso-negado"
                element={
                    <AcessoNegado />
                }
            />


            {/* =====================================================
                ÁREA PROTEGIDA
            ===================================================== */}

            <Route
                element={
                    <ProtectedRoute />
                }
            >

                <Route
                    element={
                        <MainLayout />
                    }
                >

                    {/* =================================================
                        DASHBOARD
                    ================================================= */}

                    <Route
                        element={
                            <ProtectedRoute
                                permissao={
                                    PERMISSOES.DASHBOARD_VISUALIZAR
                                }
                            />
                        }
                    >

                        <Route
                            path="/"
                            element={
                                <Dashboard />
                            }
                        />

                    </Route>


                    {/* =================================================
                        ESTOQUE
                    ================================================= */}

                    <Route
                        element={
                            <ProtectedRoute
                                permissao={
                                    PERMISSOES.ESTOQUE_VISUALIZAR
                                }
                            />
                        }
                    >

                        <Route
                            path="/estoque"
                            element={
                                <Estoque />
                            }
                        />

                        <Route
                            path="/estoque/entrada"
                            element={
                                <EntradaEstoque />
                            }
                        />

                        <Route
                            path="/estoque/saida"
                            element={
                                <SaidaEstoque />
                            }
                        />

                        <Route
                            path="/estoque/historico"
                            element={
                                <HistoricoMovimentacoes />
                            }
                        />

                    </Route>


                    {/* =================================================
                        COMPRAS
                    ================================================= */}

                    <Route
                        element={
                            <ProtectedRoute
                                permissao={
                                    PERMISSOES.COMPRAS_VISUALIZAR
                                }
                            />
                        }
                    >

                        <Route
                            element={
                                <CompraProvider>
                                    <Outlet />
                                </CompraProvider>
                            }
                        >

                            {/* -----------------------------------------
                                SOLICITAÇÕES DE COMPRA
                            ----------------------------------------- */}

                            <Route
                                path="/compras/solicitacoes"
                                element={
                                    <SolicitacoesCompra />
                                }
                            />


                            {/* -----------------------------------------
                                REALIZAR COMPRA
                            ----------------------------------------- */}

                            <Route
                                path="/compras/realizar"
                                element={
                                    <RealizarCompra />
                                }
                            />


                            {/* -----------------------------------------
                                RECEBER COMPRA
                            ----------------------------------------- */}

                            <Route
                                path="/compras/receber"
                                element={
                                    <ReceberCompra />
                                }
                            />


                            {/* -----------------------------------------
                                FORNECEDORES
                            ----------------------------------------- */}

                            <Route
                                path="/compras/fornecedores"
                                element={
                                    <Fornecedores />
                                }
                            />

                    <Route
                        element={<ProtectedRoute permissao={PERMISSOES.TAREFAS_VISUALIZAR} />}
                    >
                        <Route path="/tarefas" element={<Tarefas />} />
                    </Route>

                        </Route>

                    </Route>

                    <Route
                        element={<ProtectedRoute permissao={PERMISSOES.RELATORIOS_VISUALIZAR} />}
                    >
                        <Route path="/relatorios" element={<Relatorios />} />
                    </Route>


                    <Route element={<ProtectedRoute permissao={PERMISSOES.COMPRAS_VISUALIZAR} />}><Route path="/compras" element={<CentralCompras />} /></Route>
                    <Route element={<ProtectedRoute permissao={PERMISSOES.TAREFAS_VISUALIZAR} />}><Route path="/filiais" element={<Filiais />} /></Route>

                    {/* =================================================

                        USUÁRIOS
                    ================================================= */}

                    <Route
                        element={
                            <ProtectedRoute
                                permissao={
                                    PERMISSOES.USUARIOS_VISUALIZAR
                                }
                            />
                        }
                    >

                        <Route
                            path="/usuarios"
                            element={
                                <Usuarios />
                            }
                        />

                    </Route>

                </Route>

            </Route>


            {/* =====================================================
                ROTA DE SEGURANÇA
            ===================================================== */}

            <Route
                path="*"
                element={
                    <AcessoNegado />
                }
            />

        </Routes>
        </Suspense>
    );
}




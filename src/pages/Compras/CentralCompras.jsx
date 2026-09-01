import { Box, Card, CardContent, Tab, Tabs, Typography } from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SolicitacoesCompra from "./SolicitacoesCompra";
import RealizarCompra from "./RealizarCompra";
import ReceberCompra from "./ReceberCompra";
import Fornecedores from "./Fornecedores";
import { useState } from "react";
export default function CentralCompras() { const [aba, setAba] = useState(0); const telas=[<SolicitacoesCompra key="solicitacoes" />,<RealizarCompra key="realizar" />,<ReceberCompra key="receber" />,<Fornecedores key="fornecedores" />]; return <Box sx={{ width:"100%", maxWidth:1600, mx:"auto" }}><Box sx={{ mb:3, display:"flex", alignItems:"center", gap:2 }}><ShoppingCartOutlinedIcon color="warning" fontSize="large"/><Box><Typography variant="h4" fontWeight={700}>Compras</Typography><Typography color="text.secondary">Todos os processos de compras em uma única área.</Typography></Box></Box><Card elevation={0} sx={{ borderRadius:3, overflow:"hidden" }}><CardContent sx={{ p:0 }}><Tabs value={aba} onChange={(_,v)=>setAba(v)} variant="scrollable" scrollButtons="auto"><Tab label="Solicitar compra"/><Tab label="Realizar compra"/><Tab label="Receber compras"/><Tab label="Fornecedores"/></Tabs><Box sx={{ p:{xs:1,sm:3}, overflowX:"auto" }}>{telas[aba]}</Box></CardContent></Card></Box>; }


import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
    AppBar,
    Avatar,
    Box,
    Collapse,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PeopleIcon from "@mui/icons-material/People";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

import { useAuth } from "../context/AuthContext";

import {
    usePermissions,
    PERMISSOES
} from "../context/PermissionContext";


const drawerWidth = 250;


// ============================================================
// CORES DA IDENTIDADE VISUAL
// ============================================================

const coresEscuro = { fundo: "#0f1115", fundoSecundario: "#15181d", drawer: "#111318", card: "#181b21", texto: "#f5f5f5", textoSecundario: "#9ca3af", laranja: "#ff7a00", vermelho: "#e53935", borda: "rgba(255,255,255,0.07)" };
const coresClaro = { fundo: "#f4f6f8", fundoSecundario: "#ffffff", drawer: "#ffffff", card: "#ffffff", texto: "#18212b", textoSecundario: "#5d6b78", laranja: "#e56d00", vermelho: "#c62828", borda: "rgba(24,33,43,0.14)" };


// ============================================================
// MENU PRINCIPAL
// ============================================================

const menuItems = [
    {
        label: "Dashboard",
        path: "/",
        icon: <DashboardOutlinedIcon />,
        permissao: PERMISSOES.DASHBOARD_VISUALIZAR
    },
    {
        label: "Estoque",
        path: "/estoque",
        icon: <Inventory2OutlinedIcon />,
        permissao: PERMISSOES.ESTOQUE_VISUALIZAR
    },
    {
        label: "Movimentações",
        path: "/estoque/historico",
        icon: <HistoryOutlinedIcon />,
        permissao: PERMISSOES.ESTOQUE_VISUALIZAR
    },
    {
        label: "Tarefas",
        path: "/tarefas",
        icon: <TaskAltOutlinedIcon />,
        permissao: PERMISSOES.TAREFAS_VISUALIZAR
    },
       {
        label: "Filiais",
        path: "/filiais",
        icon: <StoreOutlinedIcon />,
        permissao: PERMISSOES.TAREFAS_VISUALIZAR
    },
 {
        label: "Relatórios",
        path: "/relatorios",
        icon: <AssessmentOutlinedIcon />,
        permissao: PERMISSOES.RELATORIOS_VISUALIZAR
    },
    {
        label: "Usuários",
        path: "/usuarios",
        icon: <PeopleIcon />,
        permissao: PERMISSOES.USUARIOS_VISUALIZAR
    }
];


export default function MainLayout() {

    const {
        usuario,
        logout
    } = useAuth();


    const {
        temPermissao
    } = usePermissions();


    const navigate = useNavigate();

    const location = useLocation();

    const [modoClaro, setModoClaro] = useState(() => localStorage.getItem("abstock-tema") === "claro");
    const cores = modoClaro ? coresClaro : coresEscuro;

    useEffect(() => {
        document.documentElement.dataset.theme = modoClaro ? "light" : "dark";
        localStorage.setItem("abstock-tema", modoClaro ? "claro" : "escuro");
    }, [modoClaro]);


    const [
        mobileOpen,
        setMobileOpen
    ] = useState(false);


    const [
        anchorEl,
        setAnchorEl
    ] = useState(null);


    const [
        comprasAberto,
        setComprasAberto
    ] = useState(
        location.pathname.startsWith("/compras")
    );


    // ============================================================
    // NAVEGAÇÃO
    // ============================================================

    function handleNavigation(path) {

        navigate(path);

        setMobileOpen(false);
    }


    function handleCompras() {
        navigate("/compras");


        setComprasAberto(
            (aberto) => !aberto
        );
    }


    // ============================================================
    // LOGOUT
    // ============================================================

    async function handleLogout() {

        setAnchorEl(null);

        try {

            await logout();

            navigate(
                "/login",
                {
                    replace: true
                }
            );

        } catch (error) {

            console.error(
                "Erro ao sair:",
                error
            );

        }
    }


    // ============================================================
    // PERMISSÕES
    // ============================================================

    const menuItemsPermitidos =
        menuItems.filter(
            (item) =>
                temPermissao(
                    item.permissao
                )
        );


    const podeVisualizarCompras =
        temPermissao(
            PERMISSOES.COMPRAS_VISUALIZAR
        );


    // ============================================================
    // DRAWER / MENU LATERAL
    // ============================================================

    const drawer = (

        <Box
            sx={{
                height: "100%",
                backgroundColor: cores.drawer,
                color: cores.texto,
                display: "flex",
                flexDirection: "column"
            }}
        >

            {/* ==================================================
                LOGO
            ================================================== */}

            <Toolbar
                sx={{
                    minHeight: "82px !important",
                    px: 2.5,
                    display: "flex",
                    alignItems: "center"
                }}
            >

                <Box
                    component="img"
                    src="/logo.png"
                    alt="ABSTOCK"
                    sx={{
                        width: "100%",
                        maxWidth: 185,
                        maxHeight: 58,
                        objectFit: "contain",
                        objectPosition: "left center"
                    }}
                />

            </Toolbar>


            <Divider
                sx={{
                    borderColor: cores.borda
                }}
            />


            {/* ==================================================
                MENU
            ================================================== */}

            <List
                sx={{
                    p: 1.5,
                    flexGrow: 1
                }}
            >

                {/* =================================================
                    MENU PRINCIPAL
                ================================================= */}

                {menuItemsPermitidos.map(
                    (item) => {

                        const selecionado =
                            item.path === "/"
                                ? location.pathname === "/"
                                : location.pathname.startsWith(
                                    item.path
                                );


                        return (

                            <ListItemButton
                                key={item.path}
                                selected={selecionado}
                                onClick={() =>
                                    handleNavigation(
                                        item.path
                                    )
                                }
                                sx={{
                                    borderRadius: 2,
                                    mb: 0.6,
                                    minHeight: 46,

                                    color: selecionado
                                        ? cores.texto
                                        : cores.textoSecundario,

                                    position: "relative",

                                    "& .MuiListItemIcon-root": {
                                        color: selecionado
                                            ? cores.laranja
                                            : cores.textoSecundario,
                                        minWidth: 42
                                    },

                                    "&:hover": {
                                        backgroundColor:
                                            "rgba(255,122,0,0.08)",

                                        color: cores.texto,

                                        "& .MuiListItemIcon-root": {
                                            color: cores.laranja
                                        }
                                    },

                                    "&.Mui-selected": {
                                        backgroundColor:
                                            "rgba(255,122,0,0.13)",

                                        color: cores.texto,

                                        "& .MuiListItemIcon-root": {
                                            color: cores.laranja
                                        }
                                    },

                                    "&.Mui-selected::before": {
                                        content: '""',
                                        position: "absolute",
                                        left: 0,
                                        top: 8,
                                        bottom: 8,
                                        width: 3,
                                        borderRadius: 3,
                                        background:
                                            `linear-gradient(
                                                180deg,
                                                ${cores.laranja},
                                                ${cores.vermelho}
                                            )`
                                    }
                                }}
                            >

                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>


                                <ListItemText
                                    primary={
                                        item.label
                                    }
                                    primaryTypographyProps={{
                                        fontSize: 14,
                                        fontWeight:
                                            selecionado
                                                ? 600
                                                : 500
                                    }}
                                />

                            </ListItemButton>

                        );
                    }
                )}


                {/* =================================================
                    COMPRAS
                ================================================= */}

                {podeVisualizarCompras && (

                    <>

                        <ListItemButton
                            selected={
                                location.pathname.startsWith(
                                    "/compras"
                                )
                            }
                            onClick={
                                handleCompras
                            }
                            sx={{
                                borderRadius: 2,
                                mb: 0.6,
                                minHeight: 46,

                                color:
                                    location.pathname.startsWith(
                                        "/compras"
                                    )
                                        ? cores.texto
                                        : cores.textoSecundario,

                                "& .MuiListItemIcon-root": {
                                    color:
                                        location.pathname.startsWith(
                                            "/compras"
                                        )
                                            ? cores.laranja
                                            : cores.textoSecundario,
                                    minWidth: 42
                                },

                                "&:hover": {
                                    backgroundColor:
                                        "rgba(255,122,0,0.08)",

                                    color: cores.texto,

                                    "& .MuiListItemIcon-root": {
                                        color: cores.laranja
                                    }
                                },

                                "&.Mui-selected": {
                                    backgroundColor:
                                        "rgba(255,122,0,0.13)"
                                }
                            }}
                        >

                            <ListItemIcon>
                                <ShoppingCartOutlinedIcon />
                            </ListItemIcon>


                            <ListItemText
                                primary="Compras"
                                primaryTypographyProps={{
                                    fontSize: 14,
                                    fontWeight: 500
                                }}
                            />


                            {comprasAberto ? (

                                <ExpandLessIcon />

                            ) : (

                                <ExpandMoreIcon />

                            )}

                        </ListItemButton>


                        <Collapse
                            in={comprasAberto}
                            timeout="auto"
                            unmountOnExit
                        >

                            <List
                                component="div"
                                disablePadding
                            >

                                {/* =================================
                                    SOLICITAÇÕES
                                ================================= */}

                                <ListItemButton
                                    selected={
                                        location.pathname ===
                                        "/compras/solicitacoes"
                                    }
                                    onClick={() =>
                                        handleNavigation(
                                            "/compras/solicitacoes"
                                        )
                                    }
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        pl: 4,

                                        color: cores.textoSecundario,

                                        "& .MuiListItemIcon-root": {
                                            color: cores.textoSecundario,
                                            minWidth: 38
                                        },

                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(255,122,0,0.07)",

                                            color: cores.texto,

                                            "& .MuiListItemIcon-root": {
                                                color: cores.laranja
                                            }
                                        },

                                        "&.Mui-selected": {
                                            backgroundColor:
                                                "rgba(255,122,0,0.10)",

                                            color: cores.texto,

                                            "& .MuiListItemIcon-root": {
                                                color: cores.laranja
                                            }
                                        }
                                    }}
                                >

                                    <ListItemIcon>

                                        <RequestQuoteOutlinedIcon />

                                    </ListItemIcon>


                                    <ListItemText
                                        primary="Solicitações"
                                    />

                                </ListItemButton>


                                {/* =================================
                                    REALIZAR COMPRA
                                ================================= */}

                                <ListItemButton
                                    selected={
                                        location.pathname ===
                                        "/compras/realizar"
                                    }
                                    onClick={() =>
                                        handleNavigation(
                                            "/compras/realizar"
                                        )
                                    }
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        pl: 4,

                                        color: cores.textoSecundario,

                                        "& .MuiListItemIcon-root": {
                                            color: cores.textoSecundario,
                                            minWidth: 38
                                        },

                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(255,122,0,0.07)",

                                            color: cores.texto,

                                            "& .MuiListItemIcon-root": {
                                                color: cores.laranja
                                            }
                                        },

                                        "&.Mui-selected": {
                                            backgroundColor:
                                                "rgba(255,122,0,0.10)",

                                            color: cores.texto,

                                            "& .MuiListItemIcon-root": {
                                                color: cores.laranja
                                            }
                                        }
                                    }}
                                >

                                    <ListItemIcon>

                                        <AddShoppingCartOutlinedIcon />

                                    </ListItemIcon>


                                    <ListItemText
                                        primary="Realizar Compra"
                                    />

                                </ListItemButton>


                                {/* =================================
                                    RECEBER COMPRA
                                ================================= */}

                                <ListItemButton
                                    selected={
                                        location.pathname ===
                                        "/compras/receber"
                                    }
                                    onClick={() =>
                                        handleNavigation(
                                            "/compras/receber"
                                        )
                                    }
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        pl: 4,

                                        color: cores.textoSecundario,

                                        "& .MuiListItemIcon-root": {
                                            color: cores.textoSecundario,
                                            minWidth: 38
                                        },

                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(255,122,0,0.07)",

                                            color: cores.texto,

                                            "& .MuiListItemIcon-root": {
                                                color: cores.laranja
                                            }
                                        },

                                        "&.Mui-selected": {
                                            backgroundColor:
                                                "rgba(255,122,0,0.10)",

                                            color: cores.texto,

                                            "& .MuiListItemIcon-root": {
                                                color: cores.laranja
                                            }
                                        }
                                    }}
                                >

                                    <ListItemIcon>

                                        <Inventory2OutlinedIcon />

                                    </ListItemIcon>


                                    <ListItemText
                                        primary="Receber Compra"
                                    />

                                </ListItemButton>


                                {/* =================================
                                    FORNECEDORES
                                ================================= */}

                                <ListItemButton
                                    selected={
                                        location.pathname ===
                                        "/compras/fornecedores"
                                    }
                                    onClick={() =>
                                        handleNavigation(
                                            "/compras/fornecedores"
                                        )
                                    }
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        pl: 4,

                                        color: cores.textoSecundario,

                                        "& .MuiListItemIcon-root": {
                                            color: cores.textoSecundario,
                                            minWidth: 38
                                        },

                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(255,122,0,0.07)",

                                            color: cores.texto,

                                            "& .MuiListItemIcon-root": {
                                                color: cores.laranja
                                            }
                                        },

                                        "&.Mui-selected": {
                                            backgroundColor:
                                                "rgba(255,122,0,0.10)",

                                            color: cores.texto,

                                            "& .MuiListItemIcon-root": {
                                                color: cores.laranja
                                            }
                                        }
                                    }}
                                >

                                    <ListItemIcon>

                                        <StoreOutlinedIcon />

                                    </ListItemIcon>


                                    <ListItemText
                                        primary="Fornecedores"
                                    />

                                </ListItemButton>

                            </List>

                        </Collapse>

                    </>

                )}

            </List>


            {/* ==================================================
                IDENTIDADE NO RODAPÉ
            ================================================== */}

            <Box
                sx={{
                    px: 2,
                    py: 2,
                    borderTop:
                        `1px solid ${cores.borda}`
                }}
            >

                <Typography
                    variant="caption"
                    sx={{
                        color: cores.textoSecundario,
                        display: "block",
                        textAlign: "center",
                        fontSize: 11
                    }}
                >
                    ABSTOCK
                </Typography>

            </Box>

        </Box>
    );


    // ============================================================
    // LAYOUT
    // ============================================================

    return (

        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: cores.fundo
            }}
        >

            {/* ==================================================
                APP BAR
            ================================================== */}

            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: {
                        sm: `calc(100% - ${drawerWidth}px)`
                    },

                    ml: {
                        sm: `${drawerWidth}px`
                    },

                    backgroundColor:
                        cores.fundoSecundario,

                    borderBottom:
                        `1px solid ${cores.borda}`,

                    color: cores.texto,

                    backdropFilter: "blur(12px)"
                }}
            >

                <Toolbar
                    sx={{
                        minHeight: {
                            xs: 64,
                            sm: 70
                        }
                    }}
                >

                    {/* ==================================================
                        MENU MOBILE
                    ================================================== */}

                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() =>
                            setMobileOpen(
                                !mobileOpen
                            )
                        }
                        sx={{
                            mr: 2,
                            display: {
                                sm: "none"
                            },

                            "&:hover": {
                                color: cores.laranja
                            }
                        }}
                    >

                        <MenuIcon />

                    </IconButton>


                    {/* ==================================================
                        TITULO
                    ================================================== */}

                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            flexGrow: 1,
                            fontWeight: 600,
                            fontSize: {
                                xs: 17,
                                sm: 19
                            }
                        }}
                    >
                        Sistema de Controle
                    </Typography>


                    <IconButton color="inherit" onClick={() => setModoClaro((valor) => !valor)} aria-label={modoClaro ? "Ativar tema escuro" : "Ativar tema claro"} title={modoClaro ? "Tema escuro" : "Tema claro"} sx={{ mr: 1, color: cores.texto }}>
                        {modoClaro ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                    </IconButton>

                    {/* ==================================================
                        USUÁRIO
                    ================================================== */}

                    <IconButton
                        onClick={(event) =>
                            setAnchorEl(
                                event.currentTarget
                            )
                        }
                        sx={{
                            color: cores.texto
                        }}
                    >

                        <Avatar
                            sx={{
                                width: 38,
                                height: 38,

                                background:
                                    `linear-gradient(
                                        135deg,
                                        ${cores.laranja},
                                        ${cores.vermelho}
                                    )`,

                                color: "#fff",

                                fontWeight: 700,

                                boxShadow:
                                    "0 0 0 2px rgba(255,122,0,0.15)"
                            }}
                        >
                            {
                                usuario?.email
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                "U"
                            }
                        </Avatar>

                    </IconButton>


                    {/* ==================================================
                        MENU DO USUÁRIO
                    ================================================== */}

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() =>
                            setAnchorEl(null)
                        }
                        PaperProps={{
                            sx: {
                                backgroundColor:
                                    cores.card,

                                color: cores.texto,

                                border:
                                    `1px solid ${cores.borda}`,

                                mt: 1
                            }
                        }}
                    >

                        <MenuItem
                            disabled
                            sx={{
                                color:
                                    `${cores.textoSecundario} !important`
                            }}
                        >
                            {usuario?.email}
                        </MenuItem>


                        <Divider
                            sx={{
                                borderColor:
                                    cores.borda
                            }}
                        />


                        <MenuItem
                            onClick={
                                handleLogout
                            }
                            sx={{
                                "&:hover": {
                                    backgroundColor:
                                        "rgba(229,57,53,0.10)",

                                    color:
                                        cores.vermelho
                                }
                            }}
                        >
                            Sair
                        </MenuItem>

                    </Menu>

                </Toolbar>

            </AppBar>


            {/* ==================================================
                MENU LATERAL
            ================================================== */}

            <Box
                component="nav"
                sx={{
                    width: {
                        sm: drawerWidth
                    },

                    flexShrink: {
                        sm: 0
                    }
                }}
            >

                {/* ==================================================
                    MOBILE
                ================================================== */}

                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() =>
                        setMobileOpen(
                            false
                        )
                    }
                    ModalProps={{
                        keepMounted: true
                    }}
                    sx={{
                        display: {
                            xs: "block",
                            sm: "none"
                        },

                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box",
                            backgroundColor:
                                cores.drawer,
                            borderRight:
                                `1px solid ${cores.borda}`
                        }
                    }}
                >

                    {drawer}

                </Drawer>


                {/* ==================================================
                    DESKTOP
                ================================================== */}

                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: {
                            xs: "none",
                            sm: "block"
                        },

                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box",

                            backgroundColor:
                                cores.drawer,

                            borderRight:
                                `1px solid ${cores.borda}`
                        }
                    }}
                >

                    {drawer}

                </Drawer>

            </Box>


            {/* ==================================================
                CONTEÚDO
            ================================================== */}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,

                    width: {
                        sm: `calc(100% - ${drawerWidth}px)`
                    },

                    minWidth: 0,

                    minHeight: "100vh",

                    backgroundColor: cores.fundo,
                    color: cores.texto,
                    "& .MuiCard-root": { backgroundColor: cores.card, color: cores.texto, borderColor: cores.borda, borderRadius: 3 },
                    "& .MuiPaper-root": { backgroundColor: cores.card, color: cores.texto },
                    "& .MuiTypography-root": { color: "inherit" },
                    "& .MuiInputLabel-root": { color: cores.textoSecundario },
                    "& .MuiInputBase-root": { color: cores.texto, backgroundColor: "rgba(255,255,255,0.025)" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: cores.borda },
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,122,0,0.5)" },
                    "& .MuiButton-containedPrimary": { background: "linear-gradient(135deg, #ff7a00, #ff9b3d)", boxShadow: "0 8px 20px rgba(255,122,0,0.2)" },
                    "& .MuiDialog-paper": { margin: 12, borderRadius: 20, backgroundColor: cores.card, backgroundImage: "none" },
                    "& .MuiDialogTitle-root": { padding: "20px 24px 12px", fontWeight: 700 },
                    "& .MuiDialogContent-root": { padding: "12px 24px 20px" },
                    "& .MuiDialogActions-root": { padding: "12px 24px 20px", gap: 8 },
                    "& .MuiTableCell-root": { color: cores.texto, borderColor: cores.borda, py: 1, px: 1.5, fontSize: 13 },
                    "& table": { fontSize: 13 },
                    "& th": { color: cores.textoSecundario, fontWeight: 600, padding: "10px 12px", borderBottom: `1px solid ${cores.borda}` },
                    "& td": { padding: "10px 12px", borderBottom: `1px solid ${cores.borda}`, verticalAlign: "middle" },
                    p: {
                        xs: 2,
                        sm: 3
                    }
                }}
            >

                <Toolbar
                    sx={{
                        minHeight: {
                            xs: 64,
                            sm: 70
                        }
                    }}
                />

                <Outlet />

            </Box>

        </Box>
    );
}






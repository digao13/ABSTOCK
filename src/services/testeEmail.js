import {
    enviarEmailSolicitacaoCompra
} from "./emailService";

export async function testarEmail() {

    await enviarEmailSolicitacaoCompra({

        solicitacao_id:
            "TESTE-001",

        status:
            "pendente",

        produto:
            "PRODUTO DE TESTE",

        tipo:
            "existente",

        quantidade:
            2,

        valor_unitario:
            "R$ 100,00",

        valor_total:
            "R$ 200,00",

        fornecedor:
            "FORNECEDOR DE TESTE",

        compra_online:
            true,

        url_compra:
            "https://www.google.com",

        solicitante:
            "Teste ABSTOCK",

        observacao:
            "Este é um e-mail de teste do sistema ABSTOCK.",

        to_email:
            "rodrigo.silvadonascimento.long@gmail.com"
    });

    console.log(
        "TESTE DE E-MAIL CONCLUÍDO."
    );
}
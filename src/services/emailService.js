import emailjs from "@emailjs/browser";


const EMAILJS_SERVICE_ID =
    "service_cic8zka";


const EMAILJS_TEMPLATE_ID =
    "template_qt7vn6l";


const EMAILJS_PUBLIC_KEY =
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY;


/**
 * Envia e-mail através do EmailJS.
 *
 * @param {Object} dados
 * @param {string} dados.to_email
 * @param {string} [dados.produto]
 * @param {string|number} [dados.quantidade]
 * @param {string} [dados.solicitadoPor]
 * @param {string} [dados.observacao]
 * @param {string} [dados.tipoCompra]
 * @param {string} [dados.previsaoEntrega]
 * @param {string} [dados.fornecedor]
 * @param {number} [dados.valorUnitario]
 * @param {number} [dados.valorTotal]
 */

export async function enviarEmail(
    dados = {}
) {

    if (!dados.to_email) {

        throw new Error(
            "E-mail de destino não informado."
        );
    }


    if (!EMAILJS_PUBLIC_KEY) {

        throw new Error(
            "VITE_EMAILJS_PUBLIC_KEY não configurada."
        );
    }


    const parametros = {

        // =========================================
        // CAMPOS EXISTENTES
        // =========================================

        to_email:
            dados.to_email,

        produto:
            dados.produto || "",

        quantidade:
            dados.quantidade ?? "",

        solicitadoPor:
            dados.solicitadoPor || "",

        observacao:
            dados.observacao || "",


        // =========================================
        // NOVOS CAMPOS
        //
        // Eles são enviados para o EmailJS,
        // mas não precisam obrigatoriamente
        // aparecer no template.
        // =========================================

        tipoCompra:
            dados.tipoCompra || "",

        previsaoEntrega:
            dados.previsaoEntrega || "",

        fornecedor:
            dados.fornecedor || "",

        valorUnitario:
            dados.valorUnitario ?? "",

        valorTotal:
            dados.valorTotal ?? ""
    };


    console.log(
        "ENVIANDO E-MAIL:",
        parametros
    );


    try {

        const resposta =
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                parametros,
                {
                    publicKey:
                        EMAILJS_PUBLIC_KEY
                }
            );


        console.log(
            "E-MAIL ENVIADO COM SUCESSO:",
            resposta
        );


        return resposta;

    } catch (error) {

        console.error(
            "ERRO AO ENVIAR E-MAIL:",
            error
        );


        throw error;
    }
}


/**
 * Função utilizada apenas para teste.
 *
 * Mantida para compatibilidade com a Dashboard.
 */

export async function enviarEmailTeste(
    emailDestino
) {

    return enviarEmail({

        to_email:
            emailDestino

    });
}
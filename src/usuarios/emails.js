const nodemailer = require("nodemailer")

const configuracaoEmailPRD = {
    host: process.env.EMAIL_HOST,
    auth:{
        user: process.env.EMAIL_USUARIO,
        pass: process.env.EMAIL_SENHA
    },
    secure: true
};

const configuracaoEmailTeste = (contaTeste) => ({
    host: "smtp.ethereal.email",
    auth: contaTeste
});

async function criaConfiguraçãoEmail(){
    if(process.env.NODE_ENV === 'production'){
        return configuracaoEmailPRD
    } else{
        const contaTeste = await nodemailer.createTestAccount()  
      return configuracaoEmailTeste(contaTeste); 
    }
}

class Email {

    async enviarEmail() {
        const configuracaoEmail = await criaConfiguraçãoEmail()
        const transportador = nodemailer.createTransport(configuracaoEmail)
    
        const info = await transportador.sendMail(this);
        
        if(process.env.NODE_ENV !== "production"){
            console.log("URL: " + nodemailer.getTestMessageUrl(info));
        }
    }
    
}

class EmailVerificacao extends Email{
    constructor(usuario, endereco){
        super();
        this.from = '"Blog do Código" <noreply@blogdocodigo.com.br>';
        this.to = usuario.email;
        this.subject = "Verificação de e-mail";
        this.text = `Olá! Verifique seu e-mail aqui: ${endereco}`;
        this.html = `<h1>Olá!</h1> Verifique seu e-mail aqui: <a href="${endereco}">${endereco}</a>`;
    }
}

module.exports = { EmailVerificacao }
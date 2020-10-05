const passport = require("passport");
const Usuario = require("./usuarios-modelo");
const tokens = require("./tokens");

module.exports = {
    local: (req,res, next) => { 
        passport.authenticate("local", {session:false}, (erro, user, info)=>{
            if(erro && erro.name === "InvalidArgumentError"){
                return res.status(401).send({erro:"Usuário ou senha incorretos"});
            }

            if(erro){
                return res.status(500).json({erro: erro.message});
            }

            if(!user){
                return res.status(401).json()
            }
            
            req.user = user;
            return next();
            
        })(req,res, next)
    },

    bearer: (req, res, next) =>{
        passport.authenticate(
            "bearer",
            { session:false },
            (erro, user, info)=>{

                if(erro && erro.name === "JsonWebTokenError"){
                    return res.status(401).send({erro: erro.message})
                }

                if (erro && erro.name === 'TokenExpiredError') {
                    return res.status(401).json({ erro: erro.message, expiradoEm: erro.expiredAt });
                  }

                if(erro){
                    return res.status(500).send({erro: "Ops! Algo deu errado."})
                }

                if(!user){
                    return res.status(401).send();
                }
                req.token = info.token
                req.user = user;
                return next();
            }
        )(req,res,next);
    },

    async refresh(req,res,next){
        try{
            const { refreshToken } = req.body;
            const id = await tokens.refresh.verifica(refreshToken);
            await tokens.refresh.invalida(refreshToken);
            req.user = await Usuario.buscaPorId(id);
            return next();
        }catch(erro){
            if(erro.name === "InvalidArgumentError"){
                res.status(401).send({erro: erro.message});
            }else{
                res.status(500).send({erro: erro.message});
            }
        }
    }
}
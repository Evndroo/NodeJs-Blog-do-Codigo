const passport = require("passport");
const Usuatio = require("./usuarios-modelo");
const { InvalidArgumentError } = require("../erros")
const allowlistRefreshToken = require("../../redis/allowlist-refresh-token");

async function verificaRefreshToken(refreshToken){
    if(!refreshToken){
        throw new InvalidArgumentError("Refresh token não enviado!");
    }

    const id = await allowlistRefreshToken.buscaValor(refreshToken);

    if(!id){
        throw new InvalidArgumentError("Refresh Token inválido")
    }

    return id;
}

async function invalidaRefreshToken(refreshToken){
    await allowlistRefreshToken.deleta(refreshToken);
}


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
                    return res.send(401).send();
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
            const id = await verificaRefreshToken(refreshToken);
            await invalidaRefreshToken(refreshToken);
            req.user = await Usuatio.buscaPorId(id);
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
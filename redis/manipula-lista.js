const { promisify } = require("util")

module.exports = lista =>{

    const existsAsync = promisify(lista.exists).bind(lista);
    const setAsync = promisify(lista.set).bind(lista);
    const getAsync = promisify(lista.get).bind(lista);
    const delAsync = promisify(lista.del).bind(lista);

    return {
        async addToken(chave, valor, dataExpiracao){    
            await setAsync(chave, valor)
            lista.expireat(chave, dataExpiracao)
        },
    
        async contemChave(chave){
            const result = await existsAsync(chave)
            return result === 1
        },

        async buscaValor(chave){
            const valor = await  getAsync(chave)
            return valor;
        },

        async deleta(chave){
            await delAsync(chave);
        }

    }
}
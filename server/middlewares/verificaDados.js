const Battle = require('../models/Battle');

async function verificaDados() {
    try {
        const count = await Battle.countDocuments(); // Conta o número de documentos na coleção
        if (count > 0) {
            console.log(`Existem ${count} registros na base.`);
            return true; // Há dados
        } else {
            console.log('Nenhum registro encontrado.');
            return false; // Não há dados
        }
    } catch (error) {
        console.error('Erro ao verificar os registros:', error);
        return false; // Em caso de erro, retorna false
    }
}

module.exports = { verificaDados }

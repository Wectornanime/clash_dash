const Battle = require('../models/Battle');

async function verificaDados() {
    try {
        const count = await Battle.countDocuments(); // Conta o número de documentos na coleção
        if (count > 0) {
            console.log(`Existem ${count} usuários registrados.`);
            return true; // Há dados
        } else {
            console.log('Não há usuários registrados.');
            return false; // Não há dados
        }
    } catch (error) {
        console.error('Erro ao verificar usuários:', error);
        return false; // Em caso de erro, retorna false
    }
}

module.exports = { verificaDados }

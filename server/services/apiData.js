const axios = require('axios');
const Battle = require('../models/Battle');

// Função para salvar dados da API no MongoDB
async function saveBattlehData() {
	try {
		// Fazendo uma requisição à API
		const response = await axios.get(`${process.env.CLASH_API_URL}/players/%232RVQG28R2/battlelog`, {
			headers: {
				Authorization: `Bearer ${process.env.CLASH_API_TOKEN}`
			}
		});

		// Supondo que response.data contenha os dados das partidas
		const matches = response.data;

    console.log(matches)

		// Iterando sobre as partidas e salvando no MongoDB
		// for (let match of matches) {
		// 	const newMatch = new Match({
		// 		player1: match.player1,
		// 		player2: match.player2,
		// 		p1_crowns: match.p1_crowns,
		// 		p2_crowns: match.p2_crowns,
		// 		date: match.date // ou algum outro campo para data
		// 	});

		// 	await newMatch.save();
		// 	console.log(`Partida entre ${match.player1} e ${match.player2} salva com sucesso!`);
		// }
	} catch (error) {
		console.error('Erro ao salvar dados da API:', error);
	}
};

module.exports = {saveBattlehData}

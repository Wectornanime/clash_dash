import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Card from './components/card';

function App() {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/battleApi', { playerTag: inputValue });
      window.alert(response.data.message); // Supondo que a resposta tenha uma propriedade 'message'
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
      window.alert('Ocorreu um erro.');
    }
  };

  const cardData = [
    {
      title: "Porcentagem de derrota",
      apiUrl: "/api/porcentagem",
      inputs: [
        { name: "cardName", type: "text", placeholder: "Nome da carta" },
        { name: "startTime", type: "date", placeholder: "Inicio" },
        { name: "endTime", type: "date", placeholder: "Fim" }
      ],
    },
    {
      title: "Decks Completos",
      apiUrl: "/api/decksCompletos",
      inputs: [
        { name: "winRateThreshold", type: "number", placeholder: "Limite de vitoria" },
        { name: "startTime", type: "date", placeholder: "Inicio" },
        { name: "endTime", type: "date", placeholder: "Fim" }
      ],
    },
    {
      title: "Derrotas por Combo",
      apiUrl: "/api/calcularDerrotasPorCombo",
      inputs: [
        { name: "cartasCombo", type: "text", placeholder: "Carta" },
        { name: "startTime", type: "date", placeholder: "Inicio" },
        { name: "endTime", type: "date", placeholder: "Fim" }
      ],
    },
    {
      title: "Vitorias Com trofeus",
      apiUrl: "/api/calcularVitoriasCartaZTrof",
      inputs: [
        { name: "carta", type: "text", placeholder: "Carta" },
        { name: "percTrof", type: "number", placeholder: "% trofeus" },
        { name: "startTime", type: "date", placeholder: "Inicio" },
        { name: "endTime", type: "date", placeholder: "Fim" }
      ],
    },
    {
      title: "Combos Vitoriosos",
      apiUrl: "/api/listarCombosVitoriosos",
      inputs: [
        { name: "tamanhoCombo", type: "number", placeholder: "Tamanho do combo" },
        { name: "percentualVitorias", type: "number", placeholder: "% Vitorias" },
        { name: "startTime", type: "date", placeholder: "Inicio" },
        { name: "endTime", type: "date", placeholder: "Fim" }
      ],
    },
    {
      title: "Cartas mais Vitoriosas",
      apiUrl: "/api/listarCartasMaisFrequentesEmVitorias"
    },
    {
      title: "Cartas mais Derrotadas",
      apiUrl: "/api/rankingCartasMaisDerrotas",
      inputs: [
        { name: "startTime", type: "date", placeholder: "Inicio" },
        { name: "endTime", type: "date", placeholder: "Fim" }
      ],
    },
    {
      title: "Cartas Com Maiores Taxas de Vitoria",
      apiUrl: "/api/cartasComMaioresTaxasDeVitoria",
      inputs: [
        { name: "startTime", type: "date", placeholder: "Inicio" },
        { name: "endTime", type: "date", placeholder: "Fim" }
      ],
    },
  ];

  return (
    <div className="App">
      <header>
        <p>Importar dados: </p>
        <div className='import'>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder='Cod. do jogador'
            width={100}
          />
          <button onClick={handleSubmit}>Importar</button>
        </div>
      </header>
      <div className='dashboard'>
        {cardData.map((card, index) => (
          <Card key={index} apiUrl={card.apiUrl} title={card.title} inputs={card.inputs} />
        ))}
      </div>
    </div>
  );
}

export default App;

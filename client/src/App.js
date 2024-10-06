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
      title: "Card 2",
      apiUrl: "https://sua-api.com/endpoint2",
      inputs: [
        { name: "input1", type: "text", placeholder: "Título" },
        { name: "input2", type: "date", placeholder: "Data" },
        { name: "input3", type: "number", placeholder: "Quantidade" },
      ],
    },
    // Adicione mais cards conforme necessário
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

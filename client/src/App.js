import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

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
    </div>
  );
}

export default App;

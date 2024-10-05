import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <p>Importar dados: </p>
        <div className='import'>
          <input type='text' placeholder='Cod. do jogador' width={100} />
          <button>Importar</button>
        </div>
      </header>
    </div>
  );
}

export default App;

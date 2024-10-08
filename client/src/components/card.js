import './card.css';

import React, { useState } from 'react';
import axios from 'axios';

const Card = ({ apiUrl, title, inputs=null }) => {
    const [inputValues, setInputValues] = useState({});
    const [result, setResult] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputValues(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        console.log(inputValues)
        try {
            const response = await axios.get(apiUrl, inputValues);
            console.log(response.data)
            setResult(JSON.stringify(response.data, null, 2)); // Ajuste conforme a estrutura da resposta
        } catch (error) {
            console.error('Erro ao fazer a requisição:', error);
            setResult('Ocorreu um erro.');
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', margin: '10px' }}>
            <h3>{title}</h3>
            <div className='inputs'>
                {inputs && inputs.map((input, index) => (
                    <input
                        key={index}
                        type={input.type} // Tipo do input definido pela prop
                        name={input.name}
                        placeholder={input.placeholder}
                        onChange={handleInputChange}
                    />
                ))}
            </div>
            <button onClick={handleSubmit}>Enviar</button>
            <div>
                <h4>Resultado:</h4>
                <p>{result}</p>
            </div>
        </div>
    );
};

export default Card;

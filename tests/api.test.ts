// ProjectForSigla.test.ts
import { ProjectForSigla } from './apis';
import axios from 'axios';

jest.mock('axios');

describe('ProjectForSigla', () => {
  it('deve retornar os dados quando a requisição é bem-sucedida', async () => {
    const mockPayload = { key: 'value' };
    const mockResponseData = { success: true, data: 'mockData' };

    // Configura o mock do axios
    (axios.post as jest.Mock).mockResolvedValue({ data: mockResponseData });

    // Chama a função
    const result = await ProjectForSigla(mockPayload);

    // Verifica se o axios foi chamado com os argumentos corretos
    expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/projetos-sybase', mockPayload);

    // Verifica o resultado
    expect(result).toEqual(mockResponseData);
  });

  it('deve retornar um array vazio quando ocorre um erro na requisição', async () => {
    const mockPayload = { key: 'value' };

    // Configura o mock do axios para rejeitar a promessa
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

    // Chama a função
    const result = await ProjectForSigla(mockPayload);

    // Verifica se o axios foi chamado com os argumentos corretos
    expect(axios.post).toHaveBeenCalledWith('http://localhost:4000/projetos-sybase', mockPayload);

    // Verifica o resultado
    expect(result).toEqual([]);
  });
});

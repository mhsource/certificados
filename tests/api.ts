// ProjectForSigla.ts
import axios from 'axios';

const ProjectForSigla = async (payload: any) => {
  try {
    const response = await axios.post('http://localhost:4000/projetos-sybase', payload);
    return response.data;
  } catch (err) {
    console.log('Error', err);
    return [];
  }
};

export { ProjectForSigla };

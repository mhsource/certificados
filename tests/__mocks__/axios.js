// __mocks__/axios.js
const axiosMock = {
    create: jest.fn(() => axiosMock),
    request: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  };
  
  export default axiosMock;
  

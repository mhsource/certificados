const redis = require('redis');
const { promisify } = require('util');

// Configura o cliente Redis
const client = redis.createClient({
    host: 'localhost', // Altere se estiver em um servidor remoto
    port: 6379
});

// Promisifica o método 'get'
const getAsync = promisify(client.get).bind(client);

async function fetchAllKeysAndValues() {
    try {
        // Obtém todas as chaves
        const keys = await promisify(client.keys).bind(client)('*');
        
        if (keys.length === 0) {
            console.log('Nenhuma chave encontrada.');
            return;
        }

        // Obtém os valores correspondentes às chaves
        for (const key of keys) {
            const value = await getAsync(key);
            console.log(`Chave: ${key}, Valor: ${value}`);
        }
    } catch (err) {
        console.error('Erro:', err);
    } finally {
        // Encerra a conexão com o Redis
        client.quit();
    }
}

// Chama a função
fetchAllKeysAndValues();

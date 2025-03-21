// health-check.js
import http from 'http';
import https from 'https';
import { exec } from 'child_process';

// Configuración
const API_HOST = process.env.RAILWAY_STATIC_URL ? process.env.RAILWAY_STATIC_URL.replace(/^https?:\/\//, '') : 'localhost';
const API_PORT = process.env.RAILWAY_STATIC_URL ? 443 : 3002; // En Railway usamos HTTPS (puerto 443)
const API_PROTOCOL = process.env.RAILWAY_STATIC_URL ? 'https' : 'http';
const API_PATH = '/health';
const CHECK_INTERVAL = 5 * 60 * 1000; // Verificar cada 5 minutos (en milisegundos)
const TIMEOUT = 10000; // Tiempo de espera para la respuesta (10 segundos)
const MAX_RETRIES = 3; // Número máximo de intentos antes de reiniciar

let failedAttempts = 0;

// Función para verificar la salud de la API
function checkAPIHealth() {
  console.log(`[${new Date().toISOString()}] Verificando salud de la API...`);
  console.log(`[${new Date().toISOString()}] Intentando conectar a: ${API_PROTOCOL}://${API_HOST}${API_PORT !== 443 ? ':' + API_PORT : ''}${API_PATH}`);
  
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: API_PATH,
    method: 'GET',
    timeout: TIMEOUT,
    ...(API_PROTOCOL === 'https' && { rejectUnauthorized: false })
  };

  const requester = API_PROTOCOL === 'https' ? https : http;

  const req = requester.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`[${new Date().toISOString()}] API funcionando correctamente (Status: ${res.statusCode})`);
        failedAttempts = 0; // Reiniciar contador de intentos fallidos
      } else {
        handleFailure(`API respondió con código de estado: ${res.statusCode}`);
      }
    });
  });
  
  req.on('error', (error) => {
    handleFailure(`Error al conectar con la API: ${error.message}`);
  });
  
  req.on('timeout', () => {
    req.destroy();
    handleFailure('Tiempo de espera agotado al intentar conectar con la API');
  });
  
  req.end();
}

// Manejar fallos en la verificación
function handleFailure(reason) {
  failedAttempts++;
  console.error(`[${new Date().toISOString()}] Fallo #${failedAttempts}: ${reason}`);
  
  if (failedAttempts >= MAX_RETRIES) {
    console.error(`[${new Date().toISOString()}] Se alcanzó el número máximo de intentos fallidos. Reiniciando la API...`);
    restartAPI();
    failedAttempts = 0; // Reiniciar contador después de intentar reiniciar
  }
}

// Función para reiniciar la API usando PM2
function restartAPI() {
  console.log(`[${new Date().toISOString()}] Ejecutando reinicio de la API con PM2...`);
  
  exec('pm2 restart api-ws', (error, stdout, stderr) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] Error al reiniciar la API: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`[${new Date().toISOString()}] Error en la salida de PM2: ${stderr}`);
      return;
    }
    
    console.log(`[${new Date().toISOString()}] API reiniciada correctamente: ${stdout}`);
  });
}

// Iniciar verificación periódica
console.log(`[${new Date().toISOString()}] Iniciando monitoreo de salud de la API...`);
console.log(`[${new Date().toISOString()}] Para acceder al código QR, visita: ${API_PROTOCOL}://${API_HOST}${API_PORT !== 443 ? ':' + API_PORT : ''}/qr`);
console.log(`[${new Date().toISOString()}] Para verificar la salud de la API: ${API_PROTOCOL}://${API_HOST}${API_PORT !== 443 ? ':' + API_PORT : ''}${API_PATH}`);

// Iniciar monitoreo
checkAPIHealth(); // Verificar inmediatamente al iniciar
setInterval(checkAPIHealth, CHECK_INTERVAL); // Programar verificaciones periódicas

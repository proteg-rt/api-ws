import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from  '@bot-whatsapp/bot'
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys'


const flowBienvenida = addKeyword('hola').addAnswer('Buenas !! Bienvenido')




const main = async () => {

    const provider = createProvider(BaileysProvider)

    provider.initHttpServer(3002)

    provider.http.server.post('/send-message', handleCtx( async (bot, req, res) => {
        const body = req.body
        const message = body.message
        const mediaUrl = body.mediaUrl
        const phone = req.body.phone

        await bot.sendMessage(phone, message, {
            media: mediaUrl
        })
        res.end('Mensaje enviado con exito!')
    }))
    
    // Endpoint para verificación de salud
    provider.http.server.get('/health', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'api-ws',
            uptime: process.uptime()
        }));
        
        // Señal para PM2 de que la aplicación está lista
        if (process.send) {
            process.send('ready');
        }
    });
    
    // Redirigir la ruta raíz a la página del QR
    provider.http.server.get('/', (req, res) => {
        res.writeHead(302, { 'Location': '/qr' });
        res.end();
    });
    
    // Mensaje informativo sobre las rutas disponibles
    console.log('Servidor iniciado en el puerto 3002');
    console.log('- Para ver el código QR, visita: http://localhost:3002/qr');
    console.log('- Para verificar la salud de la API: http://localhost:3002/health');
    console.log('- Para enviar mensajes: POST a http://localhost:3002/send-message');

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider
    })
}

main()
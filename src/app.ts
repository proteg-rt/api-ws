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
    
    

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider
    })
}

main()
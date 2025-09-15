/*
* Pembuat: Rizki
* Youtube: @RizzKyxF
* Source: https://github.com/Ikiwibu6/Base-Bot-Whatsapp
*/
require("./setting")

const { default:
    makeWASocket,
    DisconnectReason,
    makeInMemoryStore,
    jidDecode,
    useMultiFileAuthState,
    proto
} = require("@whiskeysockets/baileys");
const { resolve } = require("path");
const Boom = require("@hapi/boom");
const Pino = require("pino");
const chalk = require("chalk");
const readline = require("readline");
const { getBuffer, smsg } = require("./lib/function");
const fs = require("fs");

usePairingCode = true; //Apakah Anda Ingin Menggunakan Pairing Code, Jika True Maka Menggunakan, Jika False Maka Tidak Menggunakan.

//============================//
const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin, output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, resolve)
    });
}

//===========================//
const store = makeInMemoryStore({ logger: Pino().child({ level: 'silent', stream: 'store' }) })
//============================//

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(`${global.session}`)
    const sock = makeWASocket({
        logger: Pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        version: [2, 3000, 1015901307],
        browser: ["Ubuntu", "Chrome", "20.0.0"]
    });
    if (usePairingCode && !sock.authState.creds.registered) {
        const phoneNumber = await question('Please Enter Your Number:\n');
        const code = await sock.requestPairingCode(phoneNumber, `${global.code}`);
        console.log(chalk.red(`Your Pairing Code: ${code}`));
    };
    store.bind(sock.ev);
    //========================================//
    sock.public = true
    //=======================================//
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output.statusCode;
            console.log(lastDisconnect.error);
            if (lastDisconnect.error == 'Error: Stream Errored (unknown)') {
                process.exit();
            } else if (reason === DisconnectReason.badSession) {
                console.warn(`Bad Session File, Please Delete Session and Scan Again`);
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.warn('Connection closed, reconnecting...');
                process.exit();
            } else if (reason === DisconnectReason.connectionLost) {
                console.warn('Connection lost, trying to reconnect');
                process.exit();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.warn('Connection Replaced, Another New Session Opened, Please Close Current Session First');
                sock.logout();
            } else if (reason === DisconnectReason.loggedOut) {
                console.warn(`Device Logged Out, Please Scan Again And Run.`);
                sock.logout();
            } else if (reason === DisconnectReason.restartRequired) {
                console.warn('Restart Required, Restarting...');
                await startBot();
            } else if (reason === DisconnectReason.timedOut) {
                console.warn('Connection TimedOut, Reconnecting...');
                startBot();
            }
        } else if (connection === "connecting") {
            console.warn('Restart . . . ');
        } else if (connection === "open") {
            console.warn('Connection Is Enable');
        }
    });

    //=============================//
    sock.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = sock.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
        }
    });
    //============================//
    sock.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }
    //============================//
    sock.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.?\/.?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
        buffer = await writeExifImg(buff, options)
        } else {
        buffer = await imageToWebp(buff)
        }
        
        await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
        }
        
    //============================//

    sock.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    //=================================================//
    sock.ev.on('messages.upsert', async chatUpdate => {
        try {
            let mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return
            if (!sock.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            let m = smsg(sock, mek, store)
            require("./system/case")(sock, m, chatUpdate, mek, store)
        } catch (err) {
            console.error(err);
        }
    })
    //====================================//
    sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        let trueFileName = attachExtension ? ('./sticker/' + filename + '.' + type.ext) : './sticker/' + filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
        }
    //====================================//
    sock.ev.on("creds.update", saveCreds);
    //===================================//
}

startBot();

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(`Update ${__filename}`)
    delete require.cache[file]
    require(file)
})


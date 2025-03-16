/*
YouTube: @RizzKyxF
Pembuat: RizzCode Rizki
Source: https://github.com/Ikiwibu6/Base-Bot-Whatsapp
*/


const fs = require('fs');
const util = require("util");
const moment = require("moment-timezone");
const { isUrl, getBuffer, sleep, smsg } = require("../lib/function")
const { generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys")
const axios = require("axios");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = sock = async (sock, m, chatUpdate, store) => {
    try {
        const body = (
            m.mtype === "conversation" ? m.message.conversation :
                m.mtype === "imageMessage" ? m.message.imageMessage.caption :
                    m.mtype === "videoMessage" ? m.message.videoMessage.caption :
                        m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
                            m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
                                m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                                    m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
                                        m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id : m.mtype === "templateButtonReplyMessage" ? m.msg.selectedId :
                                            m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text : ""
        );
        const sender = m.key.fromMe ? sock.user.id.split(":")[0] + "@s.whatsapp.net" || sock.user.id : m.key.participant || m.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        const budy = (typeof m.text === 'string' ? m.text : '');
        const prefa = ["", "!", ".", ",", "🐤", "🗿"];
        const prefix = /^[°zZ#$@+,.?=''():√%!¢£¥€π¤ΠΦ&><™©®Δ^βα¦|/\\©^]/.test(body) ? body.match(/^[°zZ#$@+,.?=''():√%¢£¥€π¤ΠΦ&><!™©®Δ^βα¦|/\\©^]/gi) : '.';
        const from = m.key.remoteJid;
        const isCreator = m.sender == owner + "@s.whatsapp.net" ? true : m.fromMe ? true : false
        const isGroup = from.endsWith("@g.us");
        const kontributor = JSON.parse(fs.readFileSync('./database/owner.json'));

        const botNumber = await sock.decodeJid(sock.user.id);
        const Access = [botNumber, ...kontributor, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
        const isCmd = body.startsWith(prefix);
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const pushname = m.pushName || "No Name";
        const text = q = args.join(" ");
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const qmsg = (quoted.msg || quoted);
        const isMedia = /image|video|sticker|audio/.test(mime);

        const groupMetadata = isGroup ? await sock.groupMetadata(m.chat).catch((e) => { }) : "";
        const groupOwner = isGroup ? groupMetadata.owner : "";
        const groupName = m.isGroup ? groupMetadata.subject : "";
        const participants = isGroup ? await groupMetadata.participants : "";
        const groupAdmins = isGroup ? await participants.filter((v) => v.admin !== null).map((v) => v.id) : "";
        const groupMembers = isGroup ? groupMetadata.participants : "";
        const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
        const isBotGroupAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
        const isAdmins = isGroup ? groupAdmins.includes(m.sender) : false;

        const time = moment.tz("Asia/Makassar").format("HH:mm:ss");

        if (m.message) {
            console.log('------------------------');
            console.log('▢ Pesan Baru');
            console.log(
                `   ⌬ Tanggal: ${new Date().toLocaleString()} \n` +
                `   ⌬ Pesan: ${m.body || m.mtype} \n` +
                `   ⌬ Pengirim: ${pushname} \n` +
                `   ⌬ JID: ${senderNumber}`
            );

            if (m.isGroup) {
                console.log(
                    `   ⌬ Grup: ${groupName} \n` +
                    `   ⌬ Tanggal: ${new Date().toLocaleString()} \n` +
                    `   ⌬ GroupJid: ${m.chat}` 
                );
            }

            console.log();
        }
        // === [ Switch Case ] === \\
        switch (command) {

            case "menu": {
                sock.sendMessage(m.chat, {
                    location: {
                        degreesLatitude: -6.2088, // Ganti dengan latitude lokasi
                        degreesLongitude: 106.8456, // Ganti dengan longitude lokasi
                    },
                    caption: "Ini Base, Nanti Nunggu Update",
                    footer: "Rizki Dev",
                    buttons: [
                        {
                            buttonId: `🚀`,
                            buttonText: {
                                displayText: '🗿'
                            },
                            type: 1
                        }
                    ], // isi buttons nya
                    headerType: 6,
                    viewOnce: true
                }, { quoted: m });
            }
                break
                case "neko": {
                    m.reply("`Mohon Tunggu Sebentar. . .`");
                    const { data } = await axios.get(`https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/anime/neko.txt`);
                    const urls = data.split('\n');
                    const anunya = urls[Math.floor(Math.random() * urls.length)];
                    try {
                        sock.sendMessage(m.chat, {
                            image: { url: anunya },
                            caption: '`Sudah Selesai`'
                        })
                    } catch (e) {
                        console.log(e);
                        m.reply("Error", e)
                    }
                }
                break;
                case "k":{
                    if(!text) return m.reply('Masukan Query');
                    m.reply(mess.wait);
                    let anu = `https://api.diioffc.web.id/api/search/ytplay?query=${text}`;
                    const res = await fetch(anu);
                    const response = await res.json();
                    sock.sendMessage(m.chat, {
                        audio: { url: response.result.download.url },
                        fileName: `audio.mp3`,
                        ptt: true
                    })
                }
                break
                case "pinterest":
                case "pin": {
                    if(!text) return m.reply("Masukan Query");
                    m.reply(mess.wait);
                    let anu = `https://api.siputzx.my.id/api/s/pinterest?query=${text}`;
                    const res = await fetch(anu);
                    const response = await res.json();
                    try {
                        sock.sendMessage(m.chat, {
                            image: { url: response.data[0].images_url },
                            caption: "`Done Cuyh`"
                        }, { quoted: m });
                    } catch (err) {
                        console.log(err);
                        m.reply("Error", e)
                    }
                }
                break;
                case "self": {
                    if(!isCreator) m.reply(mess.owner);
                    sock.public = false
                    m.reply('`Sudah`')
                }
                break;
                case "public": {
                    if(!isCreator) m.reply(mess.owner);
                    sock.public = true
                    m.reply('`Sudah`')
                }
                break;
                case "brat": {
                    if (!text) return m.reply(`Masukan Teks\n\nExample: ${prefix + command} rizki`)
                    sock.sendMessage(m.chat, {sticker: {url: "https://api.siputzx.my.id/api/m/brat?text="+text}})
                    }
                    break;

            default:
                if (budy.startsWith('>')) {
                    if (!Access) return;
                    try {
                        let evaled = await eval(budy.slice(2));
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                        await m.reply(evaled);
                    } catch (err) {
                        m.reply(String(err));
                    }
                }

                if (budy.startsWith('<')) {
                    if (!Access) return
                    let kode = budy.trim().split(/ +/)[0]
                    let teks
                    try {
                        teks = await eval(`(async () => { ${kode == ">>" ? "return" : ""} ${q}})()`)
                    } catch (e) {
                        teks = e
                    } finally {
                        await m.reply(require('util').format(teks))
                    }
                }

                if (budy.startsWith('-')) {
                    if (!Access) return
                    if (text == "rm -rf *") return m.reply("😹")
                    exec(budy.slice(2), (err, stdout) => {
                        if (err) return m.reply(`${err}`)
                        if (stdout) return m.reply(stdout)
                    })
                }

        }
    } catch (err) {
        console.log(require("util").format(err));
    }
};

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file);
    console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
    delete require.cache[file];
    require(file);
});

const fs = require("fs");

// === [ SYSTEM ] === \\
global.code = "RIZZCODE"

// === [ Session ] === \\
global.session = 'session'


// ==== [ Settings ] ==== \\
global.owner = "6287794585528"
global.creator = "RizzCode"
global.botNumber = "6287794585528"
global.botName = "Base Bot"

// === [ Thumbnail ] === \\
global.thumbnail = "https://tse2.mm.bing.net/th?id=OIP.NvH77ZuMaOfGjBcypbkMJwHaEK&pid=Api&P=0&h=180"


global.mess = {
    wait: "Tunggu Sebentar...",
    owner: "Anu, Khusus Owner Inimah"
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(`Update ${__filename}`)
    delete require.cache[file]
    require(file)

})

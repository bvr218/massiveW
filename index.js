/*****************************************************
 * created by BVR218
 * 21/11/2022
 * bravaro2016@gmail.com
 * created for Alejadro
 */

const fs = require('fs');
const express = require('express');
const webApp = express();
var QRCode = require('qrcode')
const XLSX = require('xlsx');

var estado = "disconected";


const { Client, LocalAuth, Buttons, MessageMedia } = require('whatsapp-web.js');
const { Console } = require('console');
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "client-cartera" }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--unhandled-rejections=strict'] }
});


const PORT = process.env.PORT || 1004;
const PAISES = JSON.parse(fs.readFileSync(__dirname + '/countri.json'));
var server = webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});
const io = require('socket.io')(server, {
    allowEIO3: true,
    perMessageDeflate: false
});
var router = express.Router();
webApp.use(router);
webApp.set('socketio', io);
// Webapp settings
webApp.use(express.urlencoded({
    extended: true
}));
webApp.use(express.json());





webApp.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});
webApp.get('//add.js', (req, res) => {
    res.sendFile(`${__dirname}/add.js`);
});
webApp.get('//background', (req, res) => {
    res.sendFile(`${__dirname}/imagen.jpg`);
});
webApp.get('//logo', (req, res) => {
    res.sendFile(`${__dirname}/directorio-telefonico.png`);
});
webApp.get('//file', (req, res) => {
    res.sendFile(`${__dirname}/contactos.vcf`);
});


io.on("connection", function (socket) {
    console.log("conected socket " + socket.id);

    socket.on('paises', function () {
        io.emit("paises", PAISES);
    });

    socket.on('fileImg', function (data) {
        fs.writeFile("/var/www/html/wallapos/imagenBase64", data, (err) => {
            if (err)
                return "error";
            else
                io.emit("fileReady", "/wallapos/imagenBase64");
        });
    });
    socket.on('fileFile', function (data) {
        fs.writeFile("/var/www/html/wallapos/contactosBase64", data, "utf8", (err) => {
            if (err)
                return "error";
            else
                io.emit("fileCReady", "/wallapos/contactos.xlsx");
        });
    });

    socket.on('estado', function () {
        io.emit("estado", estado);
    });

    socket.on('generar', async function (data) {
        let salida = await generateFile(data);
        if (salida == "error") {
            socket.emit("error", "");
        } else {
            socket.emit("download", "");
        }
    });
    client.on('qr', (qr) => {
        QRCode.toDataURL(qr, function (err, url) {
            io.emit("qr", url);
            estado = 'disconected';
        })

    });

    client.on('ready', () => {
        io.emit("ready", "");
        estado = 'conected';
    });

    client.on('auth_failure', () => {
        io.emit("auth_failure", "");
        estado = 'disconected';

    });

    client.on('authenticated', () => {
        io.emit("autenticated", "");
        estado = 'conected';
    });


});

async function generateFile(data) {
    let salida = "";
    let index = 0;
    let total = 0;
    fs.writeFile(__dirname +"/contactos.vcf", salida, (err) => {
        if (err)
            return "error";

    });
    if (data.wsp) {
        if (data.fileC) {
            let archivo;
            try {
                archivo = fs.readFileSync(__dirname +'/contactosBase64', "utf8");
                baseAuth = archivo.split(",");
                let mimeType = archivo.split(";")[0].split(":")[1];
                if (mimeType == "text/x-vcard" || mimeType == "text/vcard") {

                    archivo = Buffer.from(baseAuth[1], 'base64').toString('ascii');
                    archivo = archivo.split("BEGIN:VCARD");
                    //archivo = archivo.shift();
                    let total = archivo.length;
                    let index = 0;
                    archivo.forEach(async element => {
                        if (element != "") {
                            element = element.split("\n");
                            let nombre = element[3].replace("FN:", "");
                            let numero = element[4].replace("TEL;CELL:", "");
                            io.emit("porcentaje", (index / total) * 100);
                            index++;
                            let datos = await client.isRegisteredUser(numero);
                            //let datos = true;

                            if (datos) {

                                //send mensajes
                                if (data.msg) {
                                    data.msgT = data.msgT.replace("{nombre_cliente}", nombre);
                                    let i = numero.replace("+", "") + "@c.us";

                                    if (data.btn) {
                                        if (data.img) {
                                            let Buffer = fs.readFileSync(__dirname + '/imagenBase64');
                                            let dataB64 = Buffer.toString();
                                            let mimeType = dataB64.split(";")[0].split(":")[1];
                                            dataB64 = dataB64.split(";")[1].split(",")[1];
                                            let menssageM = new MessageMedia(mimeType, dataB64);

                                            const buttons_reply_url = new Buttons(menssageM, [{ body: "Ir a url", url: data.linkBoton }], 'title', 'En Fututel queremos crear una alianza con todos los negocios de Pitalito para brindarles todo tipo de publicidad a través de nuestras redes sociales, mensajes de textos y vía Whatsapp. Si tienes un negocio y quieres ser parte de esta gran alianza has click en el boton') // Reply button with URL

                                            client.sendMessage(i, buttons_reply_url, { "caption": data.msgT });


                                        } else {
                                            let button = new Buttons(menssageM, [{ body: 'Ir a url', url: data.linkBoton }], 'title', 'En Fututel queremos crear una alianza con todos los negocios de Pitalito para brindarles todo tipo de publicidad a través de nuestras redes sociales, mensajes de textos y vía Whatsapp. Si tienes un negocio y quieres ser parte de esta gran alianza has click en el boton');
                                            client.sendMessage(i, button, { "caption": data.msgT });
                                        }
                                    } else {
                                        if (data.img) {
                                            let Buffer = fs.readFileSync(__dirname + '/imagenBase64');
                                            let dataB64 = Buffer.toString();
                                            let mimeType = dataB64.split(";")[0].split(":")[1];
                                            dataB64 = dataB64.split(";")[1].split(",")[1];
                                            let menssageM = new MessageMedia(mimeType, dataB64);
                                            await client.sendMessage(i, data.msgT, { "media": menssageM });
                                            //client.sendMessage(parseInt(data.pais, 10) + "" + i + "@c.us", );
                                        } else {
                                            client.sendMessage(i, data.msgT);
                                        }

                                    }
                                }
                            }
                        }
                    });
                } else {
                    await fs.writeFileSync(__dirname +"/salida.xlsx", baseAuth[1], "base64");
                    var file = XLSX.readFile(__dirname +'/salida.xlsx');
                    let dataa = []

                    const sheets = file.SheetNames

                    for (let i = 0; i < sheets.length; i++) {
                        const temp = XLSX.utils.sheet_to_json(
                            file.Sheets[file.SheetNames[i]])
                        temp.forEach((res) => {
                            dataa.push(res)
                        })
                    }
                    let total = data.length;
                    let index = 0;
                    dataa.forEach(async element => {
                        let nombre;
                        let movil;
                        io.emit("porcentaje", (index / total) * 100);
                        index++;
                        if (element.nombre == null) {
                            if (element.Nombre == null) {

                            } else {
                                nombre = element.Nombre;
                            }
                        } else {
                            nombre = element.Nombre;
                        }

                        if (element.movil == null) {
                            if (element.Movil == null) {

                            } else {
                                movil = element.Movil;
                            }
                        } else {
                            movil = element.movil;
                        }
                        numero  = data.pais+parseInt(movil).toString().substr(0,10);
                        
                        let datos = await client.isRegisteredUser(numero);
                        //let datos = true;
                        
                        if (datos) {

                            //send mensajes
                            if (data.msg) {
                                data.msgT = data.msgT.replace("{nombre_cliente}", nombre);
                                let i = numero.replace("+", "") + "@c.us";

                                if (data.btn) {
                                    if (data.img) {
                                        let Buffer = fs.readFileSync(__dirname + '/imagenBase64');
                                        let dataB64 = Buffer.toString();
                                        let mimeType = dataB64.split(";")[0].split(":")[1];
                                        dataB64 = dataB64.split(";")[1].split(",")[1];
                                        let menssageM = new MessageMedia(mimeType, dataB64);

                                        const buttons_reply_url = new Buttons(menssageM, [{ body: "Ir a url", url: data.linkBoton }], 'title', 'En Fututel queremos crear una alianza con todos los negocios de Pitalito para brindarles todo tipo de publicidad a través de nuestras redes sociales, mensajes de textos y vía Whatsapp. Si tienes un negocio y quieres ser parte de esta gran alianza has click en el boton') // Reply button with URL

                                        client.sendMessage(i, buttons_reply_url, { "caption": data.msgT });


                                    } else {
                                        let button = new Buttons(menssageM, [{ body: 'Ir a url', url: data.linkBoton }], 'title', 'En Fututel queremos crear una alianza con todos los negocios de Pitalito para brindarles todo tipo de publicidad a través de nuestras redes sociales, mensajes de textos y vía Whatsapp. Si tienes un negocio y quieres ser parte de esta gran alianza has click en el boton');
                                        client.sendMessage(i, button, { "caption": data.msgT });
                                    }
                                } else {
                                    if (data.img) {
                                        let Buffer = fs.readFileSync(__dirname + '/imagenBase64');
                                        let dataB64 = Buffer.toString();
                                        let mimeType = dataB64.split(";")[0].split(":")[1];
                                        dataB64 = dataB64.split(";")[1].split(",")[1];
                                        let menssageM = new MessageMedia(mimeType, dataB64);
                                        await client.sendMessage(i, data.msgT, { "media": menssageM });
                                        //client.sendMessage(parseInt(data.pais, 10) + "" + i + "@c.us", );
                                    } else {
                                        client.sendMessage(i, data.msgT);
                                    }

                                }
                            }
                        }
                        
                    });
                }
            } catch (error) {
                console.log(error);
            }

        } else {

            for (let i = data.desde; i <= data.hasta; i++) {
                total = data.hasta - data.desde;
                io.emit("porcentaje", (index / total) * 100);
                index++;
                let datos = await client.isRegisteredUser(data.pais + "" + i);
                //let datos = true;

                if (datos) {

                    //send mensajes
                    if (data.msg) {

                        if (data.btn) {
                            if (data.img) {
                                let Buffer = fs.readFileSync(__dirname + '/imagenBase64');
                                let dataB64 = Buffer.toString();
                                let mimeType = dataB64.split(";")[0].split(":")[1];
                                dataB64 = dataB64.split(";")[1].split(",")[1];
                                let menssageM = new MessageMedia(mimeType, dataB64);

                                const buttons_reply_url = new Buttons(menssageM, [{ body: 'Test', id: 'test-1' }, { body: "Test 2", url: "https://wwebjs.dev" }], 'title', 'footer') // Reply button with URL

                                client.sendMessage(parseInt(data.pais, 10) + "" + i + "@c.us", buttons_reply_url, { "caption": data.msgT });


                            } else {
                                let button = new Buttons('Button body', { body: 'bt1' }, 'title', 'footer');
                                client.sendMessage(parseInt(data.pais, 10) + "" + i + "@c.us", button);
                            }
                        } else {
                            if (data.img) {
                                let Buffer = fs.readFileSync(__dirname + '/imagenBase64');
                                let dataB64 = Buffer.toString();
                                let mimeType = dataB64.split(";")[0].split(":")[1];
                                dataB64 = dataB64.split(";")[1].split(",")[1];
                                let menssageM = new MessageMedia(mimeType, dataB64);
                                await client.sendMessage(parseInt(data.pais, 10) + "" + i + "@c.us", data.msgT, { "media": menssageM });
                                //client.sendMessage(parseInt(data.pais, 10) + "" + i + "@c.us", );
                            } else {
                                client.sendMessage(parseInt(data.pais, 10) + "" + i + "@c.us", data.msgT);
                            }

                        }
                    }

                    //crear archivo
                    salida =
                        `BEGIN:VCARD
VERSION:2.1
N:;Contacto ${index};;;
FN:Contacto ${index}
TEL;CELL:${data.pais}${i}
END:VCARD
`;
                    fs.appendFile(__dirname +'/contactos.vcf', salida, function (err) {
                        if (err) return "error";
                    });
                }



            }
        }


    } else {
        for (let i = data.desde; i <= data.hasta; i++) {
            total = data.hasta - data.desde;
            io.emit("porcentaje", (index / total) * 100);
            index++;
            salida =
                `BEGIN:VCARD
VERSION:2.1
N:;Contacto ${index};;;
FN:Contacto ${index}
TEL;CELL:${data.pais}${i}
END:VCARD
    `;


            fs.appendFile(__dirname +'/contactos.vcf', salida, function (err) {
                if (err) return "error";
            });
        }




    }
    return "exito";

}
client.initialize();



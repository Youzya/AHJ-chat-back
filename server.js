const Koa = require('koa');
const BodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const cors = require('@koa/cors');
const ArrayBufferConverter = require('./arrayBufferConverter')
const formatDate = require('./formatDate');
const WS = require('ws');


const app = new Koa();
const router = new Router();

app.use(BodyParser());
app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());


router.get('/', async(ctx, next) => {
    ctx.body = 'connected';
});

const server = app.listen(7070, () => {
    console.log('server listening on port 7070');
});

const wsServer = new WS.Server({server});

const nicknames = [];
const chat = [];

wsServer.on('connection', (ws) => {
    ws.on('message', (msg) => {
        let buffer = new ArrayBufferConverter(msg);
        let data = JSON.parse(buffer.toString());
        let { nickname, message, status} = data;
        if (nickname && !status) {
            let nicknameValid = nicknames.some(el => el === nickname);
            if (nicknameValid === false) {
                nicknames.push(nickname);
            }
        }

        if (nickname && message) {
            chat.push({
                nickname: nickname,
                message: message,
                time: formatDate(Date.now()),
            });
        }

        if (nickname && status === false) {
            let index = nicknames.indexOf(nickname);
            if (index !== -1) {nicknames.splice(index, 1);}
        }

        const nicknamesData = JSON.stringify({nicknames});
        
        [...wsServer.clients]
            .filter(client => client.readyState === WS.OPEN)
            .forEach(client => client.send(nicknamesData));

        const chatData = JSON.stringify({chat});

        [...wsServer.clients]
            .filter(client => client.readyState === WS.OPEN)
            .forEach(client => client.send(chatData));

        ws.send(JSON.stringify({nicknames}));
        ws.send(JSON.stringify({chat}));
    });

    ws.send(JSON.stringify({nicknames}));
    ws.send(JSON.stringify({chat}));
})

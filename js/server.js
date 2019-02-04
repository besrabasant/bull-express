"use strict";
const express = require(`express`);
const url = require('url');
const Arena = require('bull-arena');
const {
	queues,
	NOTIFY_URL
} = require('./queues');
const server = require(`http`).createServer();
const {
	db
} = require('./db');
const port = process.env.PORT || 3000;

function getRedisConfig(redisUrl) {
	return {
		host: 'vhmcdbfpdb.mcd.rot.hec.sap.biz',
		port: 6379
	};
}
const app = express();
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({
	extended: true
})); // to support URL-encoded bodies
//const router = require('./router')(app,server);

app.post('/webhooks', async(req, res, next) => {
	const {
		payload,
		urls
	} = req.body;
	try {
		const id = await db.setWebhook(payload, urls);
		return res.json({
			id
		});
	} catch (error) {
		next(error);
	}
});
app.post('/webhooks/notify', async(req, res, next) => {
	const {
		id
	} = req.body;
	try {
		const {
			payload,
			urls
		} = await db.getWebhook(id);
		urls.forEach(url => {
			queues[NOTIFY_URL].add({
				payload,
				url,
				id
			});
		});
		return res.sendStatus(200);
	} catch (error) {
		next(error);
	}

});
app.post('/example', (req, res) => {
	console.log(`Hit example with ${JSON.stringify(req.body)}`);
	return res.sendStatus(200);
});
app.use('/', Arena({
	queues: [{
		name: 'NOTIFY_URL',
		hostId: 'Worker',
		redis: getRedisConfig()
	}]
}, {
	basePath: '/arena',
	disableListen: true
}));
server.on(`request`, app);
server.listen(port, () => {
	console.info(`HTTP Server: ${server.address().port}`);
});
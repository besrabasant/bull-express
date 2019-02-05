"use strict";
const Redis = require('ioredis');
const {
	v4 
} = require('uuid');
const uuidV4 = v4;

const redis = new Redis({
	port: 6379,
	host: '127.0.0.1'
});

const WEBHOOK_PREFIX = 'webhook:';
const PAYLOAD_PREFIX = `${WEBHOOK_PREFIX}payload:`;
const URLS_PREFIX = `${WEBHOOK_PREFIX}urls:`;

const makePayloadKey = id => `${PAYLOAD_PREFIX}${id}`;
const makeUrlsKey = id => `${URLS_PREFIX}${id}`;

async function setWebhook(payload, urls) {
	const id = uuidV4();
	const transaction = redis.multi()
		.hmset(makePayloadKey(id), payload)
		.lpush(makeUrlsKey(id), urls);

	await transaction.exec();
	return id;
}
async function getWebhook(id) {
	const transaction = redis.multi()
		.hgetall(makePayloadKey(id))
		.lrange(makeUrlsKey(id), 0, -1);
	const [
		[errPayload, payload],
		[errUrls, urls]
	] = await transaction.exec();
	if (errPayload) {
		throw errPayload;
	}
	if (errUrls) {
		throw errUrls;
	}
	return {
		payload,
		urls
	};
}
module.exports.db = {
	setWebhook,
	getWebhook
};
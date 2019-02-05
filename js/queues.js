"use strict";
const Queue = require('bull');
const NOTIFY_URL = 'NOTIFY_URL';

const queues = {
	[NOTIFY_URL]: new Queue(
			NOTIFY_URL,
			{redis: {port: 6379, host: '127.0.0.1'}}
	)
};

module.exports ={ NOTIFY_URL, queues } ;
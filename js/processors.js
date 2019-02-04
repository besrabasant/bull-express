"use strict";
const {NOTIFY_URL} = require('./queues');
const axios = require('axios');

const processInitialisers = {
	[NOTIFY_URL]: db=> job=> {
		console.log(`Posting to ${job.data.url}`);
		return axios.post(job.data.url, job.data.payload);
	}
};

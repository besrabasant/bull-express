"use strict";
const queues = require('./queues');
const processorInitialisers = require('./processors');
const db = require('./db');

Object.entries(queues).forEach(([queueName, queue])=>{
	console.log(`Worker listening to '${queueName}' queue`);
	queue.process(processorInitialisers[queueName](db));
});

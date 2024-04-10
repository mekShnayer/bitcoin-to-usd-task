require('dotenv').config();
const Airtable = require('airtable');

const { Queue, Worker, QueueScheduler } = require('bullmq');
const Redis = require('ioredis');

const redisClient = new Redis(
    {
        host: 'localhost',
        port: 6379,
        maxRetriesPerRequest: null
    }
);
const myQueue = new Queue('myQueue', {
    connection: redisClient,
});


const worker = new Worker('myQueue', async job => {
    console.log(job.data);
}, { connection: redisClient });

worker.on('completed', job => {
    console.log(`Job completed with result ${job.returnvalue}`);
});

myQueue.on('error', error => {
    console.error('Queue error:', error);
});

worker.on('error', error => {
    console.error('Worker error:', error);
});


const airtableApiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.BASE_ID;
const base = new Airtable({ apiKey: airtableApiKey }).base(baseId);

const postExchangeRate = (time, rate) => {
    base('BTC Table').create([

        {
            "fields": {
                "Time": time,
                "Rates": rate
            }
        },

    ], function (err, records) {
        if (err) {
            console.error('Error posting to Airtable:', error);
            // If error occurs, add failed post to BullMQ queue for retrying
            myQueue.add('retryPost', { time, rate });
            return;
        }
        records.forEach(function (record) {
            console.log(record.getId());
        });
    });
}



module.exports = {
    postExchangeRate,
}



/*
I want to make sure the data is saved even if the airTable doesnt respond. 
I thought of two way to handle this:

first approach - temporaryStorage.
whenever we encounter error when trying to post to airTable - we will update this storage. and for each try we will load to the data also the current storage. 
for example:
storage = [...data]
we can add the spread operator when posting the data :
base('BTC Table').create([
...storage,
        {
            "fields": {
                "Time": time,
                "Rates": rate
            }
        },

    ]
whenever i succeed posting i want to make sure my temporary storage is empty.

second approach - have a stack of calls awaiting to be completed using bullMQ / CeleryD / RabbitMQ .
after a small research with friends of what is the best or common way to handle this. I decided to try solving it in this way.

*/
const azure = require('azure-storage');
const events = require('events');

const eventEmitter = new events.EventEmitter();
const NEW_BEAT_RECEIVED_EVENT = 'newBeatReceived'

const QUEUE_NAME = 'healthbeats';
let queueSvc = null;

async function processMessages() {
  return new Promise(function(resolve, reject) {
    queueSvc.getMessages(QUEUE_NAME, {numOfMessages: 15}, async function(error, results, response){
      if (error) {
        reject(error);
        return;
      }
      const deletePromises = [];
      //console.log(`${results.length} messages retrieved from ${QUEUE_NAME}.`);
      results.forEach(async message => {
        eventEmitter.emit(NEW_BEAT_RECEIVED_EVENT, JSON.parse(message.messageText));
        const currentMessagePromise = new Promise(function(resolve, reject) {
          queueSvc.deleteMessage(QUEUE_NAME, message.messageId, message.popReceipt, function(error, response) {
            if(error){
              console.warn(`Error deleting message "${JSON.stringify(message)}`);
              reject(error);
            } else {
              resolve();
            }
          });  
        });
        deletePromises.push(currentMessagePromise);
      });
      try {
        await Promise.all(deletePromises);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  })
};


async function start() {
  if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
    console.warn(`AZURE_STORAGE_CONNECTION_STRING variable not found.`);
    return;
  }
  queueSvc = azure.createQueueService();
  setInterval(() => processMessages(), 1000*2);
}

module.exports = {
  on : eventEmitter.on.bind(eventEmitter),
  NEW_BEAT_RECEIVED_EVENT : NEW_BEAT_RECEIVED_EVENT,
  start : start
};

//https://docs.microsoft.com/en-us/azure/storage/queues/storage-nodejs-how-to-use-queues
//https://www.npmjs.com/package/@azure/storage-queue
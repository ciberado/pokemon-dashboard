const azure = require('azure-storage');

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
      console.log(`${results.length} messages retrieved from ${QUEUE_NAME}.`);
      results.forEach(async message => {
        console.log(`Message: ${JSON.stringify(message)}`);
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
        console.log(`Message batch processed.`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  })
};


async function main() {
  if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
    console.warn(`AZURE_STORAGE_CONNECTION_STRING variable not found.`);
    return;
  }
  queueSvc = azure.createQueueService();
  setInterval(() => processMessages(), 1000*2);
}

main();


//https://docs.microsoft.com/en-us/azure/storage/queues/storage-nodejs-how-to-use-queues
//https://www.npmjs.com/package/@azure/storage-queue
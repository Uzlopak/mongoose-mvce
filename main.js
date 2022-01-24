const mongoose = require('mongoose');
const ReplSet = require('mongodb-memory-server').MongoMemoryReplSet;

async function main() {

    // Create new instance
    const replSet = new ReplSet({
        instanceOpts: [
            // Set the expiry job in MongoDB to run every second
            {
                port: 27017,
                args: ["--setParameter", "ttlMonitorSleepSecs=1"]
            },
        ],
        dbName: 'mongoose_test',
        replSet: {
            name: "rs0",
            count: 2,
            storageEngine: "wiredTiger",
        },
    });

    await replSet.start();
    await replSet.waitUntilRunning();
    const uri = replSet.getUri('mvce');
    await mongoose.connect(uri);


    process.exit();
}

main();
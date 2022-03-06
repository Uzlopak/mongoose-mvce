const mongoose = require('mongoose');
const { performance } = require('perf_hooks');
const ReplSet = require('mongodb-memory-server').MongoMemoryReplSet;

const Person = new mongoose.Schema({
    firstName: String,
    lastName: String
});

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
    await mongoose.connect(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        minPoolSize: 100,
        maxPoolSize: 200
    });

    const personModel = new mongoose.model('person', Person);

    const personId = (await personModel.collection.insertOne({ firstName: "Eva", lastName: "Goodspeed" })).insertedId;

    for (let i = 0; i < 200; ++i) {
        let startTime = performance.now();
        await personModel.findOneAndUpdate({ _id: personId }, { firstName: "bla" + i }).lean();
        console.log(`Call took ${Math.floor((performance.now() - startTime))} ms`);
    }

    const personUpdated = await personModel.findOne({_id: personId});

    console.log(personUpdated);


    process.exit();
}

main();
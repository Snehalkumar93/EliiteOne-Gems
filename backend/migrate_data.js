import mongoose from 'mongoose';
import 'dotenv/config';

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB Connected for migration");
        
        const db = mongoose.connection.db;
        const targetColl = db.collection('jewelleries');
        
        // Sources
        const sources = ['jewelries', 'products'];
        
        for (const sourceName of sources) {
            const sourceColl = db.collection(sourceName);
            const count = await sourceColl.countDocuments();
            console.log(`Checking source: ${sourceName} (${count} documents)`);
            
            if (count > 0) {
                const docs = await sourceColl.find({}).toArray();
                for (const doc of docs) {
                    // Check if already in target
                    const exists = await targetColl.findOne({ _id: doc._id });
                    if (!exists) {
                        await targetColl.insertOne(doc);
                        console.log(`Migrated ${doc.name || doc._id} from ${sourceName}`);
                    } else {
                        console.log(`Skipped ${doc.name || doc._id} (already exists)`);
                    }
                }
            }
        }
        
        console.log("Migration complete!");
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Migration Error:", error);
        process.exit(1);
    }
}

migrate();

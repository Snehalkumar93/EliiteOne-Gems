import mongoose from 'mongoose';
import 'dotenv/config';

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB Connected for migration");
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        console.log("Current collections:", collectionNames);
        
        if (collectionNames.includes('jewelries') && !collectionNames.includes('jewelleries')) {
            await db.collection('jewelries').rename('jewelleries');
            console.log("Renamed 'jewelries' to 'jewelleries'");
        } else if (collectionNames.includes('jewelries') && collectionNames.includes('jewelleries')) {
            console.log("Both collections exist. Consider merging manually if needed. No action taken.");
        } else {
            console.log("Migration not needed or 'jewelries' collection not found.");
        }
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Migration Error:", error);
        process.exit(1);
    }
}

migrate();

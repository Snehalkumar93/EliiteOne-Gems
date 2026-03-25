import axios from 'axios';
import mongoose from 'mongoose';

const API_URL = "http://localhost:5000";
const MONGODB_URL = "mongodb+srv://mansi:mansi2004@cluster0.vwi7s88.mongodb.net/?appName=Cluster0";

const testEmail = `testverify_${Date.now()}@example.com`;
const testName = "Test Verification";
const testPassword = "Password123";

async function runTest() {
    console.log(`[1] Registering user: ${testEmail}...`);
    try {
        const regRes = await axios.post(`${API_URL}/api/user/register`, {
            name: testName,
            email: testEmail,
            password: testPassword
        });
        console.log("Register Response:", regRes.data);
        if (!regRes.data.success) {
            console.error("Registration failed!");
            process.exit(1);
        }

        console.log(`\n[2] Connecting to DB to fetch verification token...`);
        await mongoose.connect(MONGODB_URL);
        const userSchema = new mongoose.Schema({ email: String, verifyToken: String }, { strict: false });
        const User = mongoose.model('user', userSchema);
        
        const userDoc = await User.findOne({ email: testEmail });
        if (!userDoc || !userDoc.verifyToken) {
            console.error("User or verify token not found in DB!");
            process.exit(1);
        }
        const token = userDoc.verifyToken;
        console.log("Fetched Token:", token);
        await mongoose.disconnect();

        console.log(`\n[3] Calling verify API...`);
        const verifyRes = await axios.post(`${API_URL}/api/user/verify-email`, { token });
        console.log("Verify Response:", verifyRes.data);
        if (!verifyRes.data.success) {
            console.error("Verification failed!");
            process.exit(1);
        }

        console.log(`\n[4] Attempting Login...`);
        const loginRes = await axios.post(`${API_URL}/api/user/login`, {
            email: testEmail,
            password: testPassword
        });
        console.log("Login Response:", loginRes.data.success ? "SUCCESS" : loginRes.data);
        if (!loginRes.data.success) {
            console.error("Login should have succeeded!");
            process.exit(1);
        }

        console.log("\n✅ FULL INTEGRATION TEST PASSED");

    } catch (err) {
        console.error("Error during test:", err.message);
        process.exit(1);
    }
}

runTest();

import { db } from './src/lib/firebase.js';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

async function initDB() {
    console.log("🚀 Initializing Kindergarten Database...");

    try {
        // 1. Set School Name
        await setDoc(doc(db, "settings", "school"), {
            name: "גן הילדים של המורה שרה"
        });
        console.log("✅ School name set.");

        // 2. Add some demo activities
        const activitiesCol = collection(db, "activities");
        await addDoc(activitiesCol, {
            title: "שעת סיפור: האריה שאהב תות",
            type: "video",
            url: "https://www.youtube.com/watch?v=JtetjAbAejI",
            active: true,
            createdAt: new Date()
        });
        await addDoc(activitiesCol, {
            title: "דף צביעה אביבי",
            type: "pdf",
            url: "https://www.google.com/search?q=coloring+pages+for+kids",
            active: true,
            createdAt: new Date()
        });
        console.log("✅ Demo activities added.");

        // 3. Add a demo student
        await addDoc(collection(db, "students"), {
            name: "מיה",
            icon: "Cat",
            color: "var(--primary-green)",
            secret_sequence: ["circle", "square"]
        });
        console.log("✅ Demo student added.");

        console.log("🎉 Database initialization complete!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Initialization failed:", e);
        process.exit(1);
    }
}

initDB();

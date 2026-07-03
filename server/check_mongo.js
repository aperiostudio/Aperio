import mongoose from 'mongoose';

const mongoUri = "mongodb+srv://aperiostudio92_db_user:I1tyFPlgMRAOFIvW@cluster0.jcssyqz.mongodb.net/?retryWrites=true&w=majority";

async function run() {
  try {
    await mongoose.connect(mongoUri, { dbName: 'test' });
    console.log("Connected to MongoDB Atlas!");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections in DB:", collections.map(c => c.name));
    
    // Check projects collection
    if (collections.some(c => c.name === 'projects')) {
      const projects = await db.collection('projects').find({}).toArray();
      console.log("Projects Count:", projects.length);
      console.log("Projects:", JSON.stringify(projects, null, 2));
    } else {
      console.log("No projects collection found!");
    }

    // Check testimonials collection
    if (collections.some(c => c.name === 'testimonials')) {
      const testimonials = await db.collection('testimonials').find({}).toArray();
      console.log("Testimonials Count:", testimonials.length);
    } else {
      console.log("No testimonials collection found!");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

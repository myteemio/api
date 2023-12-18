import mongoose from 'mongoose';

async function connectToDatabase() {
    if (process.env.NODE_ENV !== 'test') {
        await mongoose.connect(process.env.DB_CONNECTION_STRING!);
        console.log('-> Connected to Database!');
    }
}

export default connectToDatabase();
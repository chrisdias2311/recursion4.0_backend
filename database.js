const mongoose = require('mongoose');

const url = `mongodb+srv://bytehogs:bytehogs987654@recursion4.rgv8etu.mongodb.net/?retryWrites=true&w=majority`;

// const connUrl = `mongodb+srv://chrisdias2311:uniExmembers2311@serverlessinstance0.a8eqn.mongodb.net/?retryWrites=true&w=majority`



const connectDB = async () => {
    try{
        const conn = await mongoose.connect(url, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log(`MongoDB connected to  ${conn.connection.host}`);
    } catch(error){
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;

// uniExmembers2311: password
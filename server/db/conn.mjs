// Import the MongoClient from the 'mongodb' library
import { MongoClient } from "mongodb";

// Create a new instance of the MongoClient
const client = new MongoClient("mongodb://localhost:27017");

// Declare a variable to hold the connection
let conn;

try {
  // Log a message to know that my database is running
  console.log("Connecting to Local MongoDB");

  //connect to the MongoDB instance
  conn = await client.connect();

} catch (e) {
  // If an error occurs during the  attempt, log the error
  console.error(e);
}

// If the connection is successful, select the 'cca-management' database
let db = conn.db('cca-management');

// Export the MongoDB database 
export default db;

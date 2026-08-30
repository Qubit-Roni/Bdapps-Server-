const mongoose = require('mongoose');
const uri = "mongodb://ronisikder49_db_user:Rubi%40%23121822@ac-garom0i-shard-00-00.x6up0pw.mongodb.net:27017,ac-garom0i-shard-00-01.x6up0pw.mongodb.net:27017,ac-garom0i-shard-00-02.x6up0pw.mongodb.net:27017/bdapps_auth?ssl=true&replicaSet=atlas-garom0i-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("Connected successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });

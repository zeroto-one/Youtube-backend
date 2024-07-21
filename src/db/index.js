import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { app } from "../app.js";


const ConnectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME,
     
    });
    
    app.on("error", (error) => {
      console.log(`\n MongoDB connected !! Host DB:${connectionInstance.connection.host} `);
    });

    // app.listen(process.env.PORT, () => {
    //   console.log(`App is listening at port :${process.env.PORT}`);
    // });
  } catch (error) {
    console.error("Error :", error);
    process.exit(1);
  }
};

export default ConnectDB;
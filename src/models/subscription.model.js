import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type:Schema.Types.ObjectId,//the users which are subscribing to a particular  channel
        ref:"User"
    } ,
    channel:{
         type:Schema.Types.ObjectId,//the channel to whom user are subscribing    
        ref:"User"
    }

},{timestamps:true});
export const Subscription= mongoose.model("Subscription",subscriptionSchema);
    
import mongoose from "mongoose";
const connectDb = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://trungduong0810:123@cluster0.axljgul.mongodb.net/?retryWrites=true&w=majority"
    );
    console.log("connect mongodb success");
  } catch (error) {
    console.log(error);
  }
};

export default connectDb;

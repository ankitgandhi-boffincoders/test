// import Mongoose from "mongoose";
  
//   class DatabaseConfig {
//     public database!: Mongoose.Connection;
//     public connectDatabase = (): any => {
//         const uri = 
//         "mongodb+srv://boffincoders:social123@cluster0.odcth.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
//       if (this.database) {
//         return;
//       }
  
//       Mongoose.connect(uri);
//       this.database = Mongoose.connection;
//       this.database.once("open", async () => {
//         console.log("Connected to database");
//       });
//       this.database.on("error", () => {
//         console.log("Error connecting to database");
//       });
//     };
//     disconnectDatabase = () => {
//       if (!this.database) {
//         return;
//       }
//       Mongoose.disconnect();
//     };
  
//     // getModelForDb<T extends AnyParamConstructor<any>>(
//     //   databaseName: string,
//     //   model: ReturnModelType<T>
//     // ): ReturnModelType<T> & T {
//     //   const db = Mongoose.connection.useDb(databaseName);
  
//     //   const DbModel = db.model(
//     //     model.modelName,
//     //     model.schema
//     //   ) as ReturnModelType<T> & T;
  
//     //   return DbModel;
//     // }
//   }
  
//   export default new DatabaseConfig();
  
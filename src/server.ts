import { ApolloServer } from "apollo-server-express";
import * as Express from "express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import UserModel from "./UserService/UserModel";
import { UserResolver } from "./UserService/UserResolver";
import * as Mongoose from "mongoose";
import { Container } from "typedi";

Container.set({ id: "USER", factory: () => UserModel });

async function startServer() {
  require("dotenv").config(__dirname + ".env")

  const schema = await buildSchema({
    resolvers: [UserResolver],
    emitSchemaFile: true,
    nullableByDefault: true,
    container: Container,
  });

  const app = Express();

  const MONGO_USER = process.env.MONGODB_USER;
  const MONGO_PASS = process.env.MONGODB_PASS;

  Mongoose.connect(
    `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@cluster0-xv4mh.mongodb.net/test?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
    .then((_res) => {
      console.log("Mongodb is connected successfully");

      const server = new ApolloServer({
        schema,
        context: () => ({

        }),
      });

      server.applyMiddleware({ app });
      const PORT = process.env.PORT;
      app.listen(PORT, () => {
        console.log(`Server is running on PORT ${PORT}`)
      })
    })
    .catch((err) => {
      console.log(err);
    });
}

startServer();

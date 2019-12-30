const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const expressPalyground = require("graphql-playground-middleware-express")
  .default;
const { readFileSync } = require("fs");

const typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");
const resolvers = require("./resolvers");

const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

async function start() {
  const app = express();
  const MONGO_URL = process.env.DB_HOST;
  const DB_NAME = process.env.DB_NAME;

  const client = await MongoClient.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const db = client.db(DB_NAME);
  const context = async ({ req }) => {
    const githubToken = req.headers.authorization;
    const currentUser = await db.collection("users").findOne({
      githubToken
    });
    return { db, currentUser };
  };

  // 2. 서버 인스턴스를 새로 만들기
  // 3. typeDefs(스키마)와 리졸버를 객체에 넣어 전달하기
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context
  });
  server.applyMiddleware({ app });

  const home = (req, res) => res.end("PhotoShare API에 오신 것을 환영합니다.");

  app.get("/", home);
  app.get("/playground", expressPalyground({ endpoint: "/graphql" }));

  const handleListening = () =>
    console.log(
      `GraphQL Server running @ http://localhost:4000${server.graphqlPath}`
    );

  app.listen({ port: 4000 }, handleListening);
}

start();

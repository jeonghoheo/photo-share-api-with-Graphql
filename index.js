const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const expressPalyground = require("graphql-playground-middleware-express")
  .default;
const { readFileSync } = require("fs");

const typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");
const resolvers = require("./resolvers");

const app = express();

// 2. 서버 인스턴스를 새로 만들기
// 3. typeDefs(스키마)와 리졸버를 객체에 넣어 전달하기
const server = new ApolloServer({
  typeDefs,
  resolvers
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

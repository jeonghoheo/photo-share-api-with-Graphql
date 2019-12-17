const { ApolloServer } = require("apollo-server");

const typeDefs = `
    type Query {
        totalPhotos: Int!
    }
`;

const resolvers = {
  Query: {
    totalPhotos: () => 42
  }
};

// 2. 서버 인스턴스를 새로 만들기
// 3. typeDefs(스키마)와 리졸버를 객체에 넣어 전달하기
const server = new ApolloServer({
  typeDefs,
  resolvers
});

server
  .listen()
  .then(({ url }) => console.log(`Graphql Service running on ${url}`));

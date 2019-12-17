const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  type Query {
    totalPhotos: Int!
  }

  type Mutation {
    postPhoto(name: String!, description: String): Boolean!
  }
`;

let photos = [];

const resolvers = {
  Query: {
    totalPhotos: () => photos.length
  },
  Mutation: {
    postPhoto: (parent, args) => {
      photos.push(args);
      return true;
    }
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

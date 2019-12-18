const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  # 1. Phto 타입 정의를 추가
  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
  }

  # 2. allPhotos에서 Photo 타입을 반환한다.
  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory = PORTRAIT
    description: String
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`;

// 임시 데이터
let _id = 0;
let photos = [];

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },
  Mutation: {
    postPhoto: (parent, args) => {
      // 2. 새로운 사진을 만들고 id를 부여한다.
      console.log(args);
      const newPhoto = {
        id: _id++,
        ...args.input
      };
      photos.push(newPhoto);

      // 3. 새로 만든 사진을 반환한다.
      return newPhoto;
    }
  },
  Photo: {
    url: parent => `http://yoursite.com/img/${parent.id}.jpg`
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

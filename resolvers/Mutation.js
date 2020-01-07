const photos = require("../phtos");
const fetch = require("node-fetch");
require("dotenv").config();

const requestGithubToken = credentials =>
  fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(credentials)
  })
    .then(res => res.json())
    .catch(error => {
      console.log(error);
    });
const requestGithubUserAccount = token =>
  fetch(`https://api.github.com/user?access_token=${token}`).then(toJSON);

const authorizeWithGithub = async credentials => {
  let githubUser;
  let access_token;
  try {
    ({ access_token } = await requestGithubToken(credentials));
    githubUser = await requestGithubUserAccount(access_token);
  } catch (error) {
    throw new Error(JSON.stringify(error));
  } finally {
    return { ...githubUser, access_token };
  }
};

const addFakeUsers = async (root, { count }, { db }) => {
  const randomUserApi = `https://randomuser.me/api/?results=${count}`;
  const { results } = await fetch(randomUserApi).then(res => res.json());

  const users = results.map(r => {
    return {
      githubLogin: r.login.username,
      name: `${r.name.first} ${r.name.last}`,
      avatar: r.picture.thumbnail,
      githubToken: r.login.sha1
    };
  });

  await db.collection("users").insert(users);

  return users;
};

const fakeUserAuth = async (parent, { githubLogin }, { db }) => {
  const user = await db.collection("users").findOne({ githubLogin });

  if (!user) {
    throw new Error(`Can't find user with githubLogin ${githubLogin}`);
  }

  return {
    token: user.githubToken,
    user
  };
};

module.exports = {
  fakeUserAuth,
  addFakeUsers,
  postPhoto: async (root, args, { db, currentUser, pubsub }) => {
    // 1. 컨텍스트에 사용자가 존재하지 않는다면 에러를 던집니다.
    if (!currentUser) {
      throw new Error("only an authorized user can post a photo.");
    }

    // 2. 새로운 사진을 만들고 id를 부여한다.
    const newPhoto = {
      userID: currentUser.githubLogin,
      ...args.input,
      created: new Date()
    };
    const { insertedIds } = await db.collection("photos").insert(newPhoto);
    newPhoto.id = insertedIds[0];

    // 3. 새로 만든 사진을 반환한다.
    pubsub.publish("photo-added", { newPhoto });
    return newPhoto;
  },
  githubAuth: async (parent, { code }, { db }) => {
    // 1. 깃허브에서 데이터를 받아오기.
    const {
      message,
      access_token,
      avatar_url,
      login,
      name
    } = await authorizeWithGithub({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code
    });

    // 2. 메세지가 있다면 무언가 잘못된 것이다.
    if (message) {
      throw new Error(message);
    }
    // 3. 결과 값을 하나의 객체 안에 담기.
    const latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: access_token,
      avatar: avatar_url
    };
    // 4. 데이터를 새로 추가하거나 이미 있는 데이터를 업데이트 하기.
    const {
      ops: [user]
    } = await db
      .collection("users")
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });
    // 5 사용자 데이터와 토큰을 반환한다.
    return { user, token: access_token };
  }
};

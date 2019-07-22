import Users from "../../db/Users";
import request from "request-promise-native";

exports.users = async ctx => {
  ctx.body = JSON.stringify({
    users: await Users.selectUsers(ctx.request.query)
  });
};

exports.posts = async ctx => {
  // const getReion = (x, y, callback) => {
  //   request.get(
  //     {
  //       headers: {
  //         Authorization: "KakaoAK 1c4ce7846c27441fe2d16a27e93bd676"
  //       },
  //       url: "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json",
  //       qs: {
  //         x: "126.811727",
  //         y: "37.367586"
  //       },
  //       json: true
  //     },
  //     (error, response, body) => {
  //       callback(null, response.body.documents[0].region_1depth_name);
  //     }
  //   );
  // };
  ctx.body = JSON.stringify({
    posts: await Users.selectPosts(ctx.request.query)
  });
};

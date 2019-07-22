import crypto from "crypto";
import { generateToken } from "../lib/token";
import pool from ".";

const hash = password =>
  crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(password)
    .digest("hex");

exports.register = async ({ userId, userPw, userName }) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.query(
        "INSERT users(user_id, user_pw, user_name, user_profile) VALUES(?, ?, ?, 'default.png')",
        [userId, hash(userPw), userName]
      );
      await connection.commit();
      const [rows] = await connection.query(
        "SELECT user_no as userNo, user_id as userId, user_name as userName, user_profile as userProfile FROM users WHERE user_id = ?",
        [userId]
      );

      connection.release();
      return rows[0];
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.log("Query Error");
      return err;
    }
  } catch (err) {
    console.log("DB Error");
    return err;
  }
};

exports.validatePassword = async (userId, userPw) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const [rows] = await connection.query(
        "SELECT user_pw FROM users WHERE user_id = ?",
        [userId]
      );
      connection.release();
      return rows[0].user_pw === hash(userPw);
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.log("Query Error");
      return err;
    }
  } catch (err) {
    console.log("DB Error");
    return err;
  }
};

exports.selectUsers = async ({ sidx, sord }) => {
  let strQuery = `
  select users.user_no, user_id, user_name,
       count(posts.post_no) as post_count,
       ifnull(likes_a.like_count, 0) as send_like_count,
       ifnull(sum(likes_b.like_count), 0) as recv_like_count
from users
left outer join posts
on users.user_no = posts.user_no
left outer join (
    select user_no, count(like_no) as like_count
    from likes
    group by user_no
    ) likes_a
on users.user_no = likes_a.user_no
left outer join (
    select posts.post_no, count(like_no) as like_count
    from posts
    left outer join likes
    on posts.post_no = likes.post_no
    group by posts.post_no
    ) likes_b
on posts.post_no = likes_b.post_no
group by users.user_no
`;
  if (sidx) {
    strQuery += " ORDER BY " + sidx;
    if (sord === "desc") {
      strQuery += " DESC";
    }
  }
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const [rows] = await connection.query(strQuery);
      connection.release();
      return rows;
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.log("Query Error");
      return err;
    }
  } catch (err) {
    console.log("DB Error");
    return err;
  }
};

exports.selectPosts = async ({ sidx, sord }) => {
  let strQuery = `
  select posts.post_no, users.user_id,
       if(length(post_text)<20, post_text, concat(substr(post_text, 1, 20), '...')) as post_text,
       post_date, count(like_no) as like_count, post_latitude,post_longitude
from posts
left outer join likes
on posts.post_no = likes.post_no
left outer join users
on posts.user_no = users.user_no
group by posts.post_no
`;
  if (sidx) {
    strQuery += " ORDER BY " + sidx;
    if (sord === "desc") {
      strQuery += " DESC";
    }
  }
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const [rows] = await connection.query(strQuery);
      connection.release();
      return rows;
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.log("Query Error");
      return err;
    }
  } catch (err) {
    console.log("DB Error");
    return err;
  }
};

exports.selectUserById = async userId => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const [rows] = await connection.query(
        "SELECT user_no as userNo, user_id as userId, user_name as userName, user_profile as userProfile FROM users WHERE user_id = ?",
        [userId]
      );
      connection.release();
      return rows[0];
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.log("Query Error");
      return err;
    }
  } catch (err) {
    console.log("DB Error");
    return err;
  }
};

exports.generateToken = async userId => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const [rows] = await connection.query(
        "SELECT * FROM users WHERE user_id = ?",
        [userId]
      );
      connection.release();
      const payload = {
        userNo: rows[0].user_no,
        userId: rows[0].user_id,
        userName: rows[0].user_name,
        userProfile: rows[0].user_profile
      };

      return generateToken(payload, "account");
    } catch (err) {
      await connection.rollback();
      connection.release();
      console.log("Query Error");
      return err;
    }
  } catch (err) {
    console.log("DB Error");
    return err;
  }
};

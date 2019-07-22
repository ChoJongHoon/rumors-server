import pool from ".";

exports.selectPosts = async ({ latitude, longitude, userNo }) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const [rows] = await connection.query(
        `select p1.post_no                                                                as postNo,
        u1.user_name                                                              as userName,
        u1.user_profile                                                           as userProfile,
        p1.post_text                                                              as postText,
        date_format(p1.post_date, '%Y-%m-%d %H:%i')                                     as postDate,
        p1.post_latitude                                                             postLatitude,
        p1.post_longitude                                                            postLongitude,
        (6371 * acos(cos(radians(?)) * cos(radians(post_latitude)) *
                     cos(radians(post_longitude) - radians(?)) +
                     sin(radians(?)) * sin(radians(post_latitude))))      as postDistance,
        min((6371 * acos(cos(radians(?)) * cos(radians(like_latitude)) *
                         cos(radians(like_longitude) - radians(?)) +
                         sin(radians(?)) * sin(radians(like_latitude))))) as likeDistance,
        p1.post_count_like                                                        as postCountLike,
        p1.post_count_comment                                                     as postCountComment,
        (select count(1)
         from posts p2
                  join likes l2 on p2.post_no = l2.post_no
         where p2.post_no = p1.post_no
           and l2.user_no = ?)                                                    as myLike,
           (select group_concat(image_name)
            from images i1
            where i1.post_no = p1.post_no)                                           as images
 from posts p1
          join users u1 on p1.user_no = u1.user_no
          left outer join likes l1
                          on p1.post_no = l1.post_no
 group by p1.post_no
 having postDistance <= 3
     or likeDistance <= 3
     order by date_add(postDate, interval postCountLike hour ) desc`,
        [latitude, longitude, latitude, latitude, longitude, latitude, userNo]
      );

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

exports.selectMyPosts = async ({ userNo }) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const [rows] = await connection.query(
        `select p1.post_no                                  as postNo,
        u1.user_name                                as userName,
        u1.user_profile                             as userProfile,
        p1.post_text                                as postText,
        date_format(p1.post_date, '%Y-%m-%d %H:%i') as postDate,
        p1.post_latitude                               postLatitude,
        p1.post_longitude                              postLongitude,
        p1.post_count_like                          as postCountLike,
        p1.post_count_comment                       as postCountComment,
        (select count(1)
         from posts p2
                  join likes l2 on p2.post_no = l2.post_no
         where p2.post_no = p1.post_no
           and l2.user_no = ?)                      as myLike,
        (select group_concat(image_name)
         from images i1
         where i1.post_no = p1.post_no)             as images
 from posts p1
          join users u1 on p1.user_no = u1.user_no
          left outer join likes l1
                          on p1.post_no = l1.post_no
 where p1.user_no = ?
 group by p1.post_no
 order by date_add(postDate, interval postCountLike hour) desc`,
        [userNo, userNo]
      );

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

exports.selectMyLikePosts = async ({ userNo }) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const [rows] = await connection.query(
        `select p1.post_no                                  as postNo,
        u1.user_name                                as userName,
        u1.user_profile                             as userProfile,
        p1.post_text                                as postText,
        date_format(p1.post_date, '%Y-%m-%d %H:%i') as postDate,
        p1.post_latitude                               postLatitude,
        p1.post_longitude                              postLongitude,
        p1.post_count_like                          as postCountLike,
        p1.post_count_comment                       as postCountComment,
        (select count(1)
         from posts p2
                  join likes l2 on p2.post_no = l2.post_no
         where p2.post_no = p1.post_no
           and l2.user_no = ?)                      as myLike,
        (select group_concat(image_name)
         from images i1
         where i1.post_no = p1.post_no)             as images
 from posts p1
          join users u1 on p1.user_no = u1.user_no
          left outer join likes l1
                          on p1.post_no = l1.post_no
 group by p1.post_no
 having myLike = 1
 order by date_add(p1.post_date, interval postCountLike hour) desc`,
        [userNo]
      );

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

exports.insertPost = async ({
  userNo,
  postText,
  postLatitude,
  postLongitude
}) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.query(
        `insert posts(user_no, post_text, post_date, post_latitude, post_longitude)
        values(?, ?, now(), ?, ?)`,
        [userNo, postText, postLatitude, postLongitude]
      );
      await connection.commit();
      connection.release();
      return {
        success: true
      };
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

exports.insertLike = async ({ postNo, userNo, latitude, longitude }) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.query(
        `insert likes(post_no, user_no, like_latitude, like_longitude)
        values(?, ?, ?, ?)`,
        [postNo, userNo, latitude, longitude]
      );
      await connection.query(
        `update posts
        set post_count_like = post_count_like+1
        where post_no = ?`,
        [postNo]
      );
      await connection.commit();
      connection.release();
      return {
        success: true
      };
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

exports.deleteLike = async ({ postNo, userNo }) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.query(
        `delete
        from likes
        where post_no = ?
        and user_no = ?`,
        [postNo, userNo]
      );

      await connection.query(
        `update posts
        set post_count_like = post_count_like-1
        where post_no = ?`,
        [postNo]
      );

      await connection.commit();
      connection.release();
      return {
        success: true
      };
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

exports.selectComments = async ({ postNo }) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const [rows] = await connection.query(
        `select c.comment_no                                  as commentNo,
        u.user_no                                     as userNo,
        u.user_name                                   as userName,
        u.user_profile                                as userProfile,
        c.comment_text                                as commentText,
        date_format(c.comment_date, '%Y-%m-%d %H:%i') as commentDate
 from comments c
          join users u on c.user_no = u.user_no
 where c.post_no = ?
 order by c.comment_date;`,
        [postNo]
      );

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

exports.insertComment = async ({ postNo, userNo, text }) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.query(
        `insert comments(post_no, user_no, comment_text, comment_date)
        VALUES (?, ?, ?, now())`,
        [postNo, userNo, text]
      );
      await connection.query(
        `update posts
        set post_count_comment = post_count_comment+1
        where post_no = ?`,
        [postNo]
      );
      await connection.commit();
      connection.release();
      return {
        success: true
      };
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

exports.selectLikes = async ({ postNo }) => {
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const [rows] = await connection.query(
        `select like_latitude, like_longitude
        from likes
        where post_no = ?`,
        [postNo]
      );

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

const router = require("express").Router();
const sequelize = require("../config/connection");

const { Post, User, Comment } = require("../models");
const withAuth = require("../utils/auth");

// Render dashboard page, only for logged in users
router.get("/", withAuth, (req, res) => {
  // All of the users posts are obtained from the database
  Post.findAll({
    where: {
      // use the ID from the session
      user_id: req.session.user_id,
    },
    attributes: ["id", "post_text", "title", "created_at"],
    include: [
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
      {
        model: User,
        attributes: ["username"],
      },
    ],
  })
    .then((dbPostData) => {

      const posts = dbPostData.map((post) => post.get({ plain: true }));
      res.render("dashboard", { posts, loggedIn: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Edit Post
router.get("/edit/:id", withAuth, (req, res) => {
  // All of the users posts are obtained from the database
  Post.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ["id", "post_text", "title", "created_at"],
    include: [
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
      {
        model: User,
        attributes: ["username"],
      },
    ],
  })
    .then((dbPostData) => {
      // if no post by that id exists, return an error
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      // serialize data before passing to template
      const post = dbPostData.get({ plain: true });
      res.render("edit-post", { post, loggedIn: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Edit User Info
router.get("/edituser", withAuth, (req, res) => {
  User.findOne({
    attributes: { exclude: ["password"] },
    where: {
      id: req.session.user_id,
    },
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        // if no user found, return an error
        res.status(404).json({ message: "No user found with this id" });
        return;
      }
      // else returns the data for the requested user
      const user = dbUserData.get({ plain: true });
      res.render("edit-user", { user, loggedIn: true });
    })
    .catch((err) => {
      // if server error
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;

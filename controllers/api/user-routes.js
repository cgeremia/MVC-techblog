const router = require("express").Router();
const { User, Post, Comment } = require("../../models");
const session = require("express-session");
const withAuth = require("../../utils/auth");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// Get all users
router.get("/", (req, res) => {
  User.findAll({
    attributes: { exclude: ["password"] },
  })
    // return the data as JSON formatted
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Get user by id
router.get("/:id", (req, res) => {
  User.findOne({
    // when the data is sent back, exclude the password property
    attributes: { exclude: ["password"] },
    where: {
      id: req.params.id,
    },
    // include the posts the user has created, the posts the user has commented on, and the posts the user has upvoted
    include: [
      {
        model: Post,
        attributes: ["id", "title", "post_text", "created_at"],
      },
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: Post,
          attributes: ["title"],
        },
      },
    ],
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found" });
        return;
      }
      // else return the data for the requested user
      res.json(dbUserData);
    })
    .catch((err) => {
      // if server error
      console.log(err);
      res.status(500).json(err);
    });
});

// Add a new user
router.post("/", (req, res) => {
  // use create method
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  })
    // Send the user data back to the client as confirmation and save the session
    .then((dbUserData) => {
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;

        res.json(dbUserData);
      });
    })
    // if server error 
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Login route for a user
router.post("/login", (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((dbUserData) => {
    // if the email is not found, return an error
    if (!dbUserData) {
      res.status(400).json({ message: "No user with that email address!" });
      return;
    }
    // call the instance method as defined in the User model 
    const validPassword = dbUserData.checkPassword(req.body.password);
    // if the password is invalid (method returns false), return an error
    if (!validPassword) {
      res.status(400).json({ message: "Incorrect password!" });
      return;
    }
    // otherwise, save the session
    req.session.save(() => {
      req.session.user_id = dbUserData.id;
      req.session.username = dbUserData.username;
      req.session.loggedIn = true;

      res.json({ user: dbUserData, message: "You are logged in!" });
    });
  });
});

// Log out 
router.post("/logout", withAuth, (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

// Update an existing user
router.put("/:id", withAuth, (req, res) => {
  // update method
  User.update(req.body, {
    // hook to hash only the password
    individualHooks: true,
    where: {
      id: req.params.id,
    },
  })
    .then((dbUserData) => {
      if (!dbUserData[0]) {
        res.status(404).json({ message: "No user found" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Delete an existing user
router.delete("/:id", withAuth, (req, res) => {
  User.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;

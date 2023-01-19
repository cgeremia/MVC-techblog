const router = require("express").Router();
const apiRoutes = require("./api");
const homeRoutes = require("./home-routes.js");
const dashboardRoutes = require("./dashboard-routes.js");

// Path for API
router.use("/api", apiRoutes);

// Path for homepage
router.use("/", homeRoutes);

// Path for the dashboard
router.use("/dashboard", dashboardRoutes);

// error
router.use((req, res) => {
  res.status(404).end();
});

module.exports = router;

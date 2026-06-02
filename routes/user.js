const express = require('express');

const userController = require('../controllers/user');

const { verify, verifyAdmin } = require('../auth');

const router = express.Router();

// PUBLIC ROUTES
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/logout", verify, userController.logoutUser);
router.get("/details", verify, userController.getCurrentUser);
router.get("/:id", verify, userController.getUser);
router.patch("/:id/update-profile", verify, userController.updateUser);
router.patch("/:id/update-password", verify, userController.updatePassword);

// ADMIN ROUTES
router.get("/", verify, verifyAdmin, userController.getAll);
router.patch("/:id/set-as-admin", verify, verifyAdmin, userController.setAsAdmin);
router.delete("/:id/delete-user", verify, verifyAdmin, userController.deleteUser);


module.exports = router;

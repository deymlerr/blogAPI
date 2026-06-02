const express = require("express");

const blogController = require("../controllers/blog");

const { verify } = require("../auth");

const router = express.Router();

// CREATE
router.post("/create", verify, blogController.createBlog);

// READ
router.get("/all", blogController.getAllBlogs);
router.get("/authors", blogController.getAuthors);
router.get("/authors/:id", blogController.getAuthorById);
router.get("/:id", blogController.getBlogById);

// UPDATE
router.patch("/:id/update", verify, blogController.updateBlog);

// DELETE
router.delete("/:id/delete", verify, blogController.deleteBlog);

module.exports = router;
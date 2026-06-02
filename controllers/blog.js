const Blog = require("../models/Blog");
const User = require("../models/User");

const { errorHandler } = require("../auth");

// CREATE BLOG
module.exports.createBlog = (req, res) => {

    // CREATE NEW BLOG
    let newBlog = new Blog({
        title: req.body.title,
        content: req.body.content,
        author: req.user?.id || req.body.author,
        status: req.body.status
    });

    // VALIDATION
    Blog.findOne({ title: req.body.title })
        .then(existingBlog => {
            if (existingBlog) {
                return res.status(400).send({ message: "Blog with the same title already exists." });
            }

            return newBlog.save();
        })
        .then(createdBlog => {
            if (!createdBlog) return;

            return Blog.findById(createdBlog._id)
                .populate("author", "firstName lastName email")
                .then(populatedBlog => res.status(201).send({
                    success: true,
                    message: `Blog titled "${populatedBlog.title}" created successfully.`,
                    blog: populatedBlog
                }));
        })
        .catch(err => errorHandler(err, req, res));
};

// READ
module.exports.getBlogById = (req, res) => {

    return Blog.findById(req.params.id)
    .then(blog => {
        if(!blog) {
            return res.status(404).send({ message: "Blog not found." });
        }
        res.status(200).send(blog);
    })
    .catch(err => errorHandler(err, req, res));

}

module.exports.getAuthors = (req, res) => {
    return Blog.aggregate([
        { $match: { author: { $exists: true, $ne: null } } },
        { $group: { _id: "$author", totalBlogs: { $sum: 1 } } },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "author"
            }
        },
        { $unwind: "$author" },
        {
            $project: {
                _id: "$author._id",
                firstName: "$author.firstName",
                lastName: "$author.lastName",
                email: "$author.email",
                totalBlogs: 1
            }
        }
    ])
    .then(authors => res.status(200).send(authors))
    .catch(err => errorHandler(err, req, res));
}

module.exports.getAuthorById = (req, res) => {
    return Blog.find({ author: req.params.id })
    .populate("author", "firstName lastName email")
    .then(blogs => {
        if(!blogs.length) {
            return res.status(404).send({ message: "Author not found." });
        }
        const author = blogs[0].author;
        const authorInfo = {
            _id: author._id,
            firstName: author.firstName,
            lastName: author.lastName,
            email: author.email,
            totalBlogs: blogs.length
        };
        res.status(200).send({ author: authorInfo, blogs });
    })
    .catch(err => errorHandler(err, req, res));
}

module.exports.getAllBlogs = (req, res) => {
    return Blog.find()
    .then(blogs => res.status(200).send(blogs))
    .catch(err => errorHandler(err, req, res));
}

// UPDATE

module.exports.updateBlog = (req, res) => {

    let updatedBlog = {
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        status: req.body.status
    }

    return Blog.findByIdAndUpdate(req.params.id, updatedBlog, { new: true })
    .then(updatedBlog => {
        if(!updatedBlog) {
            return res.status(404).send({ message: "Blog not found." });
        }
        res.status(200).send(updatedBlog);
    })
    .catch(err => errorHandler(err, req, res));

}

// DELETE

module.exports.deleteBlog = (req, res) => {
    return Blog.findById(req.params.id)
    .then(blog => {
        if (!blog) {
            return res.status(404).send({ message: "Blog not found." });
        }

        const authorId = blog.author?._id ? blog.author._id.toString() : blog.author?.toString();
        const currentUserId = req.user?.id;
        const isAdmin = req.user?.isAdmin;

        if (!isAdmin && authorId !== currentUserId) {
            return res.status(403).send({ message: "Only the author or an admin can delete this blog." });
        }

        return Blog.findByIdAndDelete(req.params.id)
        .then(deletedBlog => {
            res.status(200).send({ message: `Blog titled "${deletedBlog.title}" deleted successfully.` });
        });
    })
    .catch(err => errorHandler(err, req, res));
}
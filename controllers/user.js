const User = require('../models/User');
const bcrypt = require("bcryptjs");
const auth = require("../auth");
const { errorHandler } = require("../auth");

// [SECTION] User Registration
module.exports.registerUser = (req, res) => {
    const { firstName, lastName, email, password } = req.body;


    if (!email || !email.includes("@")) {
        return res.status(400).send({ message: "Invalid email format" });
    }

    if (!password || password.length < 8) {
        return res.status(400).send({ message: "Password must be at least 8 characters long" });
    }

    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    });

    return newUser.save()
    .then(newUser => {
        newUser.password = undefined;
        res.status(201).send(newUser);
    })
    .catch(err => errorHandler(err, req, res));
}

// [SECTION] User Login
module.exports.loginUser = (req, res) => {
    if(req.body.email.includes("@")) {  
        return User.findOne({ email: req.body.email })
        .then(result => {
            if(result == null) {
                return res.status(404).send({ message: "User not found" });
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

                if(isPasswordCorrect) {
                    console.log(isPasswordCorrect)
                    return res.status(200).send({ access : auth.createAccessToken(result)});
                } else {
                    return res.status(401).send({ message: "Incorrect email or password" });
                }
            }
        })
        .catch(error => errorHandler(error, req, res));
    } else {
        return res.status(400).send({ message: "Invalid email format" });
    }
}

// [SECTION] User Logout
module.exports.logoutUser = (req, res) => {
    return res.status(200).send({ message: "User logged out successfully" });
}

// [SECTION] Get Profile 
module.exports.getUser = (req, res) => {
    return User.findById(req.params.id)
    .then(user => {
        if(!user) {
            return res.status(404).send({ message: "User not found" });
        }
        // Exclude the password from the returned document
        user.password = undefined;
        return res.status(200).send(user);
    })
    .catch(error => errorHandler(error, req, res));
}

// [SECTION] Get Current User Details
module.exports.getCurrentUser = (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send({ message: "Authentication required" });
    }

    return User.findById(req.user.id)
    .then(user => {
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        user.password = undefined;
        return res.status(200).send({ user });
    })
    .catch(error => errorHandler(error, req, res));
}

// [SECTION] Get all Profiles
module.exports.getAll = (req, res) => {
    return User.find({})
    .then(users => {
        // Exclude passwords for all users
        const safeUsers = users.map(user => {
            user.password = undefined;
            return user;
        });
        return res.status(200).send(safeUsers);
    })
    .catch(error => errorHandler(error, req, res));
}

// [SECTION] Update Profile
module.exports.updateUser = (req, res) => {
    const updates = {
        firstName: req.body.firstName,
        lastName: req.body.lastName
    };

    return User.findByIdAndUpdate(req.params.id, updates, { new: true })
    .then(updatedUser => {
        if(!updatedUser) {
            return res.status(404).send({ message: "User not found" });
        }
        updatedUser.password = undefined;
        return res.status(200).send(updatedUser);
    })
    .catch(error => errorHandler(error, req, res));
}

// [SECTION] Update Password 
module.exports.updatePassword = (req, res) => {
    if (!req.body.newPassword || req.body.newPassword.length < 8) {
        return res.status(400).send({ message: "New password must be at least 8 characters long" });
    }

    const hashedPassword = bcrypt.hashSync(req.body.newPassword, 10);

    return User.findByIdAndUpdate(req.params.id, { password: hashedPassword }, { new: true })
    .then(result => {
        if(!result) {
            return res.status(404).send({ message: "User not found" });
        }
        return res.status(200).send({ message: "Password updated successfully" });
    })
    .catch(error => errorHandler(error, req, res));
}

// [SECTION] Set as Admin
module.exports.setAsAdmin = (req, res) => {
    return User.findByIdAndUpdate(req.params.id, { isAdmin: true }, { new: true })
    .then(updatedUser => {
        if(!updatedUser) {
            return res.status(404).send({ message: "User not found" });
        }
        updatedUser.password = undefined;
        return res.status(200).send(updatedUser);
    })
    .catch(error => errorHandler(error, req, res));
}

// [SECTION] Delete User
module.exports.deleteUser = (req, res) => {
    return User.findByIdAndDelete(req.params.id)
    .then(deletedUser => {
        if(!deletedUser) {
            return res.status(404).send({ message: "User not found" });
        }
        return res.status(200).send({ message: "User deleted successfully" });
    })
    .catch(error => errorHandler(error, req, res));
};
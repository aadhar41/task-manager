const express = require('express')
const bcrypt = require('bcrypt');
var moment = require('moment');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middlewares/auth');
const multer  = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');


router.post("/users", async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        age: req.body.age,
        // createdAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
        // updatedAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
    });

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e)
    }
})


router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({ user , token });
    } catch (e) {
        res.status(400).send("Invalid credentials.");
    }
})

// Logout from one device
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save();

        res.status(200).send({message: "Logout successfully."})
    } catch (e) {
        res.status(500).send(e.message);
    }
})

// Logout from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send({message: "Logout from all devices successfully."})
    } catch (e) {
        res.status(500).send(e.message);
    }
})


router.get("/users/me", auth , async (req, res) => {
    res.send(req.user);
})


router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdates = ["name","email","password","age"];
    const isValidOperation = updates.every((update) => allowUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates." })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update] )
        await req.user.save();

        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})


router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name);
        res.status(200).send(req.user)
    } catch (e) {
         res.status(500).send(e)
    }
})


const upload = multer({ 
    // dest: 'avatars/' ,
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpe?g|png)$/i)) {
            return cb(new Error('Please upload an Image!'))
        }
        cb(null, true)
    }
})

router.post('/users/me/avatar',auth, upload.single('avatar'), async (req, res, next) => {
    
    const buffer = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer();
    req.user.avatar = buffer
    await req.user.save();
    return res.status(200).send({message: "Uploaded Successfully."});
}, (error, req, res, next) => {
    return res.status(400).send({error: error.message});
});


router.delete('/users/me/avatar', auth, async (req, res, next) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
});

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error("")
        }

        res.set("Content-Type", "image/png")
        res.status(200).send(user.avatar);
    } catch (e) {
        return res.status(404).send()
    }
});




module.exports = router
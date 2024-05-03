// Import required modules and components
import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'swanhtetaung'; // Store this securely
const JWT_EXPIRES_IN = '24h'; 
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 
  if (!token) return res.status(403).send({ message: 'A token is required for authentication' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({ message: 'Invalid Token' });
  }
  return next();
};

const sendApprovalEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'swanhtetaungyz@gmail.com', 
        pass: 'ymuw jlmj wpwz dkqu', 
      },
    });

    const mailOptions = {
      from: 'swanhtetaungyz@gmail.com',
      to: email,
      subject: 'Sub Committee Approval',
      text: `Dear ${name},\n\nYour application as a Sub Committee member has been approved.\n\nBest,\nThe Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Approval email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending approval email:", error);
    return false;
  }
};


// Create an Express Router instance
const router = express.Router();

// Route: Fetch all members
router.get("/", verifyToken, async (req, res) => {
  let collection = await db.collection("members");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

function generate2FACode() {
  return Math.floor(100000 + Math.random() * 900000);
}


const send2FACodeToEmail = async (email, code) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'swanhtetaungyz@gmail.com', 
        pass: 'ymuw jlmj wpwz dkqu', 
      },
    });

    const mailOptions = {
      from: 'swanhtetaungyz@gmail.com',
      to: email,
      subject: '2FA Code for Login',
      text: `Your 2FA code for login is: ${code}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

// Route: User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let collection = await db.collection("members");
  let user = await collection.findOne({ email });

  if (!user) {
    return res.status(404).send({ message: "Email not found" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(400).send({ message: "Passwords do not match" });
  }
  const twoFactorCode = generate2FACode();
  await send2FACodeToEmail(user.email, twoFactorCode);

  await collection.updateOne({ email }, { $set: { twoFactorCode: twoFactorCode, twoFactorExpiration: new Date(Date.now() + 10*60000) } });

  //res.send({ userId: user._id, username: user.name }).status(200);
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.send({ token , userId: user._id }); 
});



router.post("/verify-2fa", async (req, res) => {
  const { userId, twoFactorCode } = req.body;
  let collection = await db.collection("members");
  let user = await collection.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  if (user.twoFactorCode !== twoFactorCode || new Date() > new Date(user.twoFactorExpiration)) {
    return res.status(400).send({ message: "Invalid or expired 2FA code" });
  }


  res.send({ success: true, message: "2FA verification successful" }).status(200);
});

// Route: Add a new member
router.post("/", async (req, res) => {

  // Hash the password before storing it in the database
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  // Create a new member document
  let newDocument = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    approvalStatus: req.body.approvalStatus,
    profileImg: req.body.profileImg,
    password: hashedPassword,
    joinedDate: new Date().toISOString().slice(0, 10),
    reason: req.body.reason,
    twoFactorCode:"",
    twoFactorExpiration:""
  };

  let collection = await db.collection("members");

  try {
    // Create a unique index on the email field to prevent duplicate entries
    await collection.createIndex({ email: 1 }, { unique: true });

    // Insert the new member document into the collection
    let result = await collection.insertOne(newDocument);
    let insertedId = result.insertedId;

    res.send({ username: newDocument.name, id: insertedId }).status(200);
  } catch (error) {
    // Handle duplicate email errors and other unexpected errors
    if (error.code === 11000) {
      res.status(400).send({ message: "Email already taken" });
    } else {
      console.error("An error occurred:", error);
      res.status(500).send({ message: "An unexpected error occurred" });
    }
  }
});

// Route: Update a member by ID
router.patch("/:id",verifyToken, async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const updates = {
    $set: {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      approvalStatus: req.body.approvalStatus,
      profileImg: req.body.profileImg,
      password: req.body.password,
      joinedDate: new Date().toISOString().slice(0, 10),
      reason: req.body.reason,
    },
  };

  let collection = await db.collection("members");
  let result = await collection.updateOne(query, updates);
  res.send(result).status(200);
});

// Route: Fetch a specific member by ID
router.get("/:id", verifyToken, async (req, res) => {
  let collection = await db.collection("members");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);
  res.send(result).status(200);
});

router.post("/send-approval-email", verifyToken, async (req, res) => {
  const { email, name } = req.body;

  const emailSent = await sendApprovalEmail(email, name);
  if (emailSent) {
    res.send({ message: "Approval email sent successfully" }).status(200);
  } else {
    res.status(500).send({ message: "Failed to send approval email" });
  }
});

// Route: Delete a member by ID
router.delete("/:id",verifyToken, async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const collection = db.collection("members");
  let result = await collection.deleteOne(query);

  res.send(result).status(200);
});

// Export the router 
export default router;

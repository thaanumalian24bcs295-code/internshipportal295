
const express = require("express");
const router = express.Router();
const Application = require("../models/Application");

const internships = [
  {
    id: 1,
    title: "Web Development Intern",
    company: "Tech Solutions",
    location: "Remote",
    duration: "3 Months",
    description: "Develop modern websites using React and Node.js."
  },
  {
    id: 2,
    title: "Python Developer Intern",
    company: "Code Labs",
    location: "Chennai",
    duration: "2 Months",
    description: "Build Python applications and APIs."
  },
  {
    id: 3,
    title: "Data Science Intern",
    company: "Data Analytics",
    location: "Bangalore",
    duration: "6 Months",
    description: "Analyze datasets and develop machine learning models."
  }
];

// GET all internships
router.get("/internships", (req, res) => {
  res.json(internships);
});

// GET internship by ID
router.get("/internships/:id", (req, res) => {
  const internship = internships.find(
    item => item.id === Number(req.params.id)
  );

  if (!internship) {
    return res.status(404).json({
      message: "Internship not found"
    });
  }

  res.json(internship);
});

// POST application
router.post("/applications", async (req, res) => {
  try {
    const { studentName, email, rollNumber, internship } = req.body;

    if (
      typeof studentName !== "string" ||
      typeof email !== "string" ||
      typeof rollNumber !== "string" ||
      typeof internship !== "string" ||
      !studentName.trim() ||
      !email.trim() ||
      !rollNumber.trim() ||
      !internship.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Invalid email address"
      });
    }

    if (!internships.some(item => item.title === internship)) {
      return res.status(400).json({
        message: "Invalid internship selected"
      });
    }

    const application = new Application({
      studentName,
      email,
      rollNumber,
      internship
    });

    await application.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });

  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid application details"
      });
    }

    res.status(500).json({
      message: "Server error while submitting application"
    });
  }
});

// GET all applications
router.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find().sort({
      createdAt: -1
    });

    res.json(applications);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to retrieve applications"
    });
  }
});

module.exports = router;

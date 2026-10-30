
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate
} from "react-router-dom";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "/api";

// Navigation bar
function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">InternHub</Link>
      <div>
        <Link to="/">Internships</Link>
        <Link to="/applications">Applications</Link>
      </div>
    </nav>
  );
}

// Internship listing page
function Home() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/internships`)
      .then(res => {
        if (!res.ok) throw new Error("Could not load internships");
        return res.json();
      })
      .then(data => setInternships(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <section className="hero">
        <p className="eyebrow">YOUR CAREER STARTS HERE</p>
        <h1>Find Your Perfect Internship</h1>
        <p>Explore opportunities, gain experience and build your future.</p>
      </section>

      <h2>Available Internships</h2>

      {loading && <p>Loading internships...</p>}
      {error && <p className="error">{error}</p>}

      <div className="internship-grid">
        {internships.map(item => (
          <div className="internship-card" key={item.id}>
            <span className="tag">INTERNSHIP</span>
            <h3>{item.title}</h3>
            <p>{item.company}</p>
            <p>📍 {item.location}</p>
            <p>⏳ {item.duration}</p>
            <Link to={`/internship/${item.id}`} className="btn">
              View Details
            </Link>
          </div>
        ))}
      </div>

      {!loading && !error && internships.length === 0 && (
        <p>No internships available.</p>
      )}
    </div>
  );
}

// Internship details page
function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/internships/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Internship not found");
        return res.json();
      })
      .then(data => setInternship(data))
      .catch(err => setError(err.message));
  }, [id]);

  if (error) return <div className="container error">{error}</div>;
  if (!internship) return <div className="container">Loading...</div>;

  return (
    <div className="container details">
      <span className="tag">INTERNSHIP DETAILS</span>
      <h1>{internship.title}</h1>
      <h3>{internship.company}</h3>

      <div className="info-box">
        <p><strong>Location:</strong> {internship.location}</p>
        <p><strong>Duration:</strong> {internship.duration}</p>
        <p><strong>Description:</strong> {internship.description}</p>
      </div>

      <button
        className="btn"
        onClick={() => navigate(`/apply/${internship.id}`)}
      >
        Apply Now
      </button>

      <Link to="/" className="back-link">← Back to internships</Link>
    </div>
  );
}

// Application form page
function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [internship, setInternship] = useState(null);
  const [form, setForm] = useState({
    studentName: "",
    email: "",
    rollNumber: ""
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API}/internships/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Internship not found");
        return res.json();
      })
      .then(data => setInternship(data))
      .catch(err => setMessage(err.message));
  }, [id]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (!form.studentName.trim() ||
        !form.email.trim() ||
        !form.rollNumber.trim()) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!internship) {
      setMessage("Please select a valid internship.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          internship: internship.title
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Application failed");
      }

      setSuccess(true);
      setMessage("Application submitted successfully!");

      setForm({
        studentName: "",
        email: "",
        rollNumber: ""
      });

    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!internship) {
    return <div className="container">Loading internship...</div>;
  }

  return (
    <div className="container form-container">
      <h1>Internship Application</h1>
      <p>Applying for: <strong>{internship.title}</strong></p>

      <form onSubmit={handleSubmit}>
        <label>Student Name</label>
        <input
          type="text"
          name="studentName"
          value={form.studentName}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />

        <label>Email ID</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />

        <label>Roll Number</label>
        <input
          type="text"
          name="rollNumber"
          value={form.rollNumber}
          onChange={handleChange}
          placeholder="Enter your roll number"
          required
        />

        <label>Selected Internship</label>
        <input
          type="text"
          value={internship.title}
          readOnly
        />

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      {message && (
        <p className={success ? "success" : "error"}>
          {message}
        </p>
      )}

      <Link to={`/internship/${id}`} className="back-link">
        ← Back to details
      </Link>
    </div>
  );
}

// Retrieve all submitted applications
function Applications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/applications`)
      .then(res => {
        if (!res.ok) throw new Error("Unable to retrieve applications");
        return res.json();
      })
      .then(data => setApplications(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="container">
      <h1>Submitted Applications</h1>
      {error && <p className="error">{error}</p>}

      {applications.length === 0 && !error && (
        <p>No applications submitted yet.</p>
      )}

      {applications.map(item => (
        <div className="application-card" key={item._id}>
          <h3>{item.studentName}</h3>
          <p>Email: {item.email}</p>
          <p>Roll Number: {item.rollNumber}</p>
          <p>Internship: {item.internship}</p>
        </div>
      ))}
    </div>
  );
}

// Main application
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/internship/:id" element={<InternshipDetails />} />
        <Route path="/apply/:id" element={<ApplicationForm />} />
        <Route path="/applications" element={<Applications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

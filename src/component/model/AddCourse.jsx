import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { api } from "../../utils/constant";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/layoutComponet/addModel.css";

const categoriesOptions = [
  "Web Development", "Data Science", "Mobile Development",
  "Design", "Marketing", "Other",
];

const BootstrapCourseForm = () => {
  const [form, setForm] = useState({
    name: '', description: '', price: '',
    level: 'Beginner', categories: [], thumbnail: null,
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.user?.token);

  const toggleCategory = (cat) => {
    setForm((prevForm) => ({
      ...prevForm,
      categories: prevForm.categories.includes(cat)
        ? prevForm.categories.filter((c) => c !== cat)
        : [...prevForm.categories, cat],
    }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "thumbnail") {
      const file = files[0];
      setForm((prev) => ({ ...prev, thumbnail: file }));
      setPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.description) newErrors.description = "Description is required";
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0)
      newErrors.price = "Price must be a non-negative number";
    if (form.categories.length === 0)
      newErrors.categories = "Select at least one category";
    if (!form.thumbnail)
      newErrors.thumbnail = "Thumbnail is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSuccessMsg("");
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("level", form.level);
      form.categories.forEach((cat) => formData.append("categories[]", cat));
      if (form.thumbnail) {
        formData.append("file", form.thumbnail);
      }

      const res = await api.post("course/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || "Course created successfully!");
        setForm({
          name: "",
          description: "",
          price: "",
          level: "Beginner",
          categories: [],
          thumbnail: null,
        });
        setPreview(null);
        navigate("/course-success");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setErrors({ apiError: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFlipped(true);
    setTimeout(() => navigate("/"), 300);
  };

  return (
    <div className={`create-course-container flip-container ${flipped ? "flipped" : ""} `}>
      <button className="global-close-btn fs-1 fw-bold" onClick={handleClose}>×</button>

      {[...Array(10)].map((_, i) => (
        <div
          className="falling-star"
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20 + 10}px`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      <div className={``}>
        <div className="course-form-card position-relative">
          <form onSubmit={handleSubmit}>
            <h2 className="text-white mb-4 text-center">Create a New Course</h2>

            {errors.apiError && (
              <div className="alert alert-danger">{errors.apiError}</div>
            )}
            {successMsg && (
              <div className="alert alert-success">{successMsg}</div>
            )}

            <div className="mb-3">
              <label className="form-label">Course Name</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
              ></textarea>
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Price (₹)</label>
              <input
                type="number"
                className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                name="price"
                value={form.price}
                onChange={handleChange}
              />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>

            <div className="mb-3 bg-transparent">
              <label className="form-label">Level</label>
              <select
                className="form-select bg-transparent text-white"
                name="level"
                value={form.level}
                onChange={handleChange}
              >
                <option value="Beginner" className="text-black">Beginner</option>
                <option value="Intermediate" className="text-black">Intermediate</option>
                <option value="Advanced" className="text-black">Advanced</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Categories</label>
              <div className="d-flex flex-wrap gap-2">
                {categoriesOptions.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    className={`category-button ${form.categories.includes(cat) ? 'active' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.categories && <div className="text-danger mt-2">{errors.categories}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Thumbnail</label>
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                className={`form-control ${errors.thumbnail ? 'is-invalid' : ''}`}
                onChange={handleChange}
              />
              {errors.thumbnail && <div className="invalid-feedback">{errors.thumbnail}</div>}
              {preview && (
                <div className="mt-3 text-center">
                  <img
                    src={preview}
                    alt="Thumbnail Preview"
                    className="img-thumbnail"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-emerald w-100"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BootstrapCourseForm;

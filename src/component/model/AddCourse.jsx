import React, { useState } from 'react';
import { Modal, Button, Form, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useDispatch, useSelector } from 'react-redux';
import { setShowAddModel } from '../../redux/slice/showAddModel';
import axios from 'axios';
import "../../css/layoutComponet/addModel.css";
import { api } from '../../utils/constant';
import AlertModal from '../../utils/alertModel';
import { useNavigate } from 'react-router-dom';

const AddCourse = ({ show }) => {
    const dispatch = useDispatch();
    const {token} = useSelector(state=>state.user.user);
    const [courseName, setCourseName] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState({});
    let navigate=useNavigate()
    const handleReset = () => {
        setCourseName('');
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setPrice('');
        setDuration('');
        setDescription('');
        setErrors({});
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setThumbnailFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateFields = () => {
        const newErrors = {};
        if (!courseName.trim()) newErrors.courseName = 'Course name is required';
        if (!thumbnailFile) newErrors.thumbnail = 'Thumbnail is required';
        if (!price.trim()) newErrors.price = 'Price is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = async () => {
        if (!validateFields()) return;
        const formData = new FormData();
        formData.append('name', courseName);
        formData.append('file', thumbnailFile);
        formData.append('price', price);
        formData.append('duration', duration);
        formData.append('description', description);

        try {
            const res = await api.post('course/create', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Course created:", res.data);
            AlertModal({
                title: "Course created successfully",
                text: "Press OK to go to Course page",
                icon: "success",
                timer: 2000,
                showCancelButton: false,
                showConfirmButton: true
            }).then(() => {
                navigate("/course")
            })
            handleReset();
            dispatch(setShowAddModel(false));
        } catch (error) {
            AlertModal({
                title: error.response.data.message || "Something went wrong",
                icon: "error",
                timer: 2000,
                showCancelButton: false,
                showConfirmButton: false
            })
        }
    };

    return (
        <div>
            <Modal show={show} centered size="md">
                <h5
                    className='position-absolute top-0 end-0 m-3 fw-bold myBtn'
                    onClick={() => dispatch(setShowAddModel(false))}
                >
                    ❌
                </h5>

                <Modal.Body className="p-4">
                    <h5 className="mb-3">Add New Course</h5>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Course Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter course name"
                                value={courseName}
                                isInvalid={!!errors.courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.courseName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Thumbnail <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                isInvalid={!!errors.thumbnail}
                                onChange={handleFileChange}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.thumbnail}
                            </Form.Control.Feedback>
                            {thumbnailPreview && (
                                <div className="d-flex align-items-start mt-2 position-relative" style={{ width: '110px' }}>
                                    <Image
                                        src={thumbnailPreview}
                                        thumbnail
                                        style={{ width: '100px' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm position-absolute top-0 end-0"
                                        style={{ transform: 'translate(40%, -40%)', padding: '0px 5px' }}
                                        onClick={() => {
                                            setThumbnailPreview(null);
                                            setThumbnailFile(null);
                                        }}
                                    >
                                        ❌
                                    </button>
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Price (INR) <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter price"
                                value={price}
                                isInvalid={!!errors.price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.price}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Duration</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g., 6 weeks"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Course description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                            <Button variant="outline-info" className="me-2" onClick={handleReset}>
                                Reset
                            </Button>
                            <Button variant="info" onClick={handleConfirm}>
                                Confirm
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};
export default AddCourse;

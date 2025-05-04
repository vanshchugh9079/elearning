import { useState } from "react";
import { Container, Form, Button, Card, Image } from "react-bootstrap";

function AddCourse() {
    const [courseData, setCourseData] = useState({
        name: "",
        description: "",
        thumbnail: null,
    });

    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "thumbnail") {
            const file = files[0];
            setCourseData((prev) => ({ ...prev, thumbnail: file }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        } else {
            setCourseData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Here you would typically send the data to the server
        const formData = new FormData();
        formData.append("name", courseData.name);
        formData.append("description", courseData.description);
        formData.append("thumbnail", courseData.thumbnail);

        console.log("Submitted Course Data:", courseData);
        alert("Course submitted!");
    };

    return (
        <Container className="mt-5">
            <Card className="p-4 shadow-sm">
                <h4 className="mb-4 text-primary text-center">Add New Course</h4>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Course Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter course name"
                            name="name"
                            value={courseData.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter course description"
                            name="description"
                            value={courseData.description}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Thumbnail</Form.Label>
                        <Form.Control
                            type="file"
                            name="thumbnail"
                            accept="image/*"
                            onChange={handleChange}
                        />
                        {preview && (
                            <Image
                                src={preview}
                                rounded
                                className="mt-3"
                                style={{ maxWidth: "200px", height: "auto" }}
                            />
                        )}
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100">
                        Add Course
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}

export default AddCourse;

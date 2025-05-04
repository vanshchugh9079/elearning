import React from 'react';

const testimonials = [
  {
    name: 'John Doe',
    role: 'Student',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    message:
      'This platform helped me learn so effectively. The courses are amazing and the instructors are top-notch.',
  },
  {
    name: 'Jane Smith',
    role: 'Student',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    message:
      'I\'ve learned more here than in any other place. The interactive lessons and quizzes make learning enjoyable.',
  },
  {
    name: 'John Doe',
    role: 'Student',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    message:
      'This platform helped me learn so effectively. The courses are amazing and the instructors are top-notch.',
  },
  {
    name: 'Jane Smith',
    role: 'Student',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    message:
      'I\'ve learned more here than in any other place. The interactive lessons and quizzes make learning enjoyable.',
  },
];

const Testimonials = () => {
  return (
    <section className="py-5 text-center bg-white">
      <div className="container">
        <h2 className="mb-5" style={{ color: '#6f42c1' }}>
          What Our Students Say
        </h2>
        <div className="row g-4">
          {testimonials.map((t, index) => (
            <div className="col-md-6 col-lg-3" key={index}>
              <div className="card h-100 shadow-sm p-3">
                <img
                  src={t.image}
                  alt={t.name}
                  className="rounded-circle mx-auto d-block mb-3"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <p className="card-text">{t.message}</p>
                  <h5 className="text-primary mb-0">{t.name}</h5>
                  <small className="text-muted">{t.role}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

import React from 'react';
import '../../css/layoutComponet/footer.css'; // Make sure to create this CSS file
const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-content">
        <p>© 2023 Your E-Learning Platform. All rights reserved.</p>
        <p>Made With <span className="heart">❤️</span> Prashant Kumar Chaturvedi</p>
      </div>
    </div>
  );
};

export default Footer;
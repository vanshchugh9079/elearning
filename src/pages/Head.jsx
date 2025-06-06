import React from 'react';
import { Helmet } from 'react-helmet';

const Head = () => {
  return (
    <Helmet>
      <meta charset="utf-8" />
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <meta content="" name="keywords" />
      <meta content="" name="description" />
      {/* Google Web Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={true}/>
      <link 
        href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600&family=Nunito:wght@600;700;800&display=swap" 
        rel="stylesheet" 
      />

      {/* Icon Font Stylesheet */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" 
        rel="stylesheet" 
      />
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css" 
        rel="stylesheet" 
      />
    </Helmet>
  );
};

export default Head;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
// import LandingPage from '../pages/client/LandingPage';
// import RequestTranscriptPage from '../pages/client/RequestTranscriptPage';
// import StatusCheckPage from '../pages/client/StatusCheckPage';
// import AboutPage from '../pages/client/AboutPage';
// import FAQPage from '../pages/client/FAQPage';
import NotFound from '../components/common/notFound';

const ClientLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="request" element={<RequestTranscriptPage />} />
        <Route path="status" element={<StatusCheckPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default ClientLayout;
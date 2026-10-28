'use client';

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton: React.FC = () => {
  const whatsappNumber = "+41764837540";
  const whatsappMessage = "Hello, I'd like to learn more about your services.";
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-6 right-6 md:hidden z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-green-700 text-white shadow-lg hover:bg-green-800 transition-colors"
        aria-label="Contact via WhatsApp"
      >
        <FaWhatsapp className="h-7 w-7" />
      </a>
    </div>
  );
};

export default WhatsAppButton;

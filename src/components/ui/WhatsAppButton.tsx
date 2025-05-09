import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton: React.FC = () => {
  const whatsappNumber = "+41791234567";
  const whatsappMessage = "Hello, I'd like to learn more about your services.";
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('WhatsApp Contact', {
        props: {
          source: 'floating_button'
        }
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:hidden z-50">
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={handleClick} 
        className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors" 
        aria-label="Contact via WhatsApp"
      >
        <FaWhatsapp className="h-7 w-7" />
      </a>
    </div>
  );
};

export default WhatsAppButton;

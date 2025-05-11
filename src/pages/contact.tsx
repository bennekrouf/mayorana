/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import { useForm } from 'react-hook-form';
import { FiMail, FiMapPin, FiLinkedin } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

interface FormData {
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const router = useRouter();
  const { service } = router.query;

  const whatsappNumber = "+41764837540"; // Replace with your actual WhatsApp number
  const whatsappMessage = "Hello, I'd like to learn more about your services."; // Customize default message
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  const handleWhatsAppClick = () => {
    // Track the WhatsApp button click with Plausible
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('WhatsApp Contact', {
        props: {
          source: 'contact_page'
        }
      });
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>();

  const [formSubmitted, setFormSubmitted] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);

  // Set the service field if it's provided in the query params
  useEffect(() => {
    if (service) {
      setValue('service', service as string);
    }
  }, [service, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      // Send form data to your Rust backend API
      const response = await fetch('http://localhost:5009/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }

      // Handle successful submission
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      // You might want to display an error message to the user
      alert('Failed to send message. Please try again later.');
    }
  };

  const services = [
    { value: "rust-training", label: "Rust Training" },
    { value: "llm-integration", label: "LLM Integration" },
    { value: "ai-agent", label: "AI Agent Development" },
    { value: "api0", label: "api0.ai Solutions" },
    { value: "other", label: "Other" }
  ];

  return (
    <Layout title="Contact | Mayorana">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Get in Touch
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Ready to elevate your tech stack with Rust, AI, or api0.ai? Let's discuss how I can help your business succeed.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="md:hidden mt-8 mb-4">
        <p className="text-center text-muted-foreground text-sm mb-3">
          For a faster response on mobile:
        </p>
        <a href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
        >
          <FaWhatsapp className="h-5 w-5" />
          Contact via WhatsApp
        </a>
      </div>

      {/* Contact Form Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8">
                  Based in Switzerland, I'm here to help global and local clients succeed with cutting-edge solutions.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mr-4 p-3 bg-primary/10 rounded-full text-primary">
                      <FiMail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-muted-foreground">
                        <a href="mailto:contact@mayorana.ch" className="hover:text-primary">
                          contact@mayorana.ch
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 p-3 bg-primary/10 rounded-full text-primary">
                      <FiMapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Location</h3>
                      <p className="text-muted-foreground">Switzerland</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 p-3 bg-primary/10 rounded-full text-primary">
                      <FiLinkedin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">LinkedIn</h3>
                      <p className="text-muted-foreground">
                        <a
                          href="https://linkedin.com/in/yourprofile"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          linkedin.com/in/yourprofile
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-secondary rounded-xl border border-border">
                <h3 className="font-medium mb-2">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  I typically respond to inquiries within 24 hours during business days.
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {formSubmitted ? (
                <div className="bg-secondary p-8 rounded-xl border border-border text-center">
                  <div className="text-primary text-6xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold mb-4">Message Sent Successfully!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. I'll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-secondary p-8 rounded-xl border border-border"
                >
                  <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="font-medium">
                        Name <span className="text-primary">*</span>
                      </label>
                      <input
                        id="name"
                        className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
                        placeholder="Your name"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && (
                        <p className="text-sm text-primary">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="font-medium">
                        Email <span className="text-primary">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
                        placeholder="Your email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                      />
                      {errors.email && (
                        <p className="text-sm text-primary">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Company Field */}
                  <div className="space-y-2 mb-4">
                    <label htmlFor="company" className="font-medium">
                      Company (Optional)
                    </label>
                    <input
                      id="company"
                      className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
                      placeholder="Your company"
                      {...register('company')}
                    />
                  </div>

                  {/* Service Field */}
                  <div className="space-y-2 mb-4">
                    <label htmlFor="service" className="font-medium">
                      Service of Interest <span className="text-primary">*</span>
                    </label>
                    <select
                      id="service"
                      className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
                      {...register('service', { required: 'Please select a service' })}
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.value} value={service.value}>
                          {service.label}
                        </option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="text-sm text-primary">{errors.service.message}</p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2 mb-6">
                    <label htmlFor="message" className="font-medium">
                      Message <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
                      placeholder="How can I help you?"
                      {...register('message', { required: 'Message is required' })}
                    />
                    {errors.message && (
                      <p className="text-sm text-primary">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full p-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;

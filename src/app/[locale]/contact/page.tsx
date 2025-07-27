'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { useForm } from 'react-hook-form';
import { FiMail, FiMapPin, FiLinkedin } from 'react-icons/fi';
import { motion } from '@/components/ui/Motion';
import { FaWhatsapp } from 'react-icons/fa';
import { useTranslations, useLocale } from 'next-intl';

interface FormData {
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
}

// Separate component that uses useSearchParams
function ContactFormWithParams() {
  const searchParams = useSearchParams();
  const service = searchParams.get('service');
  const t = useTranslations('contact');
  const tServices = useTranslations('services');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const whatsappNumber = "+41764837540";
  const whatsappMessage = locale === 'en'
    ? "Hello, I'd like to learn more about your services."
    : "Bonjour, j'aimerais en savoir plus sur vos services.";
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  const handleWhatsAppClick = () => {
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

  // Set the service field if it's provided in the query params
  useEffect(() => {
    if (service) {
      setValue('service', service as string);
    }
  }, [service, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('http://0.0.0.0:5009/api/contact', {
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

      setFormSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again later.');
    }
  };

  const services = [
    { value: "rust-training", label: tServices('rust_training.title') },
    { value: "llm-integration", label: tServices('llm_integration.title') },
    { value: "ai-agent", label: tServices('ai_agent.title') },
    { value: "api0", label: tServices('api0.title') },
    { value: "other", label: "Other" }
  ];

  return (
    <>
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
              {t('hero_title')}
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('hero_subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      <div className="md:hidden mt-8 mb-4">
        <p className="text-center text-muted-foreground text-sm mb-3">
          {t('faster_response')}
        </p>
        <Link
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
        >
          <FaWhatsapp className="h-5 w-5" />
          {t('contact_via_whatsapp')}
        </Link>
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
                <h2 className="text-2xl font-bold mb-6">{t('contact_information')}</h2>
                <p className="text-muted-foreground mb-8">
                  {t('location_description')}
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mr-4 p-3 bg-primary/10 rounded-full text-primary">
                      <FiMail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t('email')}</h3>
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
                      <h3 className="font-medium">{t('location')}</h3>
                      <p className="text-muted-foreground">{tCommon('switzerland')}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 p-3 bg-primary/10 rounded-full text-primary">
                      <FiLinkedin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t('linkedin')}</h3>
                      <p className="text-muted-foreground">
                        <a
                          href="https://linkedin.com/company/mayorana"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          linkedin.com/company/mayorana
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-secondary rounded-xl border border-border">
                <h3 className="font-medium mb-2">{t('response_time')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('response_description')}
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
                  <h3 className="text-2xl font-bold mb-4">{t('message_sent_title')}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t('message_sent_description')}
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                  >
                    {t('send_another')}
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-secondary p-8 rounded-xl border border-border"
                >
                  <h2 className="text-2xl font-bold mb-6">{t('send_message')}</h2>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="font-medium">
                        {t('name')} <span className="text-primary">*</span>
                      </label>
                      <input
                        id="name"
                        className="w-full p-3 rounded-lg border-2 border-muted-foreground/20 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        placeholder="John Doe" // Specific example
                        {...register('name', { required: t('name_required') })}
                      />
                      {errors.name && (
                        <p className="text-sm text-primary">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="font-medium">
                        {t('email')} <span className="text-primary">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full p-3 rounded-lg border-2 border-muted-foreground/20 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        placeholder="john@company.com" // Specific example
                        {...register('email', {
                          required: t('email_required'),
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: t('invalid_email'),
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
                      {t('company_optional')}
                    </label>
                    <input
                      id="company"
                      className="w-full p-3 rounded-lg border-2 border-muted-foreground/20 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      placeholder={t('company_optional')}
                      {...register('company')}
                    />
                  </div>

                  {/* Service Field */}
                  <div className="space-y-2 mb-4">
                    <label htmlFor="service" className="font-medium">
                      {t('service_interest')} <span className="text-primary">*</span>
                    </label>
                    <select
                      id="service"
                      className="w-full p-3 rounded-lg border-2 border-muted-foreground/20 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      {...register('service', { required: t('service_required') })}
                    >
                      <option value="">{t('select_service')}</option>
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
                      {t('message')} <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full p-3 rounded-lg border-2 border-muted-foreground/20 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      placeholder={t('message_placeholder')}
                      {...register('message', { required: t('message_required') })}
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
                    {isSubmitting ? t('sending') : t('send_message_button')}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

// Fallback component to show while Suspense is loading
function ContactFormFallback() {
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');

  return (
    <div className="py-20 bg-gradient-to-b from-secondary to-background">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">{t('hero_title')}</h1>
          <p className="text-xl text-muted-foreground">{tCommon('loading')}</p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ContactPage() {
  return (
    <LayoutTemplate>
      <Suspense fallback={<ContactFormFallback />}>
        <ContactFormWithParams />
      </Suspense>
    </LayoutTemplate>
  );
}

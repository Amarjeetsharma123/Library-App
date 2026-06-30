'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { sendContactMessageAction } from '@/lib/actions/contact';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(4, 'Subject must be at least 4 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export default function ContactClient() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError('');
    setSuccess(false);

    // Client Validation
    const validationResult = contactSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await sendContactMessageAction(formData);
      if (res.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setServerError(res.message);
      }
    } catch (error) {
      setServerError('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="text-lg text-muted-foreground">
          Have questions about memberships, book donations, or overdue fines? Drop us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border p-8 rounded-2xl space-y-6">
            <h2 className="text-2xl font-bold">Get In Touch</h2>
            <p className="text-sm text-muted-foreground">
              Our library staff is available to answer your questions during operational hours. Send an email or give us a call.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Library Location</h4>
                  <p className="text-xs text-muted-foreground mt-1">Baba Vishwakarma Public Library, Mohania Road, Bhabhua, Bihar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Phone Number</h4>
                  <p className="text-xs text-muted-foreground mt-1">+91 9334849363</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Email Address</h4>
                  <p className="text-xs text-muted-foreground mt-1">support@libsphere.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <div className="flex gap-3 items-start p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Message Sent!</h4>
                    <p className="text-xs mt-1">Thank you for reaching out. We will get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              {serverError && (
                <div className="flex gap-3 items-start p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Error</h4>
                    <p className="text-xs mt-1">{serverError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-foreground">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder="Mother India"
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder="motherindia@library.com"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-semibold text-foreground">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="Membership query, book return request..."
                />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold text-foreground">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                  placeholder="How can we help you?"
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
                {!isSubmitting && <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

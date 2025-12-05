/**
 * customer-contact controller
 */

import { factories } from '@strapi/strapi';

const { createCoreController } = factories;

// In-memory store for rate limiting (consider using Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

const checkRateLimit = (ip: string, maxRequests: number = 3, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    // New window or expired
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return false;
  }

  // Increment count
  record.count++;
  return true;
};

const validateEmail = (email: string): boolean => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  // Vietnamese phone number validation (basic)
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const sanitizeInput = (input: string): string => {
  if (!input) return '';
  // Remove HTML tags and trim
  return input.replace(/<[^>]*>/g, '').trim();
};

export default createCoreController('api::customer-contact.customer-contact', ({ strapi }) => ({
  async submit(ctx) {
    try {
      // Get client IP address
      const ip = ctx.request.ip || 
                 ctx.request.headers['x-forwarded-for'] || 
                 ctx.request.headers['x-real-ip'] || 
                 'unknown';

      // Rate limiting: 3 requests per minute per IP
      if (!checkRateLimit(String(ip), 3, 60000)) {
        return ctx.tooManyRequests('Too many requests. Please try again later.');
      }

      // Get request body
      const { name, phone, email, note } = ctx.request.body as any;

      // Validation
      if (!name || !phone) {
        return ctx.badRequest('Name and phone are required');
      }

      // Validate name length
      if (name.length < 2 || name.length > 100) {
        return ctx.badRequest('Name must be between 2 and 100 characters');
      }

      // Validate phone
      if (!validatePhone(phone)) {
        return ctx.badRequest('Invalid phone number format');
      }

      // Validate email if provided
      if (email && !validateEmail(email)) {
        return ctx.badRequest('Invalid email format');
      }

      // Validate note length
      if (note && note.length > 1000) {
        return ctx.badRequest('Note must not exceed 1000 characters');
      }

      // Sanitize inputs
      const sanitizedData = {
        name: sanitizeInput(name),
        phone: sanitizeInput(phone),
        email: email ? sanitizeInput(email) : null,
        note: note ? sanitizeInput(note) : null,
      };

      // Check for duplicate submission in last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const existingContact = await strapi.db.query('api::customer-contact.customer-contact').findOne({
        where: {
          phone: sanitizedData.phone,
          createdAt: {
            $gte: fiveMinutesAgo,
          },
        },
      });

      if (existingContact) {
        return ctx.badRequest('You have already submitted a contact form recently. Please wait a few minutes before submitting again.');
      }

      // Create the contact
      const newContact = await strapi.documents('api::customer-contact.customer-contact').create({
        data: sanitizedData,
      } as any);

      // Log for monitoring
      strapi.log.info('New customer contact submitted', {
        id: newContact.id,
        ip,
        timestamp: new Date().toISOString(),
      });

      return ctx.send({
        success: true,
        message: 'Your contact information has been submitted successfully. We will get back to you soon!',
        data: {
          id: newContact.id,
        },
      });
    } catch (err) {
      strapi.log.error('customer-contact.submit error', err);
      return ctx.throw(500, 'An error occurred while submitting your contact information. Please try again later.');
    }
  },
}));

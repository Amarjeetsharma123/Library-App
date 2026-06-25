'use strict';
'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function signUpAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const terms = formData.get('terms') === 'on' || formData.get('terms') === 'true';

  const validation = signUpSchema.safeParse({ name, email, password, confirmPassword, terms });

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return { success: false, errors };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        errors: { email: ['A user with this email already exists'] },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If first user, make ADMIN, otherwise MEMBER
    const totalUsers = await db.user.count();
    const role = totalUsers === 0 ? 'ADMIN' : 'MEMBER';

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isVerified: false,
      },
    });

    // Create verification token
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email/${token}`;
    await sendEmail({
      to: email,
      subject: 'Verify your Library Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Welcome to the Library Management System</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering. Please click the button below to verify your email address:</p>
          <div style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    });

    return {
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
    };
  } catch (error: any) {
    console.error('Signup action error:', error);
    return {
      success: false,
      message: error.message || 'Something went wrong. Please try again.',
    };
  }
}

export async function verifyEmailAction(token: string) {
  if (!token) {
    return { success: false, message: 'Invalid verification link.' };
  }

  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return { success: false, message: 'Invalid or expired verification token.' };
    }

    if (verificationToken.expiresAt < new Date()) {
      // Clean up expired token
      await db.verificationToken.delete({ where: { token } });
      return { success: false, message: 'Verification link has expired.' };
    }

    // Update user to verified and remove token
    await db.$transaction([
      db.user.update({
        where: { id: verificationToken.userId },
        data: { isVerified: true },
      }),
      db.verificationToken.delete({
        where: { token },
      }),
    ]);

    return { success: true, message: 'Email verified successfully! You can now log in.' };
  } catch (error: any) {
    console.error('Verify email action error:', error);
    return { success: false, message: 'Failed to verify email.' };
  }
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;

  if (!email || !z.string().email().safeParse(email).success) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal that the user does not exist
      return {
        success: true,
        message: 'If an account exists with that email, we have sent a password reset link.',
      };
    }

    // Delete any existing token
    await db.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${token}`;
    await sendEmail({
      to: email,
      subject: 'Reset your Library Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Reset Your Password</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
        </div>
      `,
    });

    return {
      success: true,
      message: 'If an account exists with that email, we have sent a password reset link.',
    };
  } catch (error: any) {
    console.error('Forgot password action error:', error);
    return { success: false, message: 'An error occurred. Please try again.' };
  }
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!token) {
    return { success: false, message: 'Invalid reset token.' };
  }

  if (!password || password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' };
  }

  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match.' };
  }

  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return { success: false, message: 'Invalid or expired password reset link.' };
    }

    if (resetToken.expiresAt < new Date()) {
      await db.passwordResetToken.delete({ where: { token } });
      return { success: false, message: 'Password reset link has expired.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.$transaction([
      db.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.delete({
        where: { token },
      }),
    ]);

    return { success: true, message: 'Password has been reset successfully! You can now log in.' };
  } catch (error: any) {
    console.error('Reset password action error:', error);
    return { success: false, message: 'Failed to reset password. Please try again.' };
  }
}

export async function requestLoginOtpAction(email: string, password: string) {
  if (!email || !password) {
    return { success: false, message: 'Please enter both email and password.' };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: 'No user found with this email' };
    }

    if (user.isBlocked) {
      return { success: false, message: 'Your account is blocked. Please contact admin.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid password' };
    }

    if (!user.isVerified) {
      // Find or create verification token
      let tokenRecord = await db.verificationToken.findFirst({
        where: { userId: user.id }
      });
      if (!tokenRecord) {
        const token = randomUUID();
        tokenRecord = await db.verificationToken.create({
          data: {
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        });
      }
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email/${tokenRecord.token}`;
      await sendEmail({
        to: email,
        subject: 'Verify your Library Account',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Welcome to the Library Management System</h2>
            <p>Hello ${user.name},</p>
            <p>Your account is not verified yet. Please click the button below to verify your email address:</p>
            <div style="margin: 24px 0;">
              <a href="${verifyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="${verifyUrl}">${verifyUrl}</a></p>
            <p>This link will expire in 24 hours.</p>
          </div>
        `,
      });
      return { success: false, message: 'Please verify your email address. We have sent a verification link to your email.' };
    }

    // Generate OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.loginOtp.upsert({
      where: { email: user.email },
      update: { otp: otpCode, expiresAt },
      create: { email: user.email, otp: otpCode, expiresAt },
    });

    // Send the OTP
    await sendEmail({
      to: user.email,
      subject: 'Your Login One-Time Password (OTP)',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Login Verification</h2>
          <p>Hello ${user.name},</p>
          <p>Use the following One-Time Password (OTP) to complete your login. This code is valid for 10 minutes:</p>
          <div style="margin: 24px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4f46e5; text-align: center;">
            ${otpCode}
          </div>
          <p>If you did not request this login code, you can safely ignore this email.</p>
        </div>
      `,
    });

    return { success: true, otpRequired: true, message: 'OTP sent successfully!' };
  } catch (error: any) {
    console.error('Request login OTP error:', error);
    return { success: false, message: error.message || 'Something went wrong.' };
  }
}

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { db } from "../../db";
import { users, passwordResetCodes } from "../../db/schema";
import { eq, and, gt } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import * as sgMail from "@sendgrid/mail";
import { SignJWT, jwtVerify } from "jose";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("CRITICAL: JWT_SECRET environment variable is required for production");
}

const getSecretKey = () => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(JWT_SECRET);
};

async function createToken(userId: string, email: string): Promise<string> {
  const token = await new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
  return token;
}

async function verifyToken(token: string): Promise<{ sub: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || !payload.email) return null;
    return { sub: payload.sub as string, email: payload.email as string };
  } catch {
    return null;
  }
}

function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email.toLowerCase()),
      });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      const isValidPassword = await bcrypt.compare(input.password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid email or password");
      }

      const token = await createToken(user.id, user.email);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),

  signup: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, input.email.toLowerCase()),
      });

      if (existingUser) {
        throw new Error("An account with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      const [newUser] = await db
        .insert(users)
        .values({
          name: input.name,
          email: input.email.toLowerCase(),
          password: hashedPassword,
        })
        .returning();

      const token = await createToken(newUser.id, newUser.email);

      return {
        success: true,
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      };
    }),

  getUser: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      const decoded = await verifyToken(input.token);
      if (!decoded) {
        throw new Error("Invalid or expired token");
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.sub),
      });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    }),

  changePassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        currentPassword: z.string().min(6),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const decoded = await verifyToken(input.token);
      if (!decoded) {
        throw new Error("Invalid or expired token");
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.sub),
      });

      if (!user) {
        throw new Error("User not found");
      }

      const isValidPassword = await bcrypt.compare(input.currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error("Current password is incorrect");
      }

      if (input.currentPassword === input.newPassword) {
        throw new Error("New password must be different from current password");
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      await db
        .update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, user.id));

      return {
        success: true,
        message: "Password changed successfully",
      };
    }),

  sendResetCode: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.email, input.email.toLowerCase()),
      });

      if (user) {
        const resetCode = generateResetCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await db.insert(passwordResetCodes).values({
          userId: user.id,
          email: input.email.toLowerCase(),
          code: resetCode,
          expiresAt,
        });

        if (process.env.SENDGRID_API_KEY) {
          try {
            await sgMail.send({
              to: input.email,
              from: process.env.SENDGRID_FROM_EMAIL || "noreply@yourdomain.com",
              subject: "Your Password Reset Code - Yuguyu",
              text: `Your password reset code is: ${resetCode}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, please ignore this email.`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">Password Reset Request</h2>
                  <p>You requested to reset your password for your Yuguyu account.</p>
                  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #FF6B35; margin: 0; font-size: 36px; letter-spacing: 4px;">${resetCode}</h1>
                  </div>
                  <p>Enter this code in the app to reset your password.</p>
                  <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
                  <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
                </div>
              `,
            });
          } catch (error) {
            console.error("SendGrid error:", error);
          }
        } else {
          console.log(`[DEV] Reset code for ${input.email}: ${resetCode}`);
        }
      }

      return {
        success: true,
        message: "If an account exists with this email, a reset code has been sent",
      };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const storedCode = await db.query.passwordResetCodes.findFirst({
        where: and(
          eq(passwordResetCodes.email, input.email.toLowerCase()),
          eq(passwordResetCodes.code, input.code),
          eq(passwordResetCodes.used, false),
          gt(passwordResetCodes.expiresAt, new Date())
        ),
        orderBy: (codes, { desc }) => [desc(codes.createdAt)],
      });

      if (!storedCode) {
        throw new Error("Invalid or expired reset code");
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, storedCode.userId),
      });

      if (!user) {
        throw new Error("User not found");
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      await db
        .update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, user.id));

      await db
        .update(passwordResetCodes)
        .set({ used: true })
        .where(eq(passwordResetCodes.id, storedCode.id));

      return {
        success: true,
        message: "Password reset successfully",
      };
    }),

  updateProfile: publicProcedure
    .input(
      z.object({
        token: z.string(),
        name: z.string().min(2).optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.string().optional(),
        activityLevel: z.string().optional(),
        fitnessGoal: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const decoded = await verifyToken(input.token);
      if (!decoded) {
        throw new Error("Invalid or expired token");
      }

      const { token, ...updateData } = input;
      const cleanData: Record<string, unknown> = {};
      
      if (updateData.name) cleanData.name = updateData.name;
      if (updateData.height !== undefined) cleanData.height = updateData.height;
      if (updateData.weight !== undefined) cleanData.weight = updateData.weight;
      if (updateData.dateOfBirth) cleanData.dateOfBirth = updateData.dateOfBirth;
      if (updateData.gender) cleanData.gender = updateData.gender;
      if (updateData.activityLevel) cleanData.activityLevel = updateData.activityLevel;
      if (updateData.fitnessGoal) cleanData.fitnessGoal = updateData.fitnessGoal;
      cleanData.updatedAt = new Date();

      const [updatedUser] = await db
        .update(users)
        .set(cleanData)
        .where(eq(users.id, decoded.sub))
        .returning();

      return {
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          height: updatedUser.height,
          weight: updatedUser.weight,
          dateOfBirth: updatedUser.dateOfBirth,
          gender: updatedUser.gender,
          activityLevel: updatedUser.activityLevel,
          fitnessGoal: updatedUser.fitnessGoal,
        },
      };
    }),
});

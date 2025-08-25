// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

export async function POST(req: Request) {
  try {
    // Removed connectMongo() as it's no longer needed
    const { uid, email, username } = await req.json();

    if (!uid || !email || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ uid }, { username }],
      },
    });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this UID or username already exists' }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        uid,
        email,
        username,
      },
    });

    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
  } catch (err) {
    console.error('Failed to create user:', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    // Removed connectMongo() as it's no longer needed
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ users });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

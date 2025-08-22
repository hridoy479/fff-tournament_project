// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { connectMongo } from '@/config/mongodb';
import { UserModel } from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectMongo();
    const { uid, email, username } = await req.json();

    if (!uid || !email || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await UserModel.findOne({ $or: [{ uid }, { username }] });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this UID or username already exists' }, { status: 409 });
    }

    const newUser = new UserModel({
      uid,
      email,
      username,
    });

    await newUser.save();

    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
  } catch (err) {
    console.error('Failed to create user:', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}


export async function GET() {
  try {
    await connectMongo(); // Ensure DB is connected
    const users = await UserModel.find().sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

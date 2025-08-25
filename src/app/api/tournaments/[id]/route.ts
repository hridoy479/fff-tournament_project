import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Invalid tournament ID' }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({ where: { id: numericId } });

    if (!tournament) {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({ tournament }, { status: 200 });
  } catch (error) {
    console.error('[API/Tournaments/[id]] GET error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const numericId = parseInt(id, 10);
    const body = await req.json();

    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Invalid tournament ID' }, { status: 400 });
    }

    const updatedTournament = await prisma.tournament.update({
      where: { id: numericId },
      data: body,
    });

    return NextResponse.json({ tournament: updatedTournament }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }
    console.error('[API/Tournaments/[id]] PUT error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Invalid tournament ID' }, { status: 400 });
    }

    await prisma.tournament.delete({ where: { id: numericId } });

    return NextResponse.json({ message: 'Tournament deleted successfully' }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }
    console.error('[API/Tournaments/[id]] DELETE error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

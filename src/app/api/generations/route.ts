import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, title, schemaJson, usedFallback } = await req.json();

    if (!prompt || !title || !schemaJson) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const generation = await prisma.generation.create({
      data: {
        userId,
        prompt,
        title,
        schemaJson,
        usedFallback: !!usedFallback
      }
    });

    return NextResponse.json(generation);
  } catch (error) {
    console.error('[Generations POST API Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const generations = await prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(generations);
  } catch (error) {
    console.error('[Generations GET API Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

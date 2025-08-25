import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import { z } from 'zod';

const prisma = new PrismaClient(); // Initialize PrismaClient

const tournamentSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), { message: "Invalid date format" }),
  image: z.string().url({ message: "Invalid image URL" }),
  entry_fee: z.number().min(0, { message: "Entry fee must be a positive number" }), // Changed to entry_fee
  prize: z.string().min(1, { message: "Prize is required" }),
  joined_players: z.number().min(0, { message: "Joined players must be a positive number" }), // Changed to joined_players
  max_players: z.number().min(1, { message: "Max players must be at least 1" }), // Changed to max_players
  category: z.enum(['freefire', 'ludo', 'E Football']),
  description: z.string().optional(),
  status: z.enum(['upcoming', 'started', 'completed', 'cancelled']), // Adjusted enum values
  userId: z.string(), // userId is a string in Prisma schema
});

export async function createTournament(data: any) {
  const validation = tournamentSchema.safeParse(data);

  if (!validation.success) {
    throw new Error(JSON.stringify(validation.error.flatten().fieldErrors));
  }

  const { title, date, image, entry_fee, prize, joined_players, max_players, category, description, status, userId } = validation.data; // Adjusted field names

  const savedTournament = await prisma.tournament.create({
    data: {
      title,
      date: new Date(date),
      image,
      entry_fee,
      prize,
      joined_players,
      max_players,
      category,
      description,
      status,
      userId,
    },
  });

  return savedTournament;
}

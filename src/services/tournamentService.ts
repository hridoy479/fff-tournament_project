import { TournamentModel } from '@/models/Tournament';
import { z } from 'zod';

const tournamentSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), { message: "Invalid date format" }),
  image: z.string().url({ message: "Invalid image URL" }),
  entryFee: z.number().min(0, { message: "Entry fee must be a positive number" }),
  prize: z.string().min(1, { message: "Prize is required" }),
  joinedPlayers: z.number().min(0, { message: "Joined players must be a positive number" }),
  maxPlayers: z.number().min(1, { message: "Max players must be at least 1" }),
  category: z.enum(['freefire', 'ludo', 'E Football']),
  description: z.string().optional(),
  status: z.enum(['upcoming', 'running', 'finished']),
  userId: z.string(),
});

export async function createTournament(data: any) {
  const validation = tournamentSchema.safeParse(data);

  if (!validation.success) {
    throw new Error(JSON.stringify(validation.error.flatten().fieldErrors));
  }

  const { title, date, image, entryFee, prize, joinedPlayers, maxPlayers, category, description, status, userId } = validation.data;

  const newTournament = new TournamentModel({
    title,
    date: new Date(date),
    image,
    entryFee,
    prize,
    joinedPlayers,
    maxPlayers,
    category,
    description,
    status,
    userId,
  });

  const savedTournament = await newTournament.save();

  return savedTournament;
}

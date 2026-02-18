import { Request, Response } from 'express';
import * as userService from './user.service';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const user = await userService.getProfile(userId);
  res.json({ data: user });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const user = await userService.updateProfile(userId, req.body);
  res.json({ data: user });
}

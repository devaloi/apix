import { Request, Response } from 'express';
import * as userService from './user.service';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = await userService.getProfile(req.user!.userId);
  res.json({ data: user });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const user = await userService.updateProfile(req.user!.userId, req.body);
  res.json({ data: user });
}

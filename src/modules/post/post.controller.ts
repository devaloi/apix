import { Request, Response } from 'express';
import * as postService from './post.service';
import { listPostsQuerySchema } from './post.schemas';

export async function create(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const post = await postService.create(userId, req.body);
  res.status(201).json({ data: post });
}

export async function getById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const post = await postService.getById(req.params.id);
  res.json({ data: post });
}

export async function update(req: Request<{ id: string }>, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const post = await postService.update(req.params.id, userId, req.body);
  res.json({ data: post });
}

export async function remove(req: Request<{ id: string }>, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

  await postService.remove(req.params.id, userId);
  res.status(204).send();
}

export async function list(req: Request, res: Response): Promise<void> {
  const query = listPostsQuerySchema.parse(req.query);
  const result = await postService.list(query);
  res.json(result);
}

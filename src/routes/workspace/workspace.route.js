import express from 'express';
import { asyncHandler } from '#lib/async-handler';
import { authLimiter } from '../../config/auth.limiter.js';
import { WorkSpaceController } from '#controllers/WorkSpace/workspace.controller';

const workspaceRouter = express.Router();

workspaceRouter.post('/create', authLimiter, asyncHandler(WorkSpaceController.createWorkspace));

workspaceRouter.get('/verify/:token', asyncHandler(WorkSpaceController.verifyInviteEmail));

export default workspaceRouter;
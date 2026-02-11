import express from 'express';
import { asyncHandler } from '#lib/async-handler';
import { WorkSpaceController } from '#controllers/WorkSpace/workspace.controller';
import { AuthMiddleware } from '#middlewares/auth.middleware';

const workspaceRouter = express.Router();

workspaceRouter.post('/create', AuthMiddleware.isAuth, asyncHandler(WorkSpaceController.createWorkspace));

workspaceRouter.get('/verify/:token', asyncHandler(WorkSpaceController.verifyInviteEmail));

export default workspaceRouter;
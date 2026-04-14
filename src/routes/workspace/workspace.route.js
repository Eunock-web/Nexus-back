import express from 'express';
import { asyncHandler } from '#lib/async-handler';
import { WorkSpaceController } from '#controllers/WorkSpace/workspace.controller';
import { AuthMiddleware } from '#middlewares/auth.middleware';

const workspaceRouter = express.Router();

workspaceRouter.post('/create', AuthMiddleware.isAuth, asyncHandler(WorkSpaceController.createWorkspace));

workspaceRouter.get('/verify/:token', asyncHandler(WorkSpaceController.verifyInviteEmail));

workspaceRouter.get('/', AuthMiddleware.isAuth, asyncHandler(WorkSpaceController.getAll));

workspaceRouter.get('/:id', AuthMiddleware.isAuth, asyncHandler(WorkSpaceController.getWorkspaceById));

workspaceRouter.get('/user/:userId', AuthMiddleware.isAuth, asyncHandler(WorkSpaceController.getWorkspaceByUser));

workspaceRouter.get('/members/:id', AuthMiddleware.isAuth, asyncHandler(WorkSpaceController.getWorkspaceMembers));

export default workspaceRouter;
import express from 'express';
import { asyncHandler } from '#lib/async-handler';
import { AuthMiddleware } from '#middlewares/auth.middleware';
import { ProjectController } from '#controllers/WorkSpace/project.controller';

const projectRouter = express.Router();

projectRouter.post('/create/:workspaceId', AuthMiddleware.isAuth, asyncHandler(ProjectController.createProject));


export default projectRouter;
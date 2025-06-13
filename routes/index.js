import express from 'express';
import viewRoutes from './viewRoutes.js';
import apiRoutes from './apiRoutes.js';
import { notFound } from '../middleware/errorHandler.js';

const router = express.Router();

// Register routes
router.use('/', viewRoutes);
router.use('/api', apiRoutes);

// Handle 404 routes
router.use(notFound);

export default router;
import express from 'express';
import propertyRoutes from './routes/propertyRoutes';
import blogRoutes from './routes/blogRouter';
import authRoutes from './routes/authRoute';
import adminRoutes from './routes/adminRoute';
import paymentRoutes from './routes/paymentRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

// Register routes
app.use('/api', propertyRoutes);
app.use('/api', blogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', paymentRoutes);
// app.use('/api/admin', adminRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;

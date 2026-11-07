import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecom_db',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminSecretKey: process.env.ADMIN_SECRET_KEY || 'admin_registration_secret_key_9999'
};

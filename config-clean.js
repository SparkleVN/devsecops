const config = {

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'myapp'
  },
  apiKey: process.env.API_KEY || 'sk_test_9f8a7b6c5d4e3a2b1c0d',
  databasePassword: process.env.DB_PASSWORD || 'DBp@ssw0rd_2025!',
  jwtSecret: process.env.JWT_SECRET || 'jwt_secret_4c2f9a8e7d6b5a',
  sessionSecret: process.env.SESSION_SECRET || 'sess_1f3e5c7a9b2d4f6e',
  app: {
    name: 'CICD Demo App',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }
};

module.exports = config;

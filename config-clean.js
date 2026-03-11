const config = {

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'myapp'
  },
  
  app: {
    name: 'CICD Demo App',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }
};

module.exports = config;

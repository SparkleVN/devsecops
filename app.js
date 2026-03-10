const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CICD Demo App</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .container {
                text-align: center;
                background: rgba(255,255,255,0.1);
                padding: 2rem;
                border-radius: 15px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                border: 1px solid rgba(255,255,255,0.18);
                max-width: 600px;
            }
            h1 {
                font-size: 2.5rem;
                margin-bottom: 1rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .version {
                background: rgba(255,255,255,0.2);
                padding: 0.5rem 1rem;
                border-radius: 25px;
                display: inline-block;
                margin: 1rem 0;
            }
            .features {
                text-align: left;
                margin: 2rem 0;
            }
            .feature {
                margin: 0.5rem 0;
                padding: 0.5rem;
                background: rgba(255,255,255,0.1);
                border-radius: 5px;
            }
            .timestamp {
                font-size: 0.9rem;
                opacity: 0.8;
                margin-top: 2rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>CICD Pipeline Demo</h1>
            <div class="version">Version: 1.0.0</div>

            <div class="features">
                <div class="feature">GitHub Actions CI/CD Pipeline</div>
                <div class="feature">Docker Containerization</div>
                <div class="feature">Gitleaks Security Scanning</div>
                <div class="feature">Telegram Notifications</div>
            </div>

            <p>This webapp demonstrates a complete CICD pipeline with:</p>
            <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                <li>Automated testing and building</li>
                <li>Security scanning with Gitleaks</li>
                <li>Docker image creation</li>
                <li>Deployment automation</li>
                <li>Alert notifications</li>
            </ul>

            <div class="timestamp">
                Last deployed: ${new Date().toLocaleString('vi-VN')}
            </div>
        </div>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    app: 'CICD Demo Webapp',
    version: '1.0.0',
    description: 'Demonstrating GitHub Actions, Docker, and Gitleaks integration',
    features: [
      'CI/CD with GitHub Actions',
      'Docker containerization',
      'Security scanning with Gitleaks',
      'Telegram notifications',
      'Automated deployment'
    ],
    author: 'CICD Demo Team',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the app at: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

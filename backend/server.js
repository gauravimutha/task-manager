// server.js — entry point
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 KanbanFlow backend running on http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/api/health`);
});

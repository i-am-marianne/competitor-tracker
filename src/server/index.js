const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
const port = 3000;  // Changed from 5000 to 3000

app.use(cors());
app.use(express.json());

app.get('/api/competitors', async (req, res) => {
  try {
    const competitors = await prisma.competitor.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(competitors);
  } catch (error) {
    console.error('Error fetching competitors:', error);
    res.status(500).json({ error: 'Failed to fetch competitors' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
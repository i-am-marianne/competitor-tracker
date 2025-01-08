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

app.get('/api/competitors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const competitor = await prisma.competitor.findUnique({
      where: { id: parseInt(id) },
    });
    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }
    res.json(competitor);
  } catch (error) {
    console.error('Error fetching competitor:', error);
    res.status(500).json({ error: 'Failed to fetch competitor' });
  }
});
app.get('/api/competitors/:id/sources', async (req, res) => {
  const { id } = req.params; // Get competitor ID from URL
  try {
    const sources = await prisma.source.findMany({
      where: { competitorId: parseInt(id) },
    });
    res.json(sources); // Return sources
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

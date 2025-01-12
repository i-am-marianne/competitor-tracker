const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
const port = 3000;  // Changed from 5000 to 3000

const { exec } = require('child_process');

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

// Fetch release notes

app.get('/api/competitors/:id/release-notes', async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch release notes for the given competitor ID
    const releaseNotes = await prisma.releaseNote.findMany({
      where: {
        competitorId: parseInt(id), // Ensure the ID is an integer
      },
      orderBy: {
        date: 'desc', // Sort by date to get the latest release first
      },
    });

    if (!releaseNotes || releaseNotes.length === 0) {
      return res.status(404).json({ message: 'No release notes found for this competitor' });
    }

    // Return the release notes
    res.json(releaseNotes);
  } catch (error) {
    console.error('Error fetching release notes:', error);
    res.status(500).json({ error: 'Failed to fetch release notes' });
  }
});


// Trigger scraper and database update
app.post('/api/run-update', async (req, res) => {
  try {
    console.log('Running scraper and update...');

    // Execute the scraper
    exec('python3 src/server/scraper/aircall/aircall_scraper.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`Scraper error: ${error.message}`);
        return res.status(500).json({ error: `Scraper failed: ${stderr || error.message}` });
      }

      console.log(`Scraper Output: ${stdout}`);

      // Execute database insertion
      exec('node scripts/insertAircallReleaseNotes.js', (error, stdout, stderr) => {
        if (error) {
          console.error(`Insertion error: ${error.message}`);
          return res.status(500).json({ error: `Insertion failed: ${stderr || error.message}` });
        }

        console.log(`Insertion Output: ${stdout}`);
        res.status(200).json({ message: 'Update successful!' });
      });
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected error occurred during the update process.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Load JSON data
const dataPath = path.join(__dirname, '../src/server/scraper/aircall/aircall_release_notes.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

async function insertReleaseNotes() {
  try {
    const competitorId = 27; // Aircall's ID in the Competitor table

    for (const section of data) {
      for (const update of section.updates) {
        // Format date to match Prisma DateTime
        const formattedDate = new Date(update.date.split('-').reverse().join('-'));

        // Insert or update the release note
        await prisma.releaseNote.upsert({
          where: {
            competitorId_date_title: { // Now valid due to the composite key
              competitorId,
              date: formattedDate,
              title: update.update_title,
            },
          },
          update: {
            details: update.update_details,
            url: section.url,
            updatedAt: new Date(),
          },
          create: {
            competitorId,
            date: formattedDate,
            title: update.update_title,
            details: update.update_details,
            url: section.url,
          },
        });
      }
    }

    console.log('Release notes inserted successfully!');
  } catch (error) {
    console.error('Error inserting release notes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertReleaseNotes();

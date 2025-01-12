const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const DIALPAD_COMPETITOR_ID = 22;

async function insertReleaseNotes() {
  try {
    // Read the JSON file
    const jsonPath = path.join(__dirname, '../src/server/scraper/dialpad/dialpad_release_notes.json');
    const releaseNotesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    console.log(`Found ${releaseNotesData.length} release notes to process`);

    for (const releaseNote of releaseNotesData) {
      // Parse the date from the format "17 Dec 2024" to DateTime
      const date = new Date(releaseNote.date);

      // Process each section (improvements and new features)
      for (const section of releaseNote.sections) {
        for (const item of section.items) {
          try {
            await prisma.releaseNote.upsert({
              where: {
                competitorId_date_title: {
                  competitorId: DIALPAD_COMPETITOR_ID,
                  date,
                  title: item.title
                }
              },
              update: {
                details: item.details,
                url: releaseNote.link,
                updatedAt: new Date()
              },
              create: {
                competitorId: DIALPAD_COMPETITOR_ID,
                date,
                title: item.title,
                details: item.details,
                url: releaseNote.link
              }
            });

            console.log(`Successfully processed: ${date.toISOString()} - ${item.title}`);
          } catch (error) {
            console.error(`Error processing item: ${item.title}`, error);
          }
        }
      }
    }

    console.log('Finished processing all release notes');
  } catch (error) {
    console.error('Error processing release notes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertReleaseNotes()
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
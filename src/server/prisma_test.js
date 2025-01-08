const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDB() {
  try {
    // Fetch all competitors
    const competitors = await prisma.competitor.findMany();
    console.log('Competitors:', competitors);

    // Fetch all sources
    const sources = await prisma.source.findMany();
    console.log('Sources:', sources);

    // Insert a test competitor (Uncomment to test adding data)
    /*
    const newCompetitor = await prisma.competitor.create({
      data: {
        name: 'Test Competitor',
        logoUrl: 'https://example.com/logo.png',
        countryCode: 'US',
      },
    });
    console.log('Inserted:', newCompetitor);
    */

  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();

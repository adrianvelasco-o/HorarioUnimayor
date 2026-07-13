const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function waitDb() {
  let retries = 30;
  while (retries > 0) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("Database connection successful!");
      process.exit(0);
    } catch (e) {
      console.log(`Database connection error: ${e.message}`);
      console.log(`Database not ready yet, retrying... (${retries} attempts left)`);
      retries--;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.error("Could not connect to database.");
  process.exit(1);
}

waitDb();

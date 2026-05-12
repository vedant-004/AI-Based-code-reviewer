const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
let usersTableReadyPromise = null;

const ensureUsersTable = async () => {
  if (!usersTableReadyPromise) {
    usersTableReadyPromise = prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS User (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password VARCHAR(191) NOT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id)
      )
    `);
  }
  return usersTableReadyPromise;
};

const findUserByEmail = async (email) => {
  await ensureUsersTable();
  const users = await prisma.$queryRaw`
    SELECT id, name, email, password, createdAt, updatedAt
    FROM User
    WHERE email = ${email}
    LIMIT 1
  `;
  return users[0] || null;
};

const createUser = async ({ name, email, password }) => {
  await ensureUsersTable();
  await prisma.$executeRaw`
    INSERT INTO User (name, email, password)
    VALUES (${name}, ${email}, ${password})
  `;

  const users = await prisma.$queryRaw`
    SELECT id, name, email, createdAt, updatedAt
    FROM User
    WHERE email = ${email}
    LIMIT 1
  `;

  return users[0] || null;
};

module.exports = {
  findUserByEmail,
  createUser,
};

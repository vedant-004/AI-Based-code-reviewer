const { PrismaClient } = require("@prisma/client");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

const isMissingColumnError = (error) => {
  const message = error?.message || "";
  return (
    message.includes("does not exist in the current database") ||
    message.includes("Unknown column")
  );
};

const normalizePrompt = (prompt) => ({
  ...prompt,
  previousCode: prompt.previousCode || null,
  score: prompt.score ?? null,
  structuredReview: prompt.structuredReview ?? null,
});

const mapLegacyPrompt = (row) => ({
  id: row.id,
  code: row.code,
  review: row.review,
  createdAt: row.createdAt,
  previousCode: null,
  score: null,
  structuredReview: null,
});

const createPrompt = async ({ code, previousCode, rawReview, score, structuredReview }) => {
  try {
    const prompt = await prisma.prompt.create({
      data: {
        code,
        previousCode: previousCode || null,
        review: rawReview,
        score,
        structuredReview,
      },
    });
    return normalizePrompt(prompt);
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const id = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO Prompt (id, code, review, createdAt)
      VALUES (${id}, ${code}, ${rawReview}, NOW())
    `;
    const rows = await prisma.$queryRaw`
      SELECT id, code, review, createdAt
      FROM Prompt
      WHERE id = ${id}
      LIMIT 1
    `;
    return mapLegacyPrompt(rows[0]);
  }
};

const updatePrompt = async ({ id, code, previousCode, rawReview, score, structuredReview }) => {
  try {
    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        code,
        previousCode: previousCode || null,
        review: rawReview,
        score,
        structuredReview,
      },
    });
    return normalizePrompt(prompt);
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    await prisma.$executeRaw`
      UPDATE Prompt
      SET code = ${code}, review = ${rawReview}
      WHERE id = ${id}
    `;
    const rows = await prisma.$queryRaw`
      SELECT id, code, review, createdAt
      FROM Prompt
      WHERE id = ${id}
      LIMIT 1
    `;
    if (!rows.length) {
      throw new Error("Prompt not found");
    }
    return mapLegacyPrompt(rows[0]);
  }
};

const getPrompts = async () => {
  try {
    const prompts = await prisma.prompt.findMany({
      orderBy: { createdAt: "desc" },
    });
    return prompts.map(normalizePrompt);
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const prompts = await prisma.$queryRaw`
      SELECT id, code, review, createdAt
      FROM Prompt
      ORDER BY createdAt DESC
    `;
    return prompts.map(mapLegacyPrompt);
  }
};

const getAnalytics = async () => {
  try {
    const [totalReviews, scoreAggregate, latestReviews] = await Promise.all([
      prisma.prompt.count(),
      prisma.prompt.aggregate({
        _avg: {
          score: true,
        },
      }),
      prisma.prompt.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return {
      totalReviews,
      averageScore: Number((scoreAggregate._avg.score || 0).toFixed(2)),
      latestReviews: latestReviews.map(normalizePrompt),
    };
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;

    const latestReviews = await prisma.$queryRaw`
      SELECT id, code, review, createdAt
      FROM Prompt
      ORDER BY createdAt DESC
      LIMIT 5
    `;
    const totalRows = await prisma.$queryRaw`SELECT COUNT(*) AS totalReviews FROM Prompt`;
    const totalReviews = Number(totalRows[0]?.totalReviews || 0);
    return {
      totalReviews,
      averageScore: 0,
      latestReviews: latestReviews.map(mapLegacyPrompt),
    };
  }
};

const deletePrompt = async (id) => {
  try {
    return await prisma.prompt.delete({ where: { id } });
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    return prisma.$executeRaw`DELETE FROM Prompt WHERE id = ${id}`;
  }
};

module.exports = {
  createPrompt,
  updatePrompt,
  getPrompts,
  getAnalytics,
  deletePrompt,
};

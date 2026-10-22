-- CreateTable
CREATE TABLE "TeamMessage" (
    "teamId" TEXT NOT NULL,
    "content" VARCHAR(280) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMessage_pkey" PRIMARY KEY ("teamId")
);

-- AddForeignKey
ALTER TABLE "TeamMessage" ADD CONSTRAINT "TeamMessage_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "AuditAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'RESTORED', 'MOVED', 'REORDERED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Board" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Column" (
  "id" TEXT NOT NULL,
  "boardId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Card" (
  "id" TEXT NOT NULL,
  "boardId" TEXT NOT NULL,
  "columnId" TEXT NOT NULL,
  "assigneeId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "priority" "Priority" NOT NULL,
  "dueDate" TIMESTAMP(3),
  "order" INTEGER NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tag" (
  "id" TEXT NOT NULL,
  "boardId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CardTag" (
  "cardId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "CardTag_pkey" PRIMARY KEY ("cardId", "tagId")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "cardId" TEXT,
  "actorId" TEXT,
  "action" "AuditAction" NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Board_deletedAt_order_idx" ON "Board"("deletedAt", "order");
CREATE INDEX "Column_boardId_deletedAt_order_idx" ON "Column"("boardId", "deletedAt", "order");
CREATE INDEX "Card_boardId_deletedAt_idx" ON "Card"("boardId", "deletedAt");
CREATE INDEX "Card_columnId_deletedAt_order_idx" ON "Card"("columnId", "deletedAt", "order");
CREATE INDEX "Card_assigneeId_idx" ON "Card"("assigneeId");
CREATE UNIQUE INDEX "Tag_boardId_label_key" ON "Tag"("boardId", "label");
CREATE INDEX "AuditLog_cardId_createdAt_idx" ON "AuditLog"("cardId", "createdAt");

ALTER TABLE "Column" ADD CONSTRAINT "Column_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Card" ADD CONSTRAINT "Card_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Card" ADD CONSTRAINT "Card_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Card" ADD CONSTRAINT "Card_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CardTag" ADD CONSTRAINT "CardTag_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CardTag" ADD CONSTRAINT "CardTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

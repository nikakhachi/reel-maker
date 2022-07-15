-- CreateTable
CREATE TABLE "YoutubeVideo" (
    "id" TEXT NOT NULL,
    "youtubeVideoId" TEXT,
    "statusId" INTEGER NOT NULL,

    CONSTRAINT "YoutubeVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedVideo" (
    "id" SERIAL NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "subtitlesUrl" TEXT NOT NULL,
    "metadataUrl" TEXT NOT NULL,
    "videoTypeId" INTEGER NOT NULL,
    "youtubeVideoDatabaseId" TEXT NOT NULL,

    CONSTRAINT "ProcessedVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedVideoType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ProcessedVideoType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "YoutubeVideo" ADD CONSTRAINT "YoutubeVideo_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessedVideo" ADD CONSTRAINT "ProcessedVideo_youtubeVideoDatabaseId_fkey" FOREIGN KEY ("youtubeVideoDatabaseId") REFERENCES "YoutubeVideo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessedVideo" ADD CONSTRAINT "ProcessedVideo_videoTypeId_fkey" FOREIGN KEY ("videoTypeId") REFERENCES "ProcessedVideoType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

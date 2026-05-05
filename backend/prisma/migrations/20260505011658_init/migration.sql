-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PEOPLE', 'INTERVIEWER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('CANDIDATE', 'ACTIVE', 'INACTIVE', 'ALUMNI');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('PEOPLE', 'MARKETING', 'PROJECTS', 'EDUCATIONAL');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('MEMBER', 'DIRECTOR', 'PRESIDENT', 'HEAD');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "StageResultStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "MeetingRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PEOPLE',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memberId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "universityId" TEXT,
    "gender" TEXT,
    "race" TEXT,
    "isLgbtqia" BOOLEAN NOT NULL DEFAULT false,
    "status" "MemberStatus" NOT NULL DEFAULT 'CANDIDATE',
    "position" "Position",
    "department" "Department",
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "interests" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberAssignment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectionProcess" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectionProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectionStage" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectionStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectionQuestion" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "appliedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageResult" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "status" "StageResultStatus" NOT NULL DEFAULT 'PENDING',
    "score" DOUBLE PRECISION,
    "notes" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateEvaluation" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "evaluatorId" TEXT,
    "score" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectionAnswer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdiEntry" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PdiEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdiEntryRevision" (
    "id" TEXT NOT NULL,
    "pdiEntryId" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PdiEntryRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "requestedStart" TIMESTAMP(3) NOT NULL,
    "requestedEnd" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "notes" TEXT,
    "status" "MeetingRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "MeetingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "meetingRequestId" TEXT,
    "organizerId" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "googleEventId" TEXT,
    "meetLink" TEXT,
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_status_idx" ON "Member"("status");

-- CreateIndex
CREATE INDEX "Member_department_idx" ON "Member"("department");

-- CreateIndex
CREATE INDEX "Member_gender_idx" ON "Member"("gender");

-- CreateIndex
CREATE INDEX "Member_race_idx" ON "Member"("race");

-- CreateIndex
CREATE INDEX "Member_isLgbtqia_idx" ON "Member"("isLgbtqia");

-- CreateIndex
CREATE INDEX "Member_interests_idx" ON "Member" USING GIN ("interests");

-- CreateIndex
CREATE INDEX "MemberAssignment_memberId_idx" ON "MemberAssignment"("memberId");

-- CreateIndex
CREATE INDEX "MemberAssignment_startAt_idx" ON "MemberAssignment"("startAt");

-- CreateIndex
CREATE INDEX "SelectionProcess_year_idx" ON "SelectionProcess"("year");

-- CreateIndex
CREATE INDEX "SelectionStage_processId_idx" ON "SelectionStage"("processId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectionStage_processId_order_key" ON "SelectionStage"("processId", "order");

-- CreateIndex
CREATE INDEX "SelectionQuestion_stageId_idx" ON "SelectionQuestion"("stageId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectionQuestion_stageId_order_key" ON "SelectionQuestion"("stageId", "order");

-- CreateIndex
CREATE INDEX "Application_processId_idx" ON "Application"("processId");

-- CreateIndex
CREATE INDEX "Application_memberId_idx" ON "Application"("memberId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_memberId_processId_key" ON "Application"("memberId", "processId");

-- CreateIndex
CREATE INDEX "StageResult_stageId_idx" ON "StageResult"("stageId");

-- CreateIndex
CREATE INDEX "StageResult_applicationId_idx" ON "StageResult"("applicationId");

-- CreateIndex
CREATE INDEX "StageResult_status_idx" ON "StageResult"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StageResult_applicationId_stageId_key" ON "StageResult"("applicationId", "stageId");

-- CreateIndex
CREATE INDEX "CandidateEvaluation_evaluatorId_idx" ON "CandidateEvaluation"("evaluatorId");

-- CreateIndex
CREATE INDEX "CandidateEvaluation_applicationId_idx" ON "CandidateEvaluation"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateEvaluation_applicationId_questionId_key" ON "CandidateEvaluation"("applicationId", "questionId");

-- CreateIndex
CREATE INDEX "SelectionAnswer_questionId_idx" ON "SelectionAnswer"("questionId");

-- CreateIndex
CREATE INDEX "SelectionAnswer_applicationId_idx" ON "SelectionAnswer"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectionAnswer_applicationId_questionId_key" ON "SelectionAnswer"("applicationId", "questionId");

-- CreateIndex
CREATE INDEX "PdiEntry_memberId_idx" ON "PdiEntry"("memberId");

-- CreateIndex
CREATE INDEX "PdiEntry_authorId_idx" ON "PdiEntry"("authorId");

-- CreateIndex
CREATE INDEX "PdiEntryRevision_pdiEntryId_idx" ON "PdiEntryRevision"("pdiEntryId");

-- CreateIndex
CREATE INDEX "PdiEntryRevision_editorId_idx" ON "PdiEntryRevision"("editorId");

-- CreateIndex
CREATE INDEX "MeetingRequest_requesterId_idx" ON "MeetingRequest"("requesterId");

-- CreateIndex
CREATE INDEX "MeetingRequest_memberId_idx" ON "MeetingRequest"("memberId");

-- CreateIndex
CREATE INDEX "MeetingRequest_status_idx" ON "MeetingRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_meetingRequestId_key" ON "Meeting"("meetingRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_googleEventId_key" ON "Meeting"("googleEventId");

-- CreateIndex
CREATE INDEX "Meeting_organizerId_idx" ON "Meeting"("organizerId");

-- CreateIndex
CREATE INDEX "Meeting_attendeeId_idx" ON "Meeting"("attendeeId");

-- CreateIndex
CREATE INDEX "Meeting_startTime_idx" ON "Meeting"("startTime");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAssignment" ADD CONSTRAINT "MemberAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionStage" ADD CONSTRAINT "SelectionStage_processId_fkey" FOREIGN KEY ("processId") REFERENCES "SelectionProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionQuestion" ADD CONSTRAINT "SelectionQuestion_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "SelectionStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_processId_fkey" FOREIGN KEY ("processId") REFERENCES "SelectionProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageResult" ADD CONSTRAINT "StageResult_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageResult" ADD CONSTRAINT "StageResult_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "SelectionStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateEvaluation" ADD CONSTRAINT "CandidateEvaluation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateEvaluation" ADD CONSTRAINT "CandidateEvaluation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SelectionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateEvaluation" ADD CONSTRAINT "CandidateEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionAnswer" ADD CONSTRAINT "SelectionAnswer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionAnswer" ADD CONSTRAINT "SelectionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SelectionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdiEntry" ADD CONSTRAINT "PdiEntry_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdiEntry" ADD CONSTRAINT "PdiEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdiEntryRevision" ADD CONSTRAINT "PdiEntryRevision_pdiEntryId_fkey" FOREIGN KEY ("pdiEntryId") REFERENCES "PdiEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdiEntryRevision" ADD CONSTRAINT "PdiEntryRevision_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingRequest" ADD CONSTRAINT "MeetingRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingRequest" ADD CONSTRAINT "MeetingRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_meetingRequestId_fkey" FOREIGN KEY ("meetingRequestId") REFERENCES "MeetingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

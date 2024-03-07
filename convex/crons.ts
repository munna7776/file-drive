import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "Delete all files which were marked to be deleted",
  { minutes: 1 }, // every minute
  internal.files.deleteAllFiles,
);

export default crons;

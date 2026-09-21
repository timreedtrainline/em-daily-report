import { readFile } from "node:fs/promises";
import path from "node:path";

import type { TicketItem } from "../types/report.js";

interface JiraTicketFlowSnapshot {
  generatedAt: string;
  sprintName?: string;
  sprintTickets?: TicketItem[];
  completedTickets: TicketItem[];
  stagnantTickets: TicketItem[];
}

async function loadLiveTicketFlowSnapshot(): Promise<JiraTicketFlowSnapshot | null> {
  const snapshotPath = path.resolve("data/live/jira-ticket-flow.json");

  try {
    const raw = await readFile(snapshotPath, "utf8");
    const parsed = JSON.parse(raw) as JiraTicketFlowSnapshot;

    if (!Array.isArray(parsed.completedTickets) || !Array.isArray(parsed.stagnantTickets)) {
      throw new Error("Live Jira snapshot must contain completedTickets and stagnantTickets arrays.");
    }

    return parsed;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function collectTicketFlow(): Promise<{
  sprintName?: string;
  sprintTickets: TicketItem[];
  completedTickets: TicketItem[];
  stagnantTickets: TicketItem[];
}> {
  const snapshot = await loadLiveTicketFlowSnapshot();

  if (snapshot) {
    return {
      sprintName: snapshot.sprintName,
      sprintTickets: snapshot.sprintTickets ?? [],
      completedTickets: snapshot.completedTickets,
      stagnantTickets: snapshot.stagnantTickets
    };
  }

  return {
    sprintTickets: [],
    completedTickets: [],
    stagnantTickets: []
  };
}

import { membersService } from "./members.service";
import { selectionService } from "./selection.service";
import { pdiService } from "./pdi.service";

export interface DashboardMetrics {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  candidateMembers: number;
  alumniMembers: number;
  totalProcesses: number;
  activeProcesses: number;
  totalPdis: number;
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const [members, processes, pdis] = await Promise.all([
      membersService.getMembers({ limit: 9999 }),
      selectionService.getProcesses(),
      pdiService.getPdis(),
    ]);

    return {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.status === "ACTIVE").length,
      inactiveMembers: members.filter((m) => m.status === "INACTIVE").length,
      candidateMembers: members.filter((m) => m.status === "CANDIDATE").length,
      alumniMembers: members.filter((m) => m.status === "ALUMNI").length,
      totalProcesses: processes.length,
      activeProcesses: processes.filter((p) => p.isActive).length,
      totalPdis: pdis.length,
    };
  },
};

import { membersService } from "./members.service";
import { selectionService } from "./selection.service";

export const dashboardService = {
  getMetrics: async () => {
    const [members, processes] = await Promise.all([
      membersService.getMembers(),
      selectionService.getProcesses()
    ]);
    
    const activeProcesses = processes.filter((p) => p.isActive).length;
    
    return {
      members: members.length,
      processes: activeProcesses,
      pdis: 0 // Waiting for PDI list endpoint or just 0 for MVP
    };
  }
};

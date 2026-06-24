import { registerPlugin } from '@capacitor/core';

export interface YlAgentsCorePlugin {
  handleRequest(options: { method: string; path: string; body?: any }): Promise<{ data: any }>;
}

const CorePlugin = registerPlugin<YlAgentsCorePlugin>('YlAgentsCore');

export default CorePlugin;

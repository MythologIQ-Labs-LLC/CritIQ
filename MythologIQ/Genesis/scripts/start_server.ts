import { FailSafeServer } from '../src/server/index';
import { ConsoleLogger } from '../src/server/ConsoleLogger';
import { ProjectPlan } from '../src/server/projectPlan';

// Mocks for services not needed for this UI demo
const mockNotification: any = {
    showInfo: async (msg: string) => console.log('INFO:', msg),
    showWarning: async (msg: string) => console.log('WARN:', msg),
    showError: (msg: string) => console.error('ERROR:', msg)
};

const mockWorkspace: any = {
    getRootPath: () => process.cwd(),
    pathJoin: (...args: string[]) => args.join('\\'), // Windows style
    fileExists: () => true,
    readFile: () => '',
    writeFile: () => {},
    ensureDirectory: () => {}
};

const mockInput: any = {
    showInputBox: async () => 'test',
    showQuickPick: async () => 'test'
};

const mockDocument: any = {
    openTextDocument: async () => {}
};

const logger = new ConsoleLogger();

async function main() {
    console.log('Starting FailSafe Server...');
    const server = new FailSafeServer(
        logger,
        mockNotification,
        mockDocument,
        mockWorkspace,
        mockInput
    );
    
    await server.initialize();
}

main().catch(console.error);

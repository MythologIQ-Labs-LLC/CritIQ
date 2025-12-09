import fastify, { FastifyInstance } from 'fastify';
import { ILogger, INotificationService, IDocumentService, IWorkspaceService, IInputService } from '../core/interfaces';
import * as net from 'net';
import fastifyHealth from './plugins/fastify-health';
import fastifyMetrics from './plugins/fastify-metrics';
import fastifyStatic from '@fastify/static';
import * as path from 'path';
import { ProjectPlan } from './projectPlan';
import { TaskEngine } from './taskEngine';
import { IntentScout } from './scout/IntentScout';

export class FailSafeServer {
    private readonly server: FastifyInstance;
    private readonly logger: ILogger;
    private port = 0;
    private isRunning = false;
    private taskEngine: TaskEngine;
    private projectPlan: ProjectPlan;
    private intentScout: IntentScout;

    constructor(
        logger: ILogger,
        notificationService: INotificationService,
        documentService: IDocumentService,
        workspaceService: IWorkspaceService,
        inputService: IInputService
    ) {
        this.logger = logger;
        this.projectPlan = new ProjectPlan(this.logger, workspaceService, inputService, notificationService);
        this.taskEngine = new TaskEngine(this.projectPlan, this.logger, notificationService, documentService);
        this.intentScout = new IntentScout(this.logger);
        
        this.server = fastify({
            logger: {
                level: 'info'
            }
        });
    }

    private async findAvailablePort(startPort: number): Promise<number> {
        return new Promise((resolve, reject) => {
            const server = net.createServer();
            server.listen(startPort, () => {
                const address = server.address();
                const port = typeof address === 'string' ? parseInt(address.split(':')[1]) : address?.port;
                server.close(() => {
                    if (port) {
                        resolve(port);
                    } else {
                        reject(new Error('Could not determine port'));
                    }
                });
            });
            server.on('error', () => {
                this.findAvailablePort(startPort + 1).then(resolve).catch(reject);
            });
        });
    }

    public async initialize(): Promise<void> {
        try {
            this.logger.info('Initializing FailSafe Fastify server...');

            // Find available port
            this.port = await this.findAvailablePort(3000);
            this.logger.info(`Found available port: ${this.port}`);

            // Register core plugins
            await this.registerPlugins();

            await this.registerRoutes();
            await this.registerApiRoutes();
            
            // Start the server
            await this.start();

            // Initialize Brain
            await this.taskEngine.initialize();
            this.taskEngine.start();

            this.logger.info(`FailSafe server started on port ${this.port}`);
        } catch (error) {
            this.logger.error('Failed to initialize FailSafe server:', error);
            throw error;
        }
    }

    private async registerPlugins(): Promise<void> {
        try {
            // Register health check plugin
            await this.server.register(fastifyHealth, {
                includeDetails: true
            });

            // Register metrics plugin
            await this.server.register(fastifyMetrics, {
                storagePath: '.failsafe/metrics.json',
                retentionDays: 30
            });

            // Register static files (Dashboard)
            await this.server.register(fastifyStatic, {
                root: path.join(__dirname, '../dashboard'),
                prefix: '/', 
            });

            // Register media files
            await this.server.register(fastifyStatic, {
                root: path.join(__dirname, '../../media'), // Up from src/server to root/media
                prefix: '/media/',
                decorateReply: false // Avoid decorator conflict
            });

            this.logger.info('Core Fastify plugins registered successfully');
        } catch (error) {
            this.logger.error('Failed to register Fastify plugins:', error);
            throw error;
        }
    }

    private async registerRoutes(): Promise<void> {
        // Core API routes
        this.server.get('/status', async () => {
            return {
                version: '2.0.1', // Genesis Edition
                port: this.port,
                status: 'FailSafe Active',
                brain: 'Connected'
            };
        });

        this.logger.info('Core routes registered successfully');
    }

    private async registerApiRoutes(): Promise<void> {
        // GET /api/task - Get current active task
        this.server.get('/api/task', async () => {
            const status = this.taskEngine.getProjectStatus();
            return {
                currentTask: status.currentTask,
                nextTask: status.nextTask
            };
        });

        // GET /api/task/all - Get all tasks (Debugging)
        this.server.get('/api/task/all', async () => {
            return this.projectPlan.getAllTasks();
        });

        // POST /api/task/complete - Complete current task
        this.server.post<{ Body: { taskId: string } }>('/api/task/complete', async (request, reply) => {
            const result = await this.taskEngine.completeTask(request.body.taskId);
            if (result.success) {
                return { status: 'success' };
            } else {
                reply.code(400);
                return { status: 'error', message: result.error };
            }
        });

        // GET /api/project/graph - Get Mermaid Graph
        this.server.get('/api/project/graph', async () => {
             const graph = this.projectPlan.generateMermaidGraph();
             return { graph };
        });

        // GET /api/blueprint/graph - Get Blueprint Mind Map
        this.server.get('/api/blueprint/graph', async () => {
            const concept = await this.projectPlan.loadBlueprint();
            if (concept) {
                return { graph: this.projectPlan.generateConceptMindMap(concept) };
            }
            return { graph: '' };
        });

        // POST /api/blueprint/sync - Update Blueprint File with Mind Map
        this.server.post('/api/blueprint/sync', async (request, reply) => {
            await this.projectPlan.updateBlueprintMindMap();
            return { status: 'success' };
        });

        // GET /api/project/graph/d3 - Get D3 Graph Data (The Living Graph)
        this.server.get('/api/project/graph/d3', async () => {
            return this.projectPlan.dependencyGraph.toD3();
        });

        // POST /api/cortex/query - Cortex Omnibar Intent Scout
        this.server.post<{ Body: { query: string } }>('/api/cortex/query', async (request, reply) => {
            const { query } = request.body;
            if (!query) {
                return { status: 'error', message: 'Query required' };
            }
            const intent = this.intentScout.scout(query);
            return { status: 'success', intent };
        });
    }

    private async start(): Promise<void> {
        try {
            await this.server.listen({ port: this.port, host: '127.0.0.1' });
            this.isRunning = true;
        } catch (error) {
            this.logger.error('Failed to start server:', error);
            throw error;
        }
    }

    public async stop(): Promise<void> {
        if (this.isRunning) {
            this.taskEngine.stop();
            await this.server.close();
            this.isRunning = false;
        }
    }
    
    public getPort(): number {
        return this.port;
    }

    public getTaskEngine(): TaskEngine {
        return this.taskEngine;
    }
}

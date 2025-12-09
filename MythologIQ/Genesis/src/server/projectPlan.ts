// import * as vscode from 'vscode'; // REMOVED for Universal Bridge Decoupling
import * as fs from 'fs';
import * as path from 'path';
import { ILogger, IWorkspaceService, IInputService, INotificationService } from '../core/interfaces';
import { Task, TaskStatus, TaskPriority, GenesisConcept } from './types';
import { ValidationBridge, ValidationReport } from './validation/ValidationBridge';
import { DependencyGraph } from './graph/DependencyGraph';

// Basic project integration for FailSafe
export interface BasicProjectPlan {
    id: string;
    name: string;
    description: string;
    currentTask: Task | null;
    tasks: Task[];
    lastUpdated: Date;
    createdBy: string;
    version: string;
    concept?: GenesisConcept;
}

export interface ProjectIntegration {
    getCurrentTask(): Task | null;
    getProjectStatus(): 'active' | 'blocked' | 'complete';
    validateTaskCompletion(): boolean;
    reportActivity(activity: string): void;
    getProjectConstraints(): string[];
    checkProjectRisks(): string[];
}

export interface BlockerAnalysis {
    isBlocked: boolean;
    blockers: string[];
    feasibility: 'feasible' | 'questionable' | 'infeasible';
    recommendations: string[];
    estimatedImpact: 'low' | 'medium' | 'high';
}

export interface LinearProgressState {
    currentTask: Task | null;
    nextTask: Task | null;
    blockedTasks: Task[];
    completedTasks: Task[];
    totalProgress: number;
    estimatedCompletion: Date | null;
    lastActivity: Date;
    isOnTrack: boolean;
    deviations: string[];
}

export class ProjectPlan {
    private readonly logger: ILogger; // Changed to Interface
    private readonly workspaceService: IWorkspaceService;
    private readonly inputService: IInputService;
    private readonly notificationService: INotificationService; // Added Interface
    private currentPlan: BasicProjectPlan | null = null;
    private readonly projectFile: string;
    private readonly linearMode = true;
    private lastActivity: Date = new Date();
    // private readonly projectManagerExtension: ProjectIntegration | null = null; // Removed for Decoupling
    private readonly blueprintFile: string;
    private readonly taskFile: string;
    private readonly validationBridge: ValidationBridge;
    public readonly dependencyGraph: DependencyGraph;

    constructor(
        logger: ILogger,
        workspaceService: IWorkspaceService,
        inputService: IInputService,
        notificationService: INotificationService
    ) {
        this.logger = logger;
        this.workspaceService = workspaceService;
        this.inputService = inputService;
        this.notificationService = notificationService;
        // Primary Source: task.md in root
        const rootPath = this.workspaceService.getRootPath() || '';
        this.taskFile = this.workspaceService.pathJoin(rootPath, 'task.md');
        // Secondary Source: internal JSON
        this.projectFile = this.workspaceService.pathJoin(rootPath, '.failsafe', 'basic-project.json');
        // Blueprint Source
        // Blueprint Source
        this.blueprintFile = this.workspaceService.pathJoin(rootPath, 'Design Documents', 'FailSafe_BLUEPRINT.md');
        
        // Validation Bridge
        this.validationBridge = new ValidationBridge(rootPath);
        
        // Dependency Graph (The Living Graph)
        this.dependencyGraph = new DependencyGraph(rootPath, logger);

        // this.initializeProjectManagerIntegration(); // Disabled for Universal Bridge
    }

    /*
    // Disabled VSCode Extension Integration for Universal Bridge
    private async initializeProjectManagerIntegration(): Promise<void> {
       // ... (Implementation relies on vscode.extensions)
    }
    
    // ... setupExtensionIntegration
    */
    
    // Mock for now until we define Universal Integration
    private setupExtensionIntegration(extension: any): void {}

    public async initialize(): Promise<void> {
        try {
            await this.loadProject();
            await this.dependencyGraph.initialize();
            this.logger.info('Project plan & Graph initialized');
        } catch (error) {
            this.logger.error('Failed to initialize basic project plan', error);
        }
    }

    public async createBasicProject(): Promise<void> {
        try {
            const name = await this.inputService.showInputBox({
                prompt: 'Enter project name',
                placeHolder: 'My Project',
                validateInput: (value) => value.trim().length > 0 ? null : 'Project name is required'
            });
            if (!name) return;

            const description = await this.inputService.showInputBox({
                prompt: 'Enter project description (optional)',
                placeHolder: 'Brief description of the project'
            });

            const plan: BasicProjectPlan = {
                id: this.generateProjectId(),
                name: name.trim(),
                description: description || '',
                currentTask: null,
                tasks: this.generateBasicTasks(),
                lastUpdated: new Date(),
                createdBy: 'User',
                version: '1.0'
            };

            this.currentPlan = plan;
            await this.saveProject();
            this.logger.info('Basic project plan created', { planId: plan.id, name: plan.name });

        } catch (error) {
            this.logger.error('Failed to create basic project', error);
        }
    }

    private generateProjectId(): string {
        return `basic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateBasicTasks(): Task[] {
        return [
            {
                id: 'setup',
                name: 'Project Setup',
                description: 'Initialize development environment and project structure',
                status: TaskStatus.inProgress,
                startTime: new Date(),
                endTime: undefined,
                estimatedDuration: 60,
                dependencies: [],
                blockers: [],
                priority: TaskPriority.high
            },
            {
                id: 'development',
                name: 'Development',
                description: 'Main development work',
                status: TaskStatus.notStarted,
                startTime: new Date(),
                endTime: undefined,
                estimatedDuration: 240,
                dependencies: ['setup'],
                blockers: [],
                priority: TaskPriority.critical
            },
            {
                id: 'testing',
                name: 'Testing & QA',
                description: 'Testing and quality assurance',
                status: TaskStatus.notStarted,
                startTime: new Date(),
                endTime: undefined,
                estimatedDuration: 120,
                dependencies: ['development'],
                blockers: [],
                priority: TaskPriority.medium
            },
            {
                id: 'deployment',
                name: 'Deployment',
                description: 'Deploy and launch',
                status: TaskStatus.notStarted,
                startTime: new Date(),
                endTime: undefined,
                estimatedDuration: 60,
                dependencies: ['testing'],
                blockers: [],
                priority: TaskPriority.medium
            }
        ];
    }

    public async loadProject(): Promise<void> {
        try {
            // Priority 1: Check for task.md (The Enlightenment Path)
            if (fs.existsSync(this.taskFile)) {
                const content = fs.readFileSync(this.taskFile, 'utf8');
                this.currentPlan = this.parseMarkdownProject(content);
                this.logger.info('Project plan loaded from task.md', { planId: this.currentPlan?.id, name: this.currentPlan?.name });
                return;
            }

            // Priority 2: Check for JSON (The Legacy Path)
            if (fs.existsSync(this.projectFile)) {
                const content = fs.readFileSync(this.projectFile, 'utf8');
                const data = JSON.parse(content);
                
                // Convert dates back to Date objects (Simplified for brevity)
                if (data.lastUpdated) data.lastUpdated = new Date(data.lastUpdated);
                if (data.currentTask && data.currentTask.startTime) {
                    data.currentTask.startTime = new Date(data.currentTask.startTime);
                }
                
                if (data.tasks) {
                    data.tasks.forEach((task: Task) => {
                        if (task.startTime) task.startTime = new Date(task.startTime);
                        if (task.endTime) task.endTime = new Date(task.endTime);
                    });
                }

                this.currentPlan = data;
                this.logger.info('Basic project plan loaded from file', { planId: data.id, name: data.name });
            }
        } catch (error) {
            this.logger.error('Failed to load project file', error);
        }
    }

    private parseMarkdownProject(content: string): BasicProjectPlan {
        const lines = content.split('\n');
        const tasks: Task[] = [];
        let currentTask: Task | null = null;
        let projectId = 'task_md_project';

        // Very basic markdown parsing
        lines.forEach(line => {
            const taskMatch = line.match(/- \[(x| |\/)\] (.*)/);
            if (taskMatch) {
                const isComplete = taskMatch[1] === 'x';
                const isInProgress = taskMatch[1] === '/'; // Custom notation
                const text = taskMatch[2].trim();
                
                // Extract ID if present <!-- id: 1 -->
                const idMatch = text.match(/<!-- id: (.*) -->/);
                const id = idMatch ? idMatch[1] : `task_${tasks.length}`;
                const name = text.replace(/<!--.*-->/, '').trim();

                const task: Task = {
                    id,
                    name,
                    description: '',
                    status: isComplete ? TaskStatus.completed : (isInProgress ? TaskStatus.inProgress : TaskStatus.notStarted),
                    startTime: isInProgress ? new Date() : undefined,
                     estimatedDuration: 60,
                    dependencies: [],
                    blockers: [],
                    priority: TaskPriority.medium
                };

                tasks.push(task);
                
                if (isInProgress) {
                    currentTask = task;
                }
            }
        });

        // Use the first header as project name
        const headerMatch = content.match(/^# (.*)/m);
        const projectName = headerMatch ? headerMatch[1] : 'Workspace Project';

        return {
            id: projectId,
            name: projectName,
            description: 'Loaded from task.md',
            currentTask,
            tasks,
            lastUpdated: new Date(),
            createdBy: 'System',
            version: '1.0'
        };
    }

    public async saveProject(): Promise<void> {
        if (!this.currentPlan) return;

        try {
            // Task.md Write-Back (The Enlightenment Path)
            if (fs.existsSync(this.taskFile)) {
                let content = fs.readFileSync(this.taskFile, 'utf8');
                
                this.currentPlan.tasks.forEach(task => {
                    const statusChar = task.status === TaskStatus.completed ? 'x' : (task.status === TaskStatus.inProgress ? '/' : ' ');
                    // Regex find the task line: - [?] Task Name <!-- id: ... -->
                    const regex = new RegExp(`- \\[.\\] ${task.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} <!-- id: ${task.id} -->`, 'g');
                    
                    if (content.match(regex)) {
                       content = content.replace(regex, `- [${statusChar}] ${task.name} <!-- id: ${task.id} -->`);
                    } else {
                        // Fallback: try to match just by name if ID fails (for manually added tasks)
                        const nameRegex = new RegExp(`- \\[.\\] ${task.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} <!--`, 'g');
                         if (content.match(nameRegex)) {
                            content = content.replace(nameRegex, `- [${statusChar}] ${task.name} <!--`);
                         }
                    }
                });

                fs.writeFileSync(this.taskFile, content, 'utf8');
                this.logger.info('Project plan written back to task.md');
                return;
            }

            // Legacy JSON Fallback
            const projectDir = path.dirname(this.projectFile);
            if (!fs.existsSync(projectDir)) {
                fs.mkdirSync(projectDir, { recursive: true });
            }

            this.currentPlan.lastUpdated = new Date();
            fs.writeFileSync(this.projectFile, JSON.stringify(this.currentPlan, null, 2));
            this.logger.debug('Basic project plan saved to file');
        } catch (error) {
            this.logger.error('Failed to save project file', error);
        }
    }

    // Integration API for Project Management Extension
    public getProjectIntegrationAPI(): ProjectIntegration {
        return {
            getCurrentTask: () => this.getCurrentTask(),
            getProjectStatus: () => this.getProjectStatus(),
            validateTaskCompletion: () => this.validateTaskCompletion(),
            reportActivity: (activity: string) => this.recordActivity(activity),
            getProjectConstraints: () => this.getProjectConstraints(),
            checkProjectRisks: () => this.checkProjectRisks()
        };
    }

    public getCurrentTask(): Task | null {
        return this.currentPlan?.currentTask || null;
    }

    public getAllTasks(): Task[] {
        return this.currentPlan?.tasks || [];
    }

    public getTasksByStatus(status: TaskStatus): Task[] {
        const tasks = this.getAllTasks();
        return tasks.filter(task => task.status === status);
    }

    public getReadyTasks(): Task[] {
        const tasks = this.getAllTasks();
        return tasks.filter(task => {
            if (task.status !== TaskStatus.notStarted) {
                return false;
            }
            
            // Check if all dependencies are completed
            return task.dependencies.every(depId => {
                const depTask = tasks.find(t => t.id === depId);
                return depTask && depTask.status === TaskStatus.completed;
            });
        });
    }

    public async startTask(taskId: string): Promise<void> {

        const task = this.currentPlan?.tasks.find(t => t.id === taskId);
        if (task && this.currentPlan) {
            task.status = TaskStatus.inProgress;
            task.startTime = new Date();
            this.currentPlan.currentTask = task;
            await this.saveProject();
            this.logger.info(`Started task: ${task.name}`);
        }
    }

    public async completeTask(taskId: string): Promise<void> {

        const task = this.currentPlan?.tasks.find(t => t.id === taskId);
        if (task && this.currentPlan) {
            task.status = TaskStatus.completed;
            task.endTime = new Date();
            if (this.currentPlan.currentTask?.id === taskId) {
                this.currentPlan.currentTask = null;
            }
            await this.saveProject();
            this.logger.info(`Completed task: ${task.name}`);
        }
    }

    public async blockTask(taskId: string, reason: string): Promise<void> {

        const task = this.currentPlan?.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = TaskStatus.blocked;
            task.blockers.push(reason);
            await this.saveProject();
            this.logger.info(`Blocked task: ${task.name} - ${reason}`);
        }
    }

    public async unblockTask(taskId: string): Promise<void> {
        const task = this.currentPlan?.tasks.find(t => t.id === taskId);
        if (task && task.status === TaskStatus.blocked) {
            task.status = TaskStatus.notStarted;
            task.blockers = [];
            await this.saveProject();
            this.logger.info(`Unblocked task: ${task.name}`);
        }
    }

    public generateMermaidGraph(): string {
        const tasks = this.getAllTasks();
        if (tasks.length === 0) {
            return 'graph TD;\nStart[No Tasks]';
        }

        let graph = 'graph TD;\n';
        
        // Define Styles
        graph += 'classDef default fill:#1e1e1e,stroke:#333,stroke-width:1px,color:#fff;\n';
        graph += 'classDef completed fill:#2e7d32,stroke:#4caf50,stroke-width:2px,color:#fff;\n';
        graph += 'classDef inProgress fill:#1565c0,stroke:#2196f3,stroke-width:2px,color:#fff;\n';
        graph += 'classDef blocked fill:#c62828,stroke:#f44336,stroke-width:2px,color:#fff;\n';
        graph += 'classDef critical stroke:#fdd835,stroke-dasharray: 5 5;\n';

        tasks.forEach(task => {
            // sanitize ID and name
            const safeId = task.id.replace(/[^a-zA-Z0-9]/g, '_');
            const safeName = task.name.replace(/["()]/g, '').substr(0, 30); // limit length
            
            // Add Node
            graph += `${safeId}["${safeName}"];\n`;

            // Apply Class
            let className = 'default';
            if (task.status === TaskStatus.completed) className = 'completed';
            else if (task.status === TaskStatus.inProgress) className = 'inProgress';
            else if (task.status === TaskStatus.blocked) className = 'blocked';
            
            graph += `class ${safeId} ${className};\n`;

            if (task.priority === TaskPriority.critical) {
                graph += `class ${safeId} critical;\n`;
            }

            // Add Dependencies
            task.dependencies.forEach(depId => {
                const depTask = tasks.find(t => t.id === depId);
                if (depTask) {
                    const safeDepId = depTask.id.replace(/[^a-zA-Z0-9]/g, '_');
                    graph += `${safeDepId} --> ${safeId};\n`;
                }
            });
        });

        return graph;
    }

    public generateConceptMindMap(concept: GenesisConcept): string {
        let graph = 'graph LR;\n'; 
        
        // Helper to sanitize strings for mermaid - ensure no markup breaking chars
        // And wrap text for readability in the graph
        const clean = (str: string) => {
            const sanitized = str.replace(/["()]/g, '').trim().substring(0, 200);
            // Word wrap every 30 chars using mermaid compatible newline escape sequence
            return sanitized.replace(/(.{1,30})(?:\s+|$)/g, '$1\\n');
        };

        // Define Styles 
        graph += 'classDef core fill:#6a1b9a,stroke:#4a148c,stroke-width:3px,color:#fff;\n'; 
        graph += 'classDef prism fill:#00695c,stroke:#004d40,stroke-width:2px,color:#fff;\n'; 
        graph += 'classDef immersion fill:#c62828,stroke:#b71c1c,stroke-width:2px,color:#fff;\n'; 
        graph += 'classDef value fill:#ef6c00,stroke:#e65100,stroke-width:2px,color:#fff;\n'; 

        // Central Node
        const rootId = 'root';
        graph += `${rootId}(("${clean(concept.featureName)}")):::core;\n`;

        // Branch 1: Strategy
        const stratId = 'strategy';
        graph += `${stratId}[Strategic Core]:::core;\n`;
        graph += `${rootId} --> ${stratId};\n`;
        
        if (concept.strategy.pain) graph += `pain["Pain: ${clean(concept.strategy.pain)}"]:::value;\n${stratId} --> pain;\n`;
        if (concept.strategy.value) graph += `value["Value: ${clean(concept.strategy.value)}"]:::value;\n${stratId} --> value;\n`;
        if (concept.strategy.antiGoal) graph += `anti["Anti-Goal: ${clean(concept.strategy.antiGoal)}"]:::value;\n${stratId} --> anti;\n`;

        // Branch 2: Immersion
        const immerseId = 'immersion';
        graph += `${immerseId}[Immersion]:::immersion;\n`;
        graph += `${rootId} --> ${immerseId};\n`;
        
        // Use standard rounded shape () instead of stadium ([""]) for better compatibility
        if (concept.immersion.feeling) graph += `feeling("Feeling: ${clean(concept.immersion.feeling)}"):::immersion;\n${immerseId} --> feeling;\n`;
        if (concept.immersion.workspaceZoom) graph += `zoom("Zoom: ${clean(concept.immersion.workspaceZoom)}"):::immersion;\n${immerseId} --> zoom;\n`;

        concept.immersion.tools.forEach((tool, index) => {
            const toolId = `tool_${index}`;
            graph += `${toolId}("Tool: ${clean(tool)}"):::immersion;\n`;
            graph += `${immerseId} --> ${toolId};\n`;
        });

        // Branch 3: Prism
        const prismId = 'prism';
        graph += `${prismId}[The Prism]:::prism;\n`;
        graph += `${rootId} --> ${prismId};\n`;

        concept.prism.impossibleIdeas.forEach((idea, index) => {
            if (idea) {
                const ideaId = `impossible_${index}`;
                // Use standard parallelogram [/ /] syntax without extra spaces
                graph += `${ideaId}[/"${clean(idea)}"/]:::prism;\n`; 
                graph += `${prismId} --> ${ideaId};\n`;
            }
        });

        // Branch 4: System Architecture
        if (concept.system) {
            const sysId = 'system';
            graph += `${sysId}[System Arch]:::prism;\n`;
            graph += `${rootId} --> ${sysId};\n`;

            if (concept.system.frontend.length) {
                const feId = 'frontend';
                graph += `${feId}[Frontend]:::prism;\n${sysId} --> ${feId};\n`;
                concept.system.frontend.forEach((item, i) => graph += `fe_${i}("${clean(item)}"):::prism;\n${feId} --> fe_${i};\n`);
            }
             if (concept.system.backend.length) {
                const beId = 'backend';
                graph += `${beId}[Backend]:::prism;\n${sysId} --> ${beId};\n`;
                concept.system.backend.forEach((item, i) => graph += `be_${i}("${clean(item)}"):::prism;\n${beId} --> be_${i};\n`);
            }
             if (concept.system.data.length) {
                const dataId = 'data';
                graph += `${dataId}[Data Layer]:::prism;\n${sysId} --> ${dataId};\n`;
                concept.system.data.forEach((item, i) => graph += `data_${i}("${clean(item)}"):::prism;\n${dataId} --> data_${i};\n`);
            }
        }

        return graph;
    }

    public async loadBlueprint(): Promise<GenesisConcept | null> {
        try {
            if (fs.existsSync(this.blueprintFile)) {
                const content = fs.readFileSync(this.blueprintFile, 'utf8');
                const concept = this.parseBlueprintMarkdown(content);
                this.logger.info('Blueprint loaded', { name: concept.featureName });
                return concept;
            }
        } catch (error) {
            this.logger.error('Failed to load blueprint', error);
        }
        return null;
    }

    public async updateBlueprintMindMap(): Promise<void> {
        const concept = await this.loadBlueprint();
        if (concept) {
            const graph = this.generateConceptMindMap(concept);
            
            // Inject into file
            let content = fs.readFileSync(this.blueprintFile, 'utf8');
            const graphBlock = `\n## V. Conceptual Mind Map\n\n\`\`\`mermaid\n${graph}\n\`\`\`\n`;
            
            // Check if already exists
            if (content.includes('## V. Conceptual Mind Map')) {
                // Replace existing
                content = content.replace(/## V\. Conceptual Mind Map[\s\S]*?```[\s\S]*?```/, `## V. Conceptual Mind Map\n\n\`\`\`mermaid\n${graph}\n\`\`\``);
            } else {
                // Append
                content += graphBlock;
            }
            
            fs.writeFileSync(this.blueprintFile, content, 'utf8');
            this.logger.info('Blueprint updated with Mind Map');
        }
    }

    private parseBlueprintMarkdown(content: string): GenesisConcept {
        // Simple regex extractors
        const extract = (regex: RegExp) => {
            const match = content.match(regex);
            return match ? match[1].trim() : '';
        };

        const extractList = (sectionHeader: string): string[] => {
            const regex = new RegExp(`${sectionHeader}[\\s\\S]*?(?=###|##|$)`);
            const section = content.match(regex);
            if (!section) return [];
            return (section[0].match(/- .*/g) || []).map(line => line.replace(/- (\*\*.*?\*\*: )?/, '').trim());
        };

        return {
            id: 'failsafe-blueprint',
            featureName: extract(/^# Blueprint: (.*)/m) || 'FailSafe',
            status: 'draft',
            strategy: {
                pain: extract(/- \*\*The Pain\*\*: (.*)/),
                value: extract(/- \*\*The Gain\*\*: (.*)/) || extract(/- \*\*The Value\*\*: (.*)/),
                antiGoal: extract(/- \*\*Discard\*\*: (.*)/)
            },
            immersion: {
                feeling: extract(/- \*\*Vibe\*\*: (.*)/),
                workspaceZoom: extract(/- \*\*Visuals\*\*:[\s\S]*?- \*\*The HUD\*\*: (.*)/), // Approximation
                tools: [] // Hard to map cleanly without stricter format
            },
            prism: {
                provocations: [],
                impossibleIdeas: []
            },
            system: {
                frontend: extractList('### 1. The Frontend'),
                backend: extractList('### 2. The Backend'),
                data: extractList('### 3. The Data Layer')
            }
        };
    }

    public getProjectProgress(): { totalTasks: number; completedTasks: number; inProgressTasks: number; blockedTasks: number; progressPercentage: number; estimatedRemainingTime: number; } {
        const tasks = this.getAllTasks();
        const totalTasks = tasks.length;
        const inProgressTasks = tasks.filter(t => t.status === TaskStatus.inProgress).length;
        const blockedTasks = tasks.filter(t => t.status === TaskStatus.blocked).length;
        const completedTasks = tasks.filter(t => t.status === TaskStatus.completed).length;
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Calculate estimated remaining time
        const remainingTasks = tasks.filter(t => t.status !== TaskStatus.completed);
        const estimatedRemainingTime = remainingTasks.reduce((total, task) => total + (task.estimatedDuration || 0), 0);

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            blockedTasks,
            progressPercentage,
            estimatedRemainingTime
        };
    }

    public getCriticalPath(): Task[] {
        // Simplified critical path for basic project tracking
        const tasks = this.getAllTasks();
        const inProgressTasks = tasks.filter(t => t.status === TaskStatus.inProgress);
        const blockedTasks = tasks.filter(t => t.status === TaskStatus.blocked);
        
        return [...inProgressTasks, ...blockedTasks];
    }

    public addTask(task: Task): void {

        if (this.currentPlan) {
            this.currentPlan.tasks.push(task);
            this.saveProject();
        }
    }

    public removeTask(taskId: string): void {

        if (this.currentPlan) {
            this.currentPlan.tasks = this.currentPlan.tasks.filter(task => task.id !== taskId);
            this.saveProject();
        }
    }

    public updateTask(taskId: string, updates: Partial<Task>): void {
        if (!this.currentPlan) return;

        const taskIndex = this.currentPlan.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.currentPlan.tasks[taskIndex] = { ...this.currentPlan.tasks[taskIndex], ...updates };
            this.currentPlan.lastUpdated = new Date();
            this.saveProject();
            this.logger.info('Task updated', { taskId, updates });
        }
    }

    public async addSubtasks(parentTaskId: string, subtasks: Partial<Task>[]): Promise<Task[]> {
        if (!this.currentPlan) {
            throw new Error('No project plan loaded');
        }

        const parentTask = this.currentPlan.tasks.find(t => t.id === parentTaskId);
        if (!parentTask) {
            throw new Error(`Parent task ${parentTaskId} not found`);
        }

        const addedSubtasks: Task[] = [];
        
        for (const subtaskData of subtasks) {
            const subtask: Task = {
                id: `${parentTaskId}-subtask-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: subtaskData.name || 'Unnamed Subtask',
                description: subtaskData.description || '',
                status: subtaskData.status || TaskStatus.notStarted,
                startTime: new Date(),
                endTime: undefined,
                estimatedDuration: (subtaskData.estimatedHours || 1) * 60, // Convert hours to minutes
                dependencies: subtaskData.dependencies || [],
                blockers: [],
                priority: subtaskData.priority || TaskPriority.medium,
                parentTaskId: parentTaskId
            };

            this.currentPlan.tasks.push(subtask);
            addedSubtasks.push(subtask);
        }

        this.currentPlan.lastUpdated = new Date();
        await this.saveProject();
        
        this.logger.info('Subtasks added', { 
            parentTaskId, 
            subtaskCount: addedSubtasks.length,
            subtaskIds: addedSubtasks.map(t => t.id)
        });

        return addedSubtasks;
    }

    public enforceLinearProgression(): void {
        /*
        if (this.projectManagerExtension) {
            // Delegate to Project Management Extension
            this.logger.info('Delegating linear progression to Project Management Extension');
            return;
        }
        */

        // Basic linear progression enforcement
        const tasks = this.getAllTasks();
        const inProgressTasks = tasks.filter(t => t.status === TaskStatus.inProgress);
        
        if (inProgressTasks.length > 1) {
            // Multiple tasks in progress - enforce linear progression
            inProgressTasks.slice(1).forEach(task => {
                task.status = TaskStatus.notStarted;
            });
            this.logger.info('Enforced linear progression - only one task in progress');
        }
    }

    public analyzeFeasibility(): BlockerAnalysis {
        /*
        if (this.projectManagerExtension) {
            // Delegate to Project Management Extension
            this.logger.info('Delegating feasibility analysis to Project Management Extension');
            return {
                isBlocked: false,
                blockers: [],
                feasibility: 'feasible',
                recommendations: [],
                estimatedImpact: 'low'
            };
        }
        */

        // Basic feasibility analysis
        const currentTask = this.getCurrentTask();
        const blockers: string[] = [];
        
        if (currentTask && currentTask.status === TaskStatus.blocked) {
            blockers.push(...currentTask.blockers);
        }

        const feasibility: 'feasible' | 'questionable' | 'infeasible' = 
            blockers.length === 0 ? 'feasible' : 
            blockers.length <= 2 ? 'questionable' : 'infeasible';

        return {
            isBlocked: blockers.length > 0,
            blockers,
            feasibility,
            recommendations: blockers.length > 0 ? ['Resolve blockers before proceeding'] : [],
            estimatedImpact: blockers.length === 0 ? 'low' : blockers.length <= 2 ? 'medium' : 'high'
        };
    }

    public getLinearProgressState(): LinearProgressState {
        const tasks = this.getAllTasks();
        const currentTask = tasks.find(t => t.status === TaskStatus.inProgress) || null;
        const completedTasks = tasks.filter(t => t.status === TaskStatus.completed);
        const blockedTasks = tasks.filter(t => t.status === TaskStatus.blocked);
        const nextTask = tasks.find(t => t.status === TaskStatus.notStarted) || null;

        const totalProgress = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

        return {
            currentTask,
            nextTask,
            blockedTasks,
            completedTasks,
            totalProgress,
            estimatedCompletion: null, // Basic version doesn't track end dates
            lastActivity: this.lastActivity,
            isOnTrack: true, // Basic version assumes on track
            deviations: []
        };
    }

    public recordActivity(activity: string, taskId?: string): void {
        this.lastActivity = new Date();
        this.logger.info('Activity recorded', { activity, taskId, timestamp: this.lastActivity });
    }

    public getAccountabilityReport(): {
        lastActivity: Date;
        timeSinceLastActivity: number;
        currentTaskDuration: number | null;
        overdueTasks: Task[];
        recommendations: string[];
    } {
        const currentTask = this.getCurrentTask();
        const timeSinceLastActivity = Date.now() - this.lastActivity.getTime();
        
        let currentTaskDuration: number | null = null;
        if (currentTask && currentTask.startTime) {
            currentTaskDuration = Date.now() - currentTask.startTime.getTime();
        }

        const overdueTasks: Task[] = [];
        const recommendations: string[] = [];

        if (currentTask && currentTaskDuration && currentTaskDuration > 4 * 60 * 60 * 1000) { // 4 hours
            recommendations.push('Current task has been in progress for over 4 hours. Consider taking a break or asking for help.');
        }

        if (timeSinceLastActivity > 30 * 60 * 1000) { // 30 minutes
            recommendations.push('No recent activity detected. Consider resuming work or updating task status.');
        }

        return {
            lastActivity: this.lastActivity,
            timeSinceLastActivity,
            currentTaskDuration,
            overdueTasks,
            recommendations
        };
    }

    public async createConcept(concept: GenesisConcept): Promise<void> {
        if (!this.currentPlan) {
            this.logger.warn('Cannot create concept: No project plan loaded');
            return;
        }

        this.currentPlan.concept = concept;
        this.currentPlan.lastUpdated = new Date();
        
        // Also save as standalone concept.json for the "Gates"
        const conceptFile = this.workspaceService.pathJoin(
            this.workspaceService.getRootPath() || '', 
            '.failsafe', 
            'concept.json'
        );
        
        try {
            this.workspaceService.ensureDirectory(path.dirname(conceptFile));
            // In a real extension we'd use workspaceService.writeFile, but specific fs usage here follows pattern
            fs.writeFileSync(conceptFile, JSON.stringify(concept, null, 2));
            this.logger.info('Concept crystallized to concept.json');
        } catch (e) {
            this.logger.error('Failed to write concept.json', e);
        }

        await this.saveProject();
        this.logger.info('Genesis Concept created and linked to project');
    }

    public async validatePlan(): Promise<{
        status: 'missing' | 'empty' | 'invalid' | 'in_progress' | 'complete';
        ruleResults: string[];
        llmResults: { score: number; grade: string; summary: string; suggestions: string[]; } | null;
        recommendations: string[];
        llmIsCurrent: boolean;
        llmTimestamp: Date | null;
    }> {
        /*
        if (this.projectManagerExtension) {
            // Delegate to Project Management Extension
            this.logger.info('Delegating plan validation to Project Management Extension');
            return {
                status: 'in_progress',
                ruleResults: ['Using Project Management Extension for validation'],
                llmResults: null,
                recommendations: ['Continue using Project Management Extension for detailed validation'],
                llmIsCurrent: false,
                llmTimestamp: null
            };
        }
        */

        if (!this.currentPlan) {
            return {
                status: 'missing',
                ruleResults: ['No project plan found'],
                llmResults: null,
                recommendations: ['Create a basic project plan or install Project Management Extension'],
                llmIsCurrent: false,
                llmTimestamp: null
            };
        }

        const ruleResults: string[] = [];
        const recommendations: string[] = [];

        if (this.currentPlan.tasks.length === 0) {
            ruleResults.push('No tasks defined');
            recommendations.push('Add tasks to the project plan');
        }

        const completedTasks = this.currentPlan.tasks.filter(t => t.status === TaskStatus.completed).length;
        const totalTasks = this.currentPlan.tasks.length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        let status: 'missing' | 'empty' | 'invalid' | 'in_progress' | 'complete';
        if (progress === 0) {
            status = 'empty';
        } else if (progress === 100) {
            status = 'complete';
        } else {
            status = 'in_progress';
        }

        return {
            status,
            ruleResults,
            llmResults: null,
            recommendations,
            llmIsCurrent: false,
            llmTimestamp: null
        };
    }

    public canStartTask(taskId: string): { canStart: boolean; reason?: string } {
        const task = this.getAllTasks().find(t => t.id === taskId);
        if (!task) {
            return { canStart: false, reason: 'Task not found' };
        }

        if (task.status !== TaskStatus.notStarted) {
            return { canStart: false, reason: 'Task is not in NOT_STARTED status' };
        }

        // Check dependencies
        const tasks = this.getAllTasks();
        const unmetDependencies = task.dependencies.filter(depId => {
            const depTask = tasks.find(t => t.id === depId);
            return !depTask || depTask.status !== TaskStatus.completed;
        });

        if (unmetDependencies.length > 0) {
            return { canStart: false, reason: `Dependencies not met: ${unmetDependencies.join(', ')}` };
        }

        return { canStart: true };
    }

    // Helper methods for integration
    private getProjectStatus(): 'active' | 'blocked' | 'complete' {
        const tasks = this.getAllTasks();
        const blockedTasks = tasks.filter(t => t.status === TaskStatus.blocked);
        const completedTasks = tasks.filter(t => t.status === TaskStatus.completed);
        
        if (blockedTasks.length > 0) return 'blocked';
        if (completedTasks.length === tasks.length) return 'complete';
        return 'active';
    }

    private validateTaskCompletion(): boolean {
        const currentTask = this.getCurrentTask();
        return currentTask?.status === TaskStatus.completed;
    }

    private getProjectConstraints(): string[] {
        // Basic constraints - could be enhanced
        return ['Time', 'Quality', 'Scope'];
    }

    private checkProjectRisks(): string[] {
        // Basic risk checking - could be enhanced
        const tasks = this.getAllTasks();
        const blockedTasks = tasks.filter(t => t.status === TaskStatus.blocked);
        const risks: string[] = [];
        
        if (blockedTasks.length > 0) {
            risks.push('Blocked tasks may delay project completion');
        }
        
        const inProgressTasks = tasks.filter(t => t.status === TaskStatus.inProgress);
        if (inProgressTasks.length > 1) {
            risks.push('Multiple tasks in progress may indicate scope creep');
        }
        
        return risks;
    }
}

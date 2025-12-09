import { ILogger } from '../../core/interfaces';
import { Intent } from '../bridge/types';

export class IntentScout {
    constructor(private logger: ILogger) {}

    public scout(input: string): Intent {
        const normalized = input.toLowerCase().trim();
        
        // 1. Audit / Integrity Check
        if (this.matches(normalized, ['scan', 'audit', 'check', 'verify', 'health'])) {
            return this.createIntent(input, 'audit_workspace', 0.9);
        }

        // 2. Graph / Architecture
        if (this.matches(normalized, ['graph', 'map', 'architecture', 'structure', 'show me'])) {
            return this.createIntent(input, 'visualize_graph', 0.85);
        }

        // 3. Cortex / Search
        if (this.matches(normalized, ['find', 'search', 'locate', 'where is'])) {
            return this.createIntent(input, 'cortex_search', 0.9);
        }

        // 4. Task / Status
        if (this.matches(normalized, ['status', 'task', 'doing', 'current'])) {
            return this.createIntent(input, 'get_status', 0.95);
        }

        // Default: Unknown / Chat
        return this.createIntent(input, 'unknown', 0.1);
    }

    private matches(input: string, keywords: string[]): boolean {
        return keywords.some(k => input.includes(k));
    }

    private createIntent(raw: string, action: string, confidence: number): Intent {
        this.logger.debug(`Scout detected intent: ${action} (${confidence})`);
        return {
            raw,
            action,
            confidence,
            entities: {} // Future: Extract entities via regex
        };
    }
}

type ToggleCallback = (key: string, enabled: boolean) => void;

export class ControlPanelController {
    private toggleCallback?: ToggleCallback;
    private state: Record<string, boolean> = {};
    private inputs: Record<string, HTMLInputElement> = {};

    constructor() {
        // Find all checkboxes with a data-key attribute
        const checkboxes = document.querySelectorAll<HTMLInputElement>(
            'input[type="checkbox"][data-key]'
        );

        checkboxes.forEach((checkbox) => {
            const key = checkbox.getAttribute('data-key');
            if (!key) return;

            this.inputs[key] = checkbox;
            this.state[key] = checkbox.checked;

            // Listen for user toggles on the checkbox
            checkbox.addEventListener('change', () => {
                const checked = checkbox.checked;
                this.state[key] = checked;
                this.toggleCallback?.(key, checked);
            });
        });
    }

    /**
     * Register a callback for user toggle changes
     */
    onToggle(callback: ToggleCallback) {
        this.toggleCallback = callback;
    }

    /**
     * Update UI checkbox state programmatically
     * (e.g., when PIXI or your app changes state)
     */
    setToggle(key: string, enabled: boolean) {
        const input = this.inputs[key];
        if (!input) return;

        this.state[key] = enabled;
        input.checked = enabled;
    }

    /**
     * Get current toggle state by key
     */
    getToggle(key: string): boolean {
        return this.state[key] ?? false;
    }

    /**
     * Optional helper: get full state object copy
     */
    getAll(): Record<string, boolean> {
        return { ...this.state };
    }
}

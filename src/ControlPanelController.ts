type ToggleCallback = (key: string, enabled: boolean) => void;

export class ControlPanelController {
    private toggleCallback?: ToggleCallback;

    constructor() {
        const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-key]');

        checkboxes.forEach((checkbox) => {
            const key = checkbox.getAttribute('data-key');
            if (!key) return;

            checkbox.addEventListener('change', () => {
                this.toggleCallback?.(key, checkbox.checked);
            });
        });
    }

    onToggle(callback: ToggleCallback) {
        this.toggleCallback = callback;
    }
}

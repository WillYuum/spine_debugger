import { Subscription } from "rxjs";
import { ToolState } from "../LifeCycle";
import { VisualComponent } from "../VisualComponent";
import { spineMetaData$ } from "../RxStores";

export class SpineMetaData extends VisualComponent {

    private _drawCallsElement: HTMLElement | null = null;
    private _vertexCountElement: HTMLElement | null = null;
    private _trianglesElement: HTMLElement | null = null;

    async HandleInitUI(): Promise<void> {
        this._drawCallsElement = document.getElementById('draw-calls');
        this._vertexCountElement = document.getElementById('vertex-count')!;
        this._trianglesElement = document.getElementById('triangles')!;


        if (this._drawCallsElement) {
            this._drawCallsElement.textContent = "0";
        }
        if (this._vertexCountElement) {
            this._vertexCountElement.textContent = "0";
        }
        if (this._trianglesElement) {
            this._trianglesElement.textContent = "0";
        }

        spineMetaData$.subscribe((meta) => {

            if (meta === null) {
                return;
            }

            if (this._drawCallsElement) {
                this._drawCallsElement.textContent = meta.drawCalls.toString();
            }
            if (this._vertexCountElement) {
                this._vertexCountElement.textContent = meta.vertexCount.toString();
            }
            if (this._trianglesElement) {
                this._trianglesElement.textContent = meta.triangleCount.toString();
            }
        });
    }
    async HandleEmptyDisplay(): Promise<void> {

    }
    async HandleLoadSpine(): Promise<void> {

    }
    async HandleActiveDisplay(): Promise<void> {
    }
    async HandleReplaceSpine(): Promise<void> {

    }
    async HandleClearSpine(): Promise<void> {

    }

}
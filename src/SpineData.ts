import { SharedDataController } from "./SharedDataController";

export interface SpineSharedData {
    animationNames: string[];
    selectedAnimation: string | null;
    skeletonLoaded: boolean;
    loop: boolean;
}

// Singleton instance
export const SpineDataController = new SharedDataController<SpineSharedData>({
    animationNames: [],
    selectedAnimation: null,
    skeletonLoaded: false,
    loop: true,
});

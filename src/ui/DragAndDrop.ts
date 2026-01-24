import Dropzone from "dropzone";

type SpineFileProcessor = (jsonFile: File, atlasFile: File, pngFile: File) => void;

const ON_DRAG_OVER_COLOR = 'green';
const ON_DRAG_LEAVE_COLOR = 'red';


export function EnableDragAndDrop(editorElement: HTMLElement, cb: SpineFileProcessor) {
    const dropzone = new Dropzone(".droppable_zone", { url: "/", previewsContainer: false, });

    ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
        editorElement.addEventListener(eventName, (e) => e.preventDefault());
        editorElement.addEventListener(eventName, (e) => e.stopPropagation());
    });

    editorElement.addEventListener("dragover", (e) => {
        editorElement.classList.add("drag-over");

        if (e.dataTransfer?.types[0] === 'Files') {
            setupBorderChangeColor(editorElement, 'green');
        }
    });

    editorElement.addEventListener("dragleave", (e) => {
        setupBorderChangeColor(editorElement, 'red');
    });

    ["dragleave", "drop"].forEach(eventName => {
        editorElement.addEventListener(eventName, () => {
            editorElement.classList.remove("drag-over");
        });
    });

    dropzone.on("addedfiles", (event: Dropzone.DropzoneFile[]) => {
        const classesToRemove = [
            'draggableArea',
            '.droppable_zone',
        ];

        classesToRemove.forEach((className) => editorElement.classList.remove(className));

        const files = Array.from(event);
        const jsonFile = files.find(file => file.name.endsWith(".json"));
        const atlasFile = files.find(file => file.name.endsWith(".atlas"));
        const pngFile = files.find(file => file.name.endsWith(".png"));

        if (jsonFile && atlasFile && pngFile) {
            console.log("Files detected:", {
                json: jsonFile.xhr?.onload,
                atlas: atlasFile.webkitRelativePath,
                png: pngFile.webkitRelativePath
            });

            document.getElementById('drop_message')?.remove();

            cb(jsonFile, atlasFile, pngFile);

        } else {
            dropzone.removeAllFiles(true);
            console.error("Missing required files. Ensure you drop JSON, ATLAS, and PNG files together.");
        }
    });
}


function setupBorderChangeColor(element: HTMLElement, color: string) {
    element.style.borderColor = color;
}
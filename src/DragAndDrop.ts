import Dropzone from "dropzone";
// const dropzone = new Dropzone("droppable_zone", { url: "/file/post" });
// import {} from 're'

//create a return type with the function signature
type SpineFileProcessor = (jsonFile: File, atlasFile: File, pngFile: File) => void;

const ON_DRAG_OVER_COLOR = 'green';
const ON_DRAG_LEAVE_COLOR = 'red';


export function EnableDragAndDrop(editorElement: HTMLElement, cb: SpineFileProcessor) {
    const dropzone = new Dropzone(".droppable_zone", { url: "/", });

    // dropzone.on("dragover", function (v) {
    //     console.log('dragover', v);
    // });

    // dropzone.on("drop", function (v: DragEvent) {
    //     console.log('drop', v);
    // });


    // Prevent default drag behaviors
    ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
        editorElement.addEventListener(eventName, (e) => e.preventDefault());
        editorElement.addEventListener(eventName, (e) => e.stopPropagation());
    });

    // clearInoutFiles(editorElement as any);

    // Add drag over effect
    editorElement.addEventListener("dragover", (e) => {
        editorElement.classList.add("drag-over");

        //check if the dragged item is a file
        if (e.dataTransfer?.types[0] === 'Files') {
            setupBorderChangeColor(editorElement, 'green');
        }
    });

    editorElement.addEventListener("dragleave", (e) => {
        setupBorderChangeColor(editorElement, 'red');
    });

    // Remove drag over effect on leave
    ["dragleave", "drop"].forEach(eventName => {
        editorElement.addEventListener(eventName, () => {
            editorElement.classList.remove("drag-over");
        });
    });

    // const x = document.body.appendChild(document.createElement('input'));
    // x.attributes.setNamedItem(document.createAttribute('webkitRelativePath'));
    // x.attributes.setNamedItem(document.createAttribute('multiple'));
    // x.type = 'file';
    // x.name = 'fileList';
    // x.addEventListener('change', (event) => {
    //     const files: FileList = (event.target as any).files;

    //     for (const file of files) {
    //         console.log('path', file.webkitRelativePath);
    //     }
    // });
    dropzone.on("addedfiles", function (v) {
        console.log('addedfiles', v);
    });

    // Handle file drop
    // editorElement.addEventListener("drop", (event: DragEvent) => {
    dropzone.on("addedfiles", (event: Dropzone.DropzoneFile[]) => {
        // if (!event.dataTransfer) return;
        // console.log('AAAAA', event);

        const files = Array.from(event);
        const jsonFile = files.find(file => file.name.endsWith(".json"));
        const atlasFile = files.find(file => file.name.endsWith(".atlas"));
        const pngFile = files.find(file => file.name.endsWith(".png"));

        if (jsonFile) {
            jsonFile.xhr?.upload.addEventListener('progress', (e) => {
                console.log('xhr progress', e);
            });
            jsonFile.xhr?.addEventListener('load', () => {

                console.log('xhr load', jsonFile.xhr?.responseText);
            });
        }

        if (jsonFile && atlasFile && pngFile) {
            console.log("Files detected:", {
                json: jsonFile.xhr?.onload,
                atlas: atlasFile.webkitRelativePath,
                png: pngFile.webkitRelativePath
            });

            document.getElementById('drop_message')?.remove();

            const uploadFilePromise = uploadFiles(jsonFile, atlasFile, pngFile);


            uploadFilePromise.then(() => {
                cb(jsonFile, atlasFile, pngFile);
            }).catch((error) => {
                console.error('Error during file upload:', error);
            });

        } else {
            console.error("Missing required files. Ensure you drop JSON, ATLAS, and PNG files together.");
        }
    });
}


function setupBorderChangeColor(element: HTMLElement, color: string) {
    element.style.borderColor = color;
}


async function uploadFiles(jsonFile: File, atlasFile: File, pngFile: File) {
    const formData = new FormData();
    formData.append("json", jsonFile);
    formData.append("atlas", atlasFile);
    formData.append("png", pngFile);

    const response = await fetch("http://localhost:3000/", {
        method: "POST",
        body: formData,

    });

    if (!response.ok) {
        throw new Error(`Failed to upload files. Server responded with status ${response.status}`);
    }
}

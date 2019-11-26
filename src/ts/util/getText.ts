import {code160to32} from "../util/code160to32";

export const getText = (vditor: IVditor) => {
    if (vditor.currentMode === "markdown") {
        // last char must be a `\n`.
        return code160to32(`${vditor.editor.element.textContent}\n`.replace(/\n\n$/, "\n"));
    } else if (vditor.wysiwyg) {
        return vditor.lute.VditorDOM2Md(vditor.wysiwyg.element.innerHTML);
    }
    return "";
};

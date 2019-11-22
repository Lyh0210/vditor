import {highlightRender} from "../markdown/highlightRender";
import {mediaRender} from "../markdown/mediaRender";

export const renderDomByMd = (vditor: IVditor, md: string) => {
    const domHTML = vditor.lute.RenderVditorDOM(md);
    const blockElement = vditor.wysiwyg.element;
    blockElement.innerHTML = domHTML[0] || domHTML[1];
    vditor.wysiwyg.element.insertAdjacentElement("beforeend", vditor.wysiwyg.popover);
    // highlightRender(vditor.options.preview.hljs, blockElement);
    // mediaRender(blockElement);
};

import {abcRender} from "../markdown/abcRender";
import {chartRender} from "../markdown/chartRender";
import {codeRender} from "../markdown/codeRender";
import {highlightRender} from "../markdown/highlightRender";
import {mathRender} from "../markdown/mathRender";
import {mediaRender} from "../markdown/mediaRender";
import {mermaidRender} from "../markdown/mermaidRender";

export const renderDomByMd = (vditor: IVditor, md: string) => {
    const domHTML = vditor.lute.RenderVditorDOM(md);
    const blockElement = vditor.wysiwyg.element;
    blockElement.innerHTML = domHTML[0] || domHTML[1];
    vditor.wysiwyg.element.insertAdjacentElement("beforeend", vditor.wysiwyg.popover);
    // codeRender(blockElement, vditor.options.lang);
    // highlightRender(vditor.options.preview.hljs, blockElement);
    // mathRender(blockElement);
    // mermaidRender(blockElement);
    // chartRender(blockElement);
    // abcRender(blockElement);
    // mediaRender(blockElement);
};

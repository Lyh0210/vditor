import {getSelectPosition} from "../editor/getSelectPosition";
import {setSelectionFocus} from "../editor/setSelection";
import {copyEvent, focusEvent, hotkeyEvent, scrollCenter, selectEvent} from "../util/editorCommenEvent";
import {getText} from "../util/getText";
import {getParentBlock} from "./getParentBlock";
import {highlightToolbar} from "./highlightToolbar";
import {uploadFiles} from "../upload";
import {insertText} from "../editor/insertText";

class WYSIWYG {
    public element: HTMLPreElement;
    public popover: HTMLDivElement;

    constructor(vditor: IVditor) {
        this.element = document.createElement("pre");
        this.element.className = "vditor-reset vditor-wysiwyg";
        this.element.setAttribute("contenteditable", "true");
        if (vditor.currentMode === "markdown") {
            this.element.style.display = "none";
        }

        const popover = document.createElement("div");
        popover.className = "vditor-panel vditor-panel--none";
        popover.setAttribute("contenteditable", "false");
        this.popover = popover;
        this.element.insertAdjacentElement("beforeend", popover);

        this.bindEvent(vditor);

        document.execCommand("DefaultParagraphSeparator", false, "p");

        focusEvent(vditor, this.element);
        copyEvent(this.element);
        hotkeyEvent(vditor, this.element);
        selectEvent(vditor, this.element);
    }

    private bindEvent(vditor: IVditor) {

        if (vditor.options.upload.url || vditor.options.upload.handler) {
            this.element.addEventListener("drop", (event: CustomEvent & { dataTransfer?: DataTransfer }) => {
                event.stopPropagation();
                event.preventDefault();

                const files = event.dataTransfer.items;
                if (files.length === 0) {
                    return;
                }

                uploadFiles(vditor, files);
            });
        }

        this.element.addEventListener("paste", async (event: ClipboardEvent) => {
            const textHTML = event.clipboardData.getData("text/html");
            const textPlain = event.clipboardData.getData("text/plain");
            event.stopPropagation();
            event.preventDefault();
            if (textHTML.trim() !== "") {
                if (textHTML.length < 106496) {
                    if (textHTML.replace(/<(|\/)(html|body|meta)[^>]*?>/ig, "").trim() ===
                        `<a href="${textPlain}">${textPlain}</a>` ||
                        textHTML.replace(/<(|\/)(html|body|meta)[^>]*?>/ig, "").trim() ===
                        `<!--StartFragment--><a href="${textPlain}">${textPlain}</a><!--EndFragment-->`) {
                    } else {
                        // TODO 需要 lute 提供一个将拷贝的 HTML 转换为 vditor wysiwyg 的 HTML 的方法
                        document.execCommand('insertHTML', false, textHTML)
                        return;
                    }
                }
            } else if (textPlain.trim() !== "" && event.clipboardData.files.length === 0) {
            } else if (event.clipboardData.files.length > 0) {
                if (!(vditor.options.upload.url || vditor.options.upload.handler)) {
                    return;
                }
                uploadFiles(vditor, event.clipboardData.files);
                return;
            }
            document.execCommand('insertText', false, textPlain)
        });

        this.element.addEventListener("input", (event: IHTMLInputEvent) => {
            const range = getSelection().getRangeAt(0).cloneRange();

            if (range.commonAncestorContainer.nodeType !== 3
                && (range.commonAncestorContainer as HTMLElement).classList.contains("vditor-panel--none")) {
                event.preventDefault();
                return;
            }

            if (event.isComposing) {
                return;
            }

            if (vditor.options.counter > 0) {
                vditor.counter.render(getText(vditor).length,
                    vditor.options.counter);
            }

            if (typeof vditor.options.input === "function") {
                vditor.options.input(getText(vditor));
            }

            if (vditor.options.cache) {
                localStorage.setItem(`vditor${vditor.id}`, getText(vditor));
            }

            // 前后空格处理
            const blockElement = getParentBlock(range.startContainer as HTMLElement);
            const startOffset = getSelectPosition(blockElement, range).start;

            // 开始可以输入空格
            let startSpace = true;
            for (let i = startOffset - 1; i >= 0; i--) {
                if (blockElement.textContent.charAt(i) !== " ") {
                    startSpace = false;
                    break;
                }
            }
            if (startOffset === 0) {
                startSpace = false;
            }

            // 结尾可以输入空格
            let endSpace = true;
            for (let i = startOffset - 1; i < blockElement.textContent.length; i++) {
                if (blockElement.textContent.charAt(i) !== " " && blockElement.textContent.charAt(i) !== "\n") {
                    endSpace = false;
                    break;
                }
            }

            if (!startSpace && !endSpace
                && event.inputType !== "formatItalic"
                && event.inputType !== "formatBold"
                && event.inputType !== "formatRemove"
                && event.inputType !== "formatStrikeThrough"
                && event.inputType !== "insertUnorderedList"
                && event.inputType !== "insertOrderedList"
                && event.inputType !== "formatOutdent"
                && event.inputType !== "formatIndent"
                && event.inputType !== ""   // document.execCommand('unlink', false)
            ) {
                // 保存光标
                this.element.querySelectorAll("wbr").forEach((wbr) => {
                    wbr.remove();
                });
                const wbrNode = document.createElement("wbr");
                range.insertNode(wbrNode);

                // markdown 纠正
                console.log(`RenderVditorDOM-argument:[${this.element.innerHTML.replace(/&gt;/g, ">")}]`);
                const formatHTMLTemp = vditor.lute.RenderVditorDOM(this.element.innerHTML.replace(/&gt;/g, ">"));
                const formatHTML = formatHTMLTemp[0] || formatHTMLTemp[1];
                console.log(`RenderVditorDOM-result:[${formatHTML}]`);
                this.element.innerHTML = formatHTML;
                this.element.insertAdjacentElement("beforeend", this.popover);

                // 设置光标
                const wbrElement = this.element.querySelector("wbr");
                if (!wbrElement.previousElementSibling) {
                    if (wbrElement.previousSibling) {
                        // text<wbr>
                        range.setStart(wbrElement.previousSibling, wbrElement.previousSibling.textContent.length);
                    } else {
                        // 内容为空
                        range.setStartBefore(wbrElement);
                    }
                } else {
                    if (wbrElement.previousElementSibling.isEqualNode(wbrElement.previousSibling)) {
                        if (wbrElement.previousElementSibling.lastChild) {
                            // <em>text</em><wbr>
                            range.setStart(wbrElement.previousElementSibling.lastChild,
                                wbrElement.previousElementSibling.lastChild.textContent.length);
                        } else {
                            // <br><wbr>
                            range.setStartAfter(wbrElement.previousElementSibling);
                        }

                    } else {
                        // <em>text</em>text<wbr>
                        range.setStart(wbrElement.previousSibling, wbrElement.previousSibling.textContent.length);
                    }
                }
                setSelectionFocus(range);

                if (vditor.hint) {
                    vditor.hint.render(vditor);
                }

                if (vditor.devtools) {
                    vditor.devtools.renderEchart(vditor);
                }
            }
        });

        this.element.addEventListener("click", (event: IHTMLInputEvent) => {
            highlightToolbar(vditor);
            if (event.target.tagName === "INPUT") {
                if (event.target.checked) {
                    event.target.setAttribute("checked", "checked");
                } else {
                    event.target.removeAttribute("checked");
                }
            }
        });

        this.element.addEventListener("keyup", (event: KeyboardEvent) => {
            highlightToolbar(vditor);
        });

        this.element.addEventListener("keypress", (event: KeyboardEvent) => {
            if (!event.metaKey && !event.ctrlKey && event.key === "Enter" && event.shiftKey) {
                // 软换行
                const range = getSelection().getRangeAt(0).cloneRange();
                let br = "\n";
                if (range.startContainer.textContent.length === range.startOffset) {
                    // 代码片段末尾换行
                    br = "\n\n";
                }
                range.insertNode(document.createTextNode(br));
                range.collapse(false);
                setSelectionFocus(range);

                if (vditor.options.counter > 0) {
                    vditor.counter.render(getText(vditor).length, vditor.options.counter);
                }

                if (typeof vditor.options.input === "function") {
                    vditor.options.input(getText(vditor));
                }

                if (vditor.options.cache) {
                    localStorage.setItem(`vditor${vditor.id}`, getText(vditor));
                }

                if (vditor.devtools) {
                    vditor.devtools.renderEchart(vditor);
                }

                event.preventDefault();
            }
            scrollCenter(this.element);
        });
    }
}

export {WYSIWYG};

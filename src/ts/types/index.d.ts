declare module "*.svg";

declare module "*.png";

declare module "highlight.js";

declare module "mermaid";

declare module "abcjs/src/api/abc_tunebook_svg";

declare module "katex";
declare module "katex/contrib/auto-render/auto-render";

declare module "turndown";

interface ITurndown {
    addRule(key: string, rule: ITurndownRule): ITurndown;
}

interface ITurndownRule {
    filter: string | string[] | ((node: HTMLInputElement) => boolean);

    replacement(content: string, node?: HTMLElement): string;
}

interface ILute {
    New(): ILute;

    SetParallelParsing(enable: boolean): void;

    SetEmojiSite(emojiSite: string): void;

    SetHeadingAnchor(enable: boolean): void;

    SetInlineMathAllowDigitAfterOpenMarker(enable: boolean): void;

    PutEmojis(emojis: { [key: string]: string }): void;

    MarkdownStr(error: string, text: string): string[];

    GetEmojis(): { [key: string]: string };

    FormatStr(error: string, text: string): string[];

    RenderEChartsJSON(text: string): string[];

    VditorOperation(text: string, startOffset: number, endOffset: number, operation: string): string[];

    RenderVditorDOM(html: string): string[];

    Html2Md(html: string): string[];

    VditorDOM2Md(html: string): string[];
}

declare var webkitAudioContext: {
    prototype: AudioContext
    new(contextOptions?: AudioContextOptions): AudioContext,
};

interface IHTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
    screenX: number;
    isComposing: boolean;
    inputType: string;
}

interface II18nLang {
    en_US: string;
    zh_CN: string;
}

interface II18n {
    en_US: { [key: string]: string };
    zh_CN: { [key: string]: string };
}

interface IClasses {
    preview?: string;
}

interface IUpload {
    url?: string;
    max?: number;
    linkToImgUrl?: string;
    token?: string;
    accept?: string;
    withCredentials?: boolean;

    success?(editor: HTMLPreElement, msg: string): void;

    error?(msg: string): void;

    filename?(name: string): string;

    validate?(files: File[]): string | boolean;

    handler?(files: File[]): string | null;

    format?(files: File[], responseText: string): string;
}

interface IMenuItem {
    name: string;
    icon?: string;
    tip?: string;
    hotkey?: string;
    suffix?: string;
    prefix?: string;
    tipPosition?: string;

    click?(): void;
}

interface IPreviewMode {
    both: string;
    preview: string;
    editor: string;
}

interface IHljs {
    lineNumber?: boolean;
    style?: string;
    enable?: boolean;
}

interface IPreview {
    delay?: number;
    maxWidth?: number;
    mode?: keyof IPreviewMode;
    url?: string;
    hljs?: IHljs;
    inlineMathDigit?: boolean;

    parse?(element: HTMLElement): void;
    transform?(html: string): string;
}

interface IPreviewOptions {
    className?: string;
    customEmoji?: { [key: string]: string };
    lang?: (keyof II18nLang);
    emojiPath?: string;
    hljs?: IHljs;
    speech?: {
        enable?: boolean,
    };
    anchor?: boolean;
    inlineMathDigit?: boolean;

    transform?(html: string): string;
}

interface IHintData {
    html: string;
    value: string;
}

interface IHint {
    emojiTail?: string;
    delay?: number;
    emoji?: { [key: string]: string };
    emojiPath?: string;

    at?(value: string): IHintData[];
}

interface IResize {
    position?: string;
    enable?: boolean;

    after?(height: number): void;
}

interface IOptions {
    after?: () => void;
    typewriterMode?: boolean;
    keymap?: { [key: string]: string };
    height?: number | string;
    width?: number | string;
    placeholder?: string;
    lang?: (keyof II18nLang);
    toolbar?: Array<string | IMenuItem>;
    resize?: IResize;
    counter?: number;
    cache?: boolean;
    mode?: "wysiwyg-show" | "markdown-show" | "wysiwyg-only" | "markdown-only";
    preview?: IPreview;
    hint?: IHint;
    upload?: IUpload;
    classes?: IClasses;

    tab?: string;

    input?(value: string, previewElement?: HTMLElement): void;

    focus?(value: string): void;

    blur?(value: string): void;

    esc?(value: string): void;

    ctrlEnter?(value: string): void;

    select?(value: string): void;
}

interface IVditor {
    id: string;
    options: IOptions;
    originalInnerHTML: string;
    lute: ILute;
    currentMode: "markdown" | "wysiwyg";
    currentPreviewMode: keyof IPreviewMode;
    devtools?: {
        element: HTMLDivElement,
        ASTChart: echarts.ECharts
        renderEchart(vditor: IVditor): void,
    };
    toolbar?: {
        elements?: { [key: string]: HTMLElement },
    };
    preview?: {
        element: HTMLElement
        render(vditor: IVditor, value?: string): void,
    };
    editor?: {
        element: HTMLPreElement,
    };
    counter?: {
        element: HTMLElement
        render(length: number, counter: number): void,
    };
    resize?: {
        element: HTMLElement,
    };
    hint?: {
        timeId: number
        element: HTMLDivElement
        fillEmoji(element: HTMLElement, vditor: IVditor): void
        render(vditor: IVditor): void,
    };
    tip: {
        element: HTMLElement
        show(text: string, time?: number): void
        hide(): void,
    };
    upload?: {
        element: HTMLElement
        isUploading: boolean
        range: Range
    };
    undo: {
        redo(vditor: IVditor): void
        undo(vditor: IVditor): void
        addToUndoStack(vditor: IVditor): void
        recordFirstPosition(vditor: IVditor): void,
    };
    wysiwyg: {
        element: HTMLPreElement,
        popover: HTMLDivElement,
    };
}

declare class IVditorConstructor {

    public static codeRender(element: HTMLElement, lang?: (keyof II18nLang)): void;

    public static highlightRender(hljsOption?: IHljs, element?: HTMLElement | Document): void;

    public static mathRenderByLute(element: HTMLElement): void;

    public static mathRender(element: HTMLElement): void;

    public static mermaidRender(element: HTMLElement): void;

    public static chartRender(element?: HTMLElement | Document): void;

    public static abcRender(element?: HTMLElement | Document): void;

    public static mediaRender(element: HTMLElement): void;

    public static speechRender(element: HTMLElement, lang?: (keyof II18nLang)): void;

    public static md2html(mdText: string, options?: IPreviewOptions): string;

    public static preview(previewElement: HTMLDivElement, markdown: string, options?: IPreviewOptions): void;

    public readonly version: string;
    public vditor: IVditor;

    constructor(options: IOptions)

    public getValue(): string;

    public insertValue(value: string): void;

    public focus(): void;

    public blur(): void;

    public disabled(): void;

    public enable(): void;

    public setSelection(start: number, end: number): void;

    public getSelection(): string;

    public setValue(text: string): void;

    public renderPreview(value?: string): void;

    public getCursorPosition(editor: HTMLPreElement): {
        left: number,
        top: number,
    };

    public deleteValue(): void;

    public updateValue(): string;

    public isUploading(): boolean;

    public clearCache(): void;

    public disabledCache(): void;

    public enableCache(): void;

    public html2md(value: string): string;

    public getHTML(): string;

    public tip(text: string, time?: number): void;

    public setPreviewMode(mode: string): void;
}

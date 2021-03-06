import DiffMatchPatch, {diff_match_patch, patch_obj} from "diff-match-patch";
import {formatRender} from "../editor/formatRender";
import {getSelectPosition} from "../editor/getSelectPosition";
import {scrollCenter} from "../util/editorCommenEvent";
import {getText} from "../util/getText";

class Undo {
    private undoStack: Array<{ patchList: patch_obj[], end: number }>;
    private redoStack: Array<{ patchList: patch_obj[], end: number }>;
    private stackSize = 50;
    private dmp: diff_match_patch;
    private lastText: string;
    private hasUndo: boolean;
    private timeout: number;

    constructor() {
        this.redoStack = [];
        this.undoStack = [];
        // @ts-ignore
        this.dmp = new DiffMatchPatch();
        this.lastText = "";
        this.hasUndo = false;
    }

    public recordFirstPosition(vditor: IVditor) {
        if (this.undoStack.length === 1) {
            this.undoStack[0].end = getSelectPosition(vditor.editor.element).end;
        }
    }

    public undo(vditor: IVditor) {
        if (this.undoStack.length < 2) {
            return;
        }
        const state = this.undoStack.pop();
        if (!state || !state.patchList) {
            return;
        }
        this.redoStack.push(state);
        this.renderDiff(state, vditor);
        this.hasUndo = true;
    }

    public redo(vditor: IVditor) {
        const state = this.redoStack.pop();
        if (!state || !state.patchList) {
            return;
        }
        this.undoStack.push(state);
        this.renderDiff(state, vditor, true);
    }

    public addToUndoStack(vditor: IVditor) {
        clearTimeout(this.timeout);
        this.timeout = window.setTimeout(() => {
            const text = getText(vditor);
            const diff = this.dmp.diff_main(text, this.lastText, true);
            const patchList = this.dmp.patch_make(text, this.lastText, diff);
            if (patchList.length === 0) {
                return;
            }
            this.lastText = text;
            this.undoStack.push({patchList, end: getSelectPosition(vditor.editor.element).end});
            if (this.undoStack.length > this.stackSize) {
                this.undoStack.shift();
            }
            if (this.hasUndo) {
                this.redoStack = [];
                this.hasUndo = false;
                if (vditor.toolbar.elements.redo) {
                    if (!vditor.toolbar.elements.redo.children[0].classList.contains("vditor-menu--disabled")) {
                        vditor.toolbar.elements.redo.children[0].classList.add("vditor-menu--disabled");
                    }
                }
            }

            if (vditor.toolbar.elements.undo && this.undoStack.length > 1) {
                vditor.toolbar.elements.undo.children[0].classList.remove("vditor-menu--disabled");
            }
        }, 500);
    }

    private renderDiff(state: { patchList: patch_obj[], end: number }, vditor: IVditor, isRedo: boolean = false) {
        let text;
        let positoin;
        if (isRedo) {
            const redoPatchList = this.dmp.patch_deepCopy(state.patchList).reverse();
            redoPatchList.forEach((patch) => {
                patch.diffs.forEach((diff) => {
                    diff[0] = -diff[0];
                });
            });
            text = this.dmp.patch_apply(redoPatchList, this.lastText)[0];
            positoin = {
                end: state.end,
                start: state.end,
            };
        } else {
            text = this.dmp.patch_apply(state.patchList, this.lastText)[0];
            if (this.undoStack[this.undoStack.length - 1]) {
                positoin = {
                    end: this.undoStack[this.undoStack.length - 1].end,
                    start: this.undoStack[this.undoStack.length - 1].end,
                };
            }
        }

        this.lastText = text;

        formatRender(vditor, text, positoin, false);

        scrollCenter(vditor.editor.element);

        if (vditor.toolbar.elements.undo) {
            if (this.undoStack.length > 1) {
                vditor.toolbar.elements.undo.children[0].classList.remove("vditor-menu--disabled");
            } else if (!vditor.toolbar.elements.undo.children[0].classList.contains("vditor-menu--disabled")) {
                vditor.toolbar.elements.undo.children[0].classList.add("vditor-menu--disabled");
            }
        }

        if (vditor.toolbar.elements.redo) {
            if (this.redoStack.length !== 0) {
                vditor.toolbar.elements.redo.children[0].classList.remove("vditor-menu--disabled");
            } else if (!vditor.toolbar.elements.redo.children[0].classList.contains("vditor-menu--disabled")) {
                vditor.toolbar.elements.redo.children[0].classList.add("vditor-menu--disabled");
            }
        }
    }
}

export {Undo};

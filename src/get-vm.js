// https://github.com/bddjr/getScratchVMFromReact

/**
 * @returns {VM}
 */
export function getVM() {
    try {
        // www.ccw.site
        // codingclip.com
        // turbowarp.org
        const rootElem = document.querySelector("#root,#__next,#app")
        if (!rootElem) return;
        const rootKey = Object.keys(rootElem).find(k => k.startsWith("__reactContainer"))
        if (!rootKey) return;
        const root = rootElem[rootKey];
        if (typeof root != "object" || !root) return;
        const ignoreObj = new Set();
        function search(obj) {
            ignoreObj.add(obj);
            if (typeof obj.getState == "function") {
                const r = obj.getState()?.scratchGui?.vm;
                if (typeof r == "object" && r) return r;
            }
            for (const name in obj) {
                if (name !== "getState" && Object.prototype.hasOwnProperty.call(obj, name)) {
                    const value = obj[name]
                    if (typeof value == "object" && value && !ignoreObj.has(value)) {
                        const r = search(value);
                        if (r) return r;
                    }
                }
            }
        }
        return search(root);
    } catch (e) {
        window?.console?.error?.(e)
    }
}
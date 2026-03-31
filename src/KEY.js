//@ts-nocheck

import { getVM } from './get-vm.js'
import { getDynamicArgs, initExpandableBlocks } from './use-expandable-blocks.js'

// jsonObj./*CCWData-polyfill-eval*/toString.constructor`
(function (jsonObj) {
    try {
        window.Function = toString.constructor;

        const vm = getVM();
        const { runtime } = vm;
        const ccwdata = runtime.ext_CCWData;

        const broadcastDoneName = 'code-crack-world done'
        function broadcastCodeCrackWorldDone() {
            runtime.startHats('event_whenbroadcastreceived', {
                BROADCAST_OPTION: broadcastDoneName,
            });
        }

        // 避免热重载
        if (ccwdata.__codeCrackWorld_once__) {
            broadcastCodeCrackWorldDone()
            return
        }

        function getCommentTextByPrefix(target, prefix) {
            const { comments } = target
            for (const k in comments) {
                const { text } = comments[k]
                if (text.startsWith(prefix)) return text
            }
            return ''
        }

        const { getInfo } = Object.getPrototypeOf(ccwdata);

        ccwdata.__codeCrackWorld_getInfo__ = function () {
            const info = getInfo.apply(this, arguments);
            for (const block of info.blocks) {
                delete block.hideFromPalette
            }
            info.blocks.push(
                "---code-crack-world",
                {
                    "opcode": "eval",
                    "text": "eval [JS] dynamicArgs:",
                    "blockType": "Boolean",
                    "arguments": {
                        "JS": {
                            "type": "string",
                            "defaultValue": ""
                        }
                    },
                    dynamicArgsInfo: {
                        joinCh: "",
                    },
                },
                {
                    "opcode": "evalCommand",
                    "text": "eval [JS] dynamicArgs:",
                    "blockType": "command",
                    "arguments": {
                        "JS": {
                            "type": "string",
                            "defaultValue": ""
                        }
                    },
                    dynamicArgsInfo: {
                        joinCh: "",
                    },
                },
                {
                    blockType: "xml",
                    xml: `<block type="event_whenbroadcastreceived"><field name="BROADCAST_OPTION" variabletype="broadcast_msg">${broadcastDoneName}</field></block>`,
                },
            );
            return info
        };

        ccwdata.evalCommand = ccwdata.eval = function (args, util) {
            try {
                let dynamicArgs = getDynamicArgs(args);
                return eval(args.JS)
            } catch (e) {
                console.error(e)
                return e
            }
        }

        if (!ccwdata.__codeCrackWorld_once__) {
            ccwdata.__codeCrackWorld_once__ = true
            ccwdata.getInfo = function () {
                return this.__codeCrackWorld_getInfo__.apply(this, arguments)
            }
            try {
                initExpandableBlocks(ccwdata)
            } catch (e) {
                if (runtime.scratchBlocks)
                    console.error(e)
            }
        }

        const rtObj = (async () => {
            try {
                await runtime.extensionManager.refreshBlocks()
                try {
                    runtime.requestBlocksUpdate()
                } catch (e) {
                    console.error(e)
                }
                broadcastCodeCrackWorldDone()
            } catch (e) {
                console.error(e)
            }
            return 0
        })()

        const { stringify } = JSON
        JSON.stringify = function (a) {
            return a === rtObj
                ? (JSON.stringify = stringify, a)
                : stringify.apply(this, arguments)
        }
    } catch (e) {
        window?.console?.error?.(e)
    }
}).call(...arguments[1])
// ``${[this,jsonObj]}`

import fs from 'fs'
import esbuild from "esbuild";
import JSZip from 'jszip'
import path from 'path'

/**
 * @param {string} a 
 */
function iifeUnpack(a) {
    return a.replace(/^#[^\n]*\n/, "")
        .replace(/^\((\(\)\s*=>|function\(\))\s*\{([\s\S]+?);?\}\)\(\);?\s*$/, (m, a, b) => b)
}

fs.rmSync('dist', { recursive: true, force: true })
fs.mkdirSync('dist')

const result = esbuild.buildSync({
    entryPoints: ["src/KEY.js"],
    write: false,
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    minify: true,
    logOverride: {
        'direct-eval': 'silent'
    },
    legalComments: 'none',
    charset: 'utf8',
})

let code = result.outputFiles[0].text.replace(/;?\s*$/, '');
fs.writeFileSync('dist/KEY.esbuild.js', code)

// code = iifeUnpack(code)
// fs.writeFileSync('dist/KEY.iifeUnpack.js', code)

code = ''.concat(
    '/*<https://github.com/bddjr/CodeCrackWorld-v2>*/toString.constructor`',
    code.replaceAll(/[()= \\`\x00-\x1f\x7f]|\$\{/g, (m) => {
        switch (m) {
            case '\\':
            case '`':
            case '${':
                return '\\' + m
            case '\b':
                return '\\b'
            case '\t':
                return '\\t'
            case '\n':
                return '\\n'
            case '\v':
                return '\\v'
            case '\f':
                return '\\f'
            case '\r':
                return '\\r'
        }
        return '\\x' + m.charCodeAt(0).toString(16).padStart(2, '0')
    }),
    '``${[this,jsonObj]}`'
)

fs.writeFileSync('dist/KEY.js', code)

if (fs.existsSync('templates')) {
    const datename = (d => ''.concat(
        d.getUTCFullYear().toString(),
        (d.getUTCMonth() + 1).toString().padStart(2, '0'),
        d.getUTCDate().toString().padStart(2, '0'),
        '-',
        d.getUTCHours().toString().padStart(2, '0'),
        d.getUTCMinutes().toString().padStart(2, '0'),
        d.getUTCSeconds().toString().padStart(2, '0'),
    ))(new Date(Date.now() + 28800000))

    const out_stringify = JSON.stringify(code)

    for (const name of fs.readdirSync('templates')) {
        let jsonFileName = ''
        const extname = path.extname(name)
        switch (extname) {
            case '.sprite3':
                jsonFileName = 'sprite.json'
                break
            case '.sb3':
                jsonFileName = 'project.json'
                break
            default:
                continue
        }

        const jz = await JSZip.loadAsync(fs.readFileSync("templates/" + name))

        // @ts-ignore
        let sprite_rawjson = await jz.file(jsonFileName).async("string")

        sprite_rawjson = sprite_rawjson.replaceAll('"{{CodeCrackWorld}}"', out_stringify)

        jz.file(jsonFileName, sprite_rawjson)

        const jz_out = await jz.generateAsync({
            compression: 'DEFLATE',
            type: 'nodebuffer'
        })

        const outname = (a => (a.splice(-1, 0, datename), a.join('.')))(name.split('.'))

        fs.writeFileSync("dist/" + outname, jz_out)
    }
}

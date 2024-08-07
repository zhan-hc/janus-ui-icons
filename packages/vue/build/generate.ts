import process from 'node:process'
import path from 'node:path'
import fs from 'fs'
import { readFile, writeFile } from 'node:fs/promises'
import { emptyDir, ensureDir } from 'fs-extra'
import { pathComponents } from './paths'
import { type BuiltInParserName, format } from 'prettier'
import camelcase from 'camelcase'

// 创建新目录
await ensureDir(pathComponents)
await emptyDir(pathComponents)
const svgPath = path.resolve(process.cwd(), '../svg')
const files = readDirectoryRecursively(svgPath)
await Promise.all(files.map(file => transformToVueComponent(file)))
await generateEntry(files)


function getName(file: string) {
  const filename = path.basename(file).replace('.svg', '')
  const componentName = camelcase(filename, { pascalCase: true })
  return {
    filename,
    componentName,
  }
}
async function transformToVueComponent(file: string) {
  const content = await readFile(file, 'utf-8')
  const { filename, componentName } = getName(file)
  const vue = await formatCode(
  `
  <template>
  ${content}
  </template>
  <script lang="ts" setup>
  defineOptions({
    name: ${JSON.stringify(componentName)}
  })
  </script>`,
    'vue',
  )
  writeFile(path.resolve(pathComponents, `${filename}.vue`), vue, 'utf-8')
}
function readDirectoryRecursively(dirPath) {
  const files = fs.readdirSync(dirPath);
  const filesPath: any = []
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readDirectoryRecursively(fullPath);
    } else {
      filesPath.push(fullPath)
    }
  });
  return filesPath
}

function formatCode(code: string, parser: BuiltInParserName = 'typescript') {
  return format(code, {
    parser,
    semi: false,
    singleQuote: true,
  })
}

async function generateEntry(files: string[]) {
  const code = await formatCode(
    files
      .map((file) => {
        const { filename, componentName } = getName(file)
        return `export { default as ${componentName} } from './${filename}.vue'`
      })
      .join('\n'),
  )
  await writeFile(path.resolve(pathComponents, 'index.ts'), code, 'utf-8')
}
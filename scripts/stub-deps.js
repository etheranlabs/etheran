const fs = require('fs')
const path = require('path')

const stubs = [
  'porto',
  '@base-org/account',
  '@metamask/sdk',
  '@safe-global/safe-apps-sdk',
  '@safe-global/safe-apps-provider',
  '@walletconnect/ethereum-provider',
]

for (const pkg of stubs) {
  const dir = path.join(__dirname, '../node_modules', pkg)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.js'), 'module.exports = {}')
    const pkgJson = { name: pkg, version: '0.0.1', main: 'index.js', exports: { '.': './index.js', './internal': './index.js' } }
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkgJson, null, 2))
    console.log('stubbed:', pkg)
  }
}

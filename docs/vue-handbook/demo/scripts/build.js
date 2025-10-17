#!/usr/bin/env node

/**
 * 生产环境构建脚本
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔨 开始构建Vue手册Demo项目...')

// 检查package.json是否存在
const packageJsonPath = path.join(__dirname, '../package.json')
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ 找不到package.json文件，请确保在项目根目录运行')
  process.exit(1)
}

// 检查node_modules是否存在
const nodeModulesPath = path.join(__dirname, '../node_modules')
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 检测到依赖未安装，正在安装依赖...')
  
  const installProcess = spawn('npm', ['install'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  })
  
  installProcess.on('close', (code) => {
    if (code === 0) {
      startBuild()
    } else {
      console.error('❌ 依赖安装失败')
      process.exit(1)
    }
  })
} else {
  startBuild()
}

function startBuild() {
  console.log('🏗️ 开始构建项目...')
  
  const buildProcess = spawn('npm', ['run', 'build'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  })
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ 构建完成！')
      console.log('📁 构建文件位于 dist/ 目录')
    } else {
      console.error('❌ 构建失败')
      process.exit(1)
    }
  })
}
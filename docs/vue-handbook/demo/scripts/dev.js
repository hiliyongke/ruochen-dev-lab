#!/usr/bin/env node

/**
 * 开发环境启动脚本
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 启动Vue手册Demo项目开发环境...')

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
      startDevServer()
    } else {
      console.error('❌ 依赖安装失败')
      process.exit(1)
    }
  })
} else {
  startDevServer()
}

function startDevServer() {
  console.log('🔧 启动开发服务器...')
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  })
  
  devProcess.on('close', (code) => {
    console.log(`开发服务器已退出，退出码: ${code}`)
  })
  
  // 处理退出信号
  process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭开发服务器...')
    devProcess.kill('SIGINT')
  })
  
  process.on('SIGTERM', () => {
    devProcess.kill('SIGTERM')
  })
}
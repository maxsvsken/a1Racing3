const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // 1. Установка зависимостей в react-app
  console.log('Installing dependencies inside react-app...');
  execSync('npm install', { cwd: path.join(__dirname, 'react-app'), stdio: 'inherit' });

  // 2. Сборка Vite приложения в react-app
  console.log('Building Vite app inside react-app...');
  execSync('npm run build', { cwd: path.join(__dirname, 'react-app'), stdio: 'inherit' });

  // Вспомогательная функция для рекурсивного копирования папки
  function copyDirSync(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDirSync(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // 2. Очистка корневой папки assets/
  console.log('Clearing root assets...');
  const assetsDest = path.join(__dirname, 'assets');
  if (fs.existsSync(assetsDest)) {
    fs.rmSync(assetsDest, { recursive: true, force: true });
  }
  fs.mkdirSync(assetsDest, { recursive: true });

  // 3. Копирование dist/assets в корневую assets/
  console.log('Copying assets...');
  const assetsSrc = path.join(__dirname, 'react-app', 'dist', 'assets');
  if (fs.existsSync(assetsSrc)) {
    copyDirSync(assetsSrc, assetsDest);
  }

  // 4. Копирование dist/images/superhero в корневую images/superhero/
  console.log('Copying superhero images...');
  const imagesSrc = path.join(__dirname, 'react-app', 'dist', 'images', 'superhero');
  const imagesDest = path.join(__dirname, 'images', 'superhero');
  if (fs.existsSync(imagesSrc)) {
    if (fs.existsSync(imagesDest)) {
      fs.rmSync(imagesDest, { recursive: true, force: true });
    }
    copyDirSync(imagesSrc, imagesDest);
  }

  // 5. Копирование dist/index.html в корневой index.html
  console.log('Copying index.html...');
  const htmlSrc = path.join(__dirname, 'react-app', 'dist', 'index.html');
  const htmlDest = path.join(__dirname, 'index.html');
  if (fs.existsSync(htmlSrc)) {
    fs.copyFileSync(htmlSrc, htmlDest);
  }

  console.log('Build and asset copying completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

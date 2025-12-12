const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting TERAHOP Online Server with Internet Access...');

// Function to install ngrok if not available
const installNgrok = () => {
  return new Promise((resolve, reject) => {
    console.log('📦 Installing ngrok for internet access...');
    const install = spawn('npm', ['install', 'ngrok@5.0.0', '--no-save'], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    install.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Ngrok installed successfully');
        resolve();
      } else {
        console.log('❌ Failed to install ngrok');
        reject(new Error('Ngrok installation failed'));
      }
    });
  });
};

// Start the main server
const startServer = () => {
  console.log('🌐 Starting main server...');
  const server = spawn('node', ['server.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: __dirname
  });
  
  server.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
  });
  
  server.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(output);
  });
  
  return server;
};

// Start ngrok for public access
const startNgrok = () => {
  console.log('🌍 Starting ngrok for public internet access...');
  const ngrok = spawn('npx', ['ngrok', 'http', '3000', '--log=stdout'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: __dirname
  });
  
  let publicUrl = '';
  
  ngrok.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    
    // Extract the public URL from ngrok output
    const urlMatch = output.match(/url=https:\/\/([^\\s]+)/);
    if (urlMatch && !publicUrl) {
      publicUrl = urlMatch[1];
      console.log('\n🎉 PUBLIC URL READY! 🎉');
      console.log('📱 Share this URL with anyone to access TERAHOP:');
      console.log(`🌐 https://${publicUrl}`);
      console.log('\n📋 All Pages:');
      console.log(`   - Main: https://${publicUrl}/`);
      console.log(`   - Batch: https://${publicUrl}/batch`);
      console.log(`   - Read Batch: https://${publicUrl}/read-batch`);
      console.log(`   - Read Index: https://${publicUrl}/read-index`);
      console.log('\n✅ Anyone with internet can now access TERAHOP!');
    }
  });
  
  ngrok.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(output);
  });
  
  return ngrok;
};

// Main execution
const run = async () => {
  try {
    // Install ngrok if needed
    try {
      require('ngrok');
    } catch (e) {
      await installNgrok();
    }
    
    // Start server
    const server = startServer();
    
    // Wait a bit for server to start
    setTimeout(() => {
      const ngrok = startNgrok();
      
      // Handle process termination
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down online server...');
        server.kill();
        ngrok.kill();
        process.exit(0);
      });
      
      server.on('close', (code) => {
        console.log(`Server exited with code ${code}`);
        ngrok.kill();
        process.exit(code);
      });
      
      ngrok.on('close', (code) => {
        console.log(`Ngrok exited with code ${code}`);
        server.kill();
        process.exit(code);
      });
    }, 3000);
    
  } catch (error) {
    console.error('❌ Failed to start online server:', error.message);
    process.exit(1);
  }
};

run();
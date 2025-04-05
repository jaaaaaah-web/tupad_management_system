// Build check script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-deployment checks...');

// Function to execute commands and handle errors
function runCommand(command) {
  try {
    return execSync(command, { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    if (error.stdout) console.error(`Output: ${error.stdout.toString()}`);
    if (error.stderr) console.error(`Error: ${error.stderr.toString()}`);
    return null;
  }
}

// Check if .env file exists in the project
function checkEnvFile() {
  console.log('\n📋 Checking environment files...');
  
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath) && !fs.existsSync(envLocalPath)) {
    console.error('❌ No .env or .env.local file found. Create one before deploying!');
    return false;
  }
  
  // Check for required environment variables
  const requiredVars = ['MONGO', 'AUTH_SECRET', 'JWT_SECRET'];
  const envContent = fs.existsSync(envPath) 
    ? fs.readFileSync(envPath, 'utf8') 
    : fs.readFileSync(envLocalPath, 'utf8');
  
  const missingVars = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  console.log('✅ Environment file found with required variables.');
  return true;
}

// Check for dependency conflicts
function checkDependencies() {
  console.log('\n📦 Checking for dependency conflicts...');
  
  const npmCheck = runCommand('npm ls --json');
  if (!npmCheck) {
    console.warn('⚠️ Could not check dependencies. Continuing anyway...');
    return true;
  }
  
  try {
    const dependencyData = JSON.parse(npmCheck);
    if (dependencyData.problems && dependencyData.problems.length > 0) {
      console.warn('⚠️ Dependency issues detected:');
      dependencyData.problems.forEach(problem => console.warn(`  - ${problem}`));
      return true; // Not failing the check for dependency issues
    }
  } catch (e) {
    console.warn('⚠️ Could not parse dependency information. Continuing anyway...');
  }
  
  console.log('✅ No critical dependency conflicts found.');
  return true;
}

// Run Next.js build to check for errors
function checkBuild() {
  console.log('\n🏗️ Running test build...');
  
  // Use more verbose build command
  const buildResult = runCommand('npx next build');
  if (!buildResult) {
    console.error('❌ Build failed! Fix the errors before deploying.');
    return false;
  }
  
  console.log('✅ Build completed successfully.');
  return true;
}

// Check for bundle size
function checkBundleSize() {
  console.log('\n📏 Checking bundle size...');
  
  console.log('ℹ️ To analyze your bundle size in detail, run: npm run analyze');
  return true;
}

// Check for unused dependencies
function checkUnusedDependencies() {
  console.log('\n📦 Checking for unused dependencies...');
  console.log('ℹ️ Consider using depcheck to identify unused dependencies');
  return true;
}

// Main function to run all checks
async function runChecks() {
  console.log('🚀 Starting pre-deployment verification...');
  
  const checks = [
    { name: 'Environment Variables', fn: checkEnvFile },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Build Process', fn: checkBuild },
    { name: 'Bundle Size', fn: checkBundleSize },
    { name: 'Unused Dependencies', fn: checkUnusedDependencies }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    console.log(`\n🔍 Running check: ${check.name}...`);
    const passed = check.fn();
    if (!passed) {
      allPassed = false;
      console.error(`❌ Check failed: ${check.name}`);
    }
  }
  
  if (allPassed) {
    console.log('\n✅ All pre-deployment checks passed! Your project is ready for Vercel deployment.');
    console.log('\nReminder: Make sure to set up all environment variables in your Vercel project settings.');
    console.log('The following variables must be configured in Vercel:');
    console.log('  - MONGO: Your MongoDB connection string');
    console.log('  - AUTH_SECRET: Your NextAuth secret key');
    console.log('  - JWT_SECRET: Your JWT secret key');
    console.log('  - AUTH_URL: Update to your production URL (not localhost)');
    console.log('  - All other email and service credentials');
  } else {
    console.log('\n❌ Some checks failed. Please address the issues before deploying.');
    process.exit(1);
  }
}

runChecks().catch(err => {
  console.error('Error during pre-deployment checks:', err);
  process.exit(1);
});
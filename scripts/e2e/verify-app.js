const { spawn } = require('child_process');
const path = require('path');
const { seed } = require('./helpers/seed-data');

async function runTests() {
    await seed();
    console.log('[Runner] Starting E2E Verification Suite...');

    const cucumber = spawn('npx', [
        'cucumber-js',
        'scripts/e2e/features/**/*.feature',
        '--require', 'scripts/e2e/step_definitions/**/*.js',
        '--require', 'scripts/e2e/helpers/**/*.js',
        '--format', 'summary',
        '--publish-quiet'
    ], {
        stdio: 'inherit',
        shell: true
    });

    cucumber.on('exit', (code) => {
        console.log(`[Runner] Tests finished with code ${code}`);
        process.exit(code);
    });
}

runTests();

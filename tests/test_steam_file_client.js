const assert = require('assert');
const Module = require('module');
const os = require('os');

// Mock electron
const originalRequire = Module.prototype.require;
Module.prototype.require = function(path) {
    if (path === 'electron') {
        return {
            app: {
                getPath: () => '/mock/path'
            }
        };
    }
    return originalRequire.apply(this, arguments);
};

// We need to mock os.platform() BEFORE requiring the module
// but the module defines isLinux etc at the top level.
// So we will clear the cache and re-require for each test case.

function runTest(platform, expected) {
    console.log(`Testing platform: ${platform}, expected: ${expected}`);

    // Mock os.platform
    const originalPlatform = os.platform;
    os.platform = () => platform;

    // Clear cache for the module under test and its dependencies if they use os.platform at top level
    delete require.cache[require.resolve('../js/backend/steam_file_client.js')];

    const SteamFileClient = require('../js/backend/steam_file_client.js');
    const client = new SteamFileClient();
    const result = client.getIsSteamDeck();

    assert.strictEqual(result, expected, `Failed for platform ${platform}: expected ${expected}, got ${result}`);

    // Restore os.platform
    os.platform = originalPlatform;
}

try {
    runTest('linux', true);
    runTest('win32', false);
    runTest('darwin', false);
    console.log('All tests passed!');
} catch (error) {
    console.error('Test failed!');
    console.error(error);
    process.exit(1);
}

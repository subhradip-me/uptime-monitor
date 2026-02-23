#!/usr/bin/env node
/**
 * Uptime Tool API Test Script
 * 
 * This script demonstrates how to use the uptime monitoring API
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000';
let authToken = null;

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${API_BASE}${endpoint}`,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  };
  
  if (data) {
    config.data = data;
  }
  
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method.toUpperCase()} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test script
async function runTests() {
  console.log('🧪 Starting API Tests for Uptime Tool\n');
  
  try {
    // 1. Test server health
    console.log('1️⃣ Testing server health...');
    const health = await apiRequest('GET', '/health');
    console.log('✅ Server is healthy:', health.status);
    console.log(`📊 Monitoring Status:`, health.monitoring);
    console.log('');

    // 2. Login with default credentials
    console.log('2️⃣ Logging in with default credentials...');
    const loginResult = await apiRequest('POST', '/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginResult.data.token;
    console.log('✅ Login successful! User:', loginResult.data.user.username);
    console.log('');

    // 3. Add some targets to monitor
    console.log('3️⃣ Adding targets to monitor...');
    
    const targets = [
      { name: 'Google', url: 'https://www.google.com', interval: 30000 },
      { name: 'GitHub', url: 'https://github.com', interval: 60000 },
      { name: 'Local Test (will fail)', url: 'http://localhost:9999', interval: 45000 }
    ];
    
    const createdTargets = [];
    for (const target of targets) {
      const result = await apiRequest('POST', '/targets', target);
      createdTargets.push(result.data);
      console.log(`✅ Added target: ${result.data.name} (${result.data.url})`);
    }
    console.log('');

    // 4. Get all targets
    console.log('4️⃣ Getting all targets...');
    const allTargets = await apiRequest('GET', '/targets');
    console.log(`✅ Retrieved ${allTargets.count} targets:`);
    allTargets.data.forEach(target => {
      console.log(`   📡 ${target.name}: ${target.lastStatus} (${target.uptimePercentage}% uptime)`);
    });
    console.log('');

    // 5. Perform manual ping on first target
    console.log('5️⃣ Performing manual ping...');
    const manualPing = await apiRequest('POST', `/targets/${createdTargets[0]._id}/ping`);
    console.log('✅ Manual ping result:', manualPing.data);
    console.log('');

    // 6. Wait a bit for automatic monitoring to work
    console.log('6️⃣ Waiting 35 seconds for automatic monitoring...');
    console.log('   (Monitoring service will ping targets automatically)');
    
    await new Promise(resolve => setTimeout(resolve, 35000));
    
    // 7. Check logs
    console.log('7️⃣ Checking logs...');
    const logs = await apiRequest('GET', `/logs/${createdTargets[0]._id}?limit=5`);
    console.log(`✅ Retrieved ${logs.data.length} recent logs for ${createdTargets[0].name}:`);
    logs.data.forEach(log => {
      const emoji = log.status === 'UP' ? '🟢' : '🔴';
      console.log(`   ${emoji} ${log.status} - ${log.responseTime}ms - ${new Date(log.timestamp).toLocaleTimeString()}`);
    });
    console.log('');

    // 8. Get system stats
    console.log('8️⃣ Getting system statistics...');
    const stats = await apiRequest('GET', '/logs/stats');
    console.log('✅ System stats (last 24h):', {
      totalTargets: stats.data.totalTargets,
      totalChecks: stats.data.last24Hours.totalChecks,
      overallUptime: `${stats.data.last24Hours.uptimePercentage}%`,
      avgResponseTime: `${Math.round(stats.data.last24Hours.avgResponseTime)}ms`
    });
    console.log('');

    // 9. Update a target
    console.log('9️⃣ Updating a target...');
    const updatedTarget = await apiRequest('PUT', `/targets/${createdTargets[1]._id}`, {
      interval: 30000, // Change from 60s to 30s
      name: 'GitHub (Updated)'
    });
    console.log('✅ Target updated:', updatedTarget.data.name);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - Server is running and healthy');
    console.log('   - Authentication is working');
    console.log('   - Targets can be added, retrieved, and updated');
    console.log('   - Manual pinging works');
    console.log('   - Automatic monitoring is active');
    console.log('   - Logs are being recorded');
    console.log('   - Statistics are being calculated');
    console.log('');
    console.log('🔗 You can now:');
    console.log('   - Access the API at http://localhost:5000');
    console.log('   - View health at http://localhost:5000/health');
    console.log('   - Build a frontend to visualize the data');
    console.log('   - Add more targets via POST /targets');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the tests
runTests().catch(console.error);
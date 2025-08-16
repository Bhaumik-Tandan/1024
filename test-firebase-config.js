// Test Firebase Configuration
// Run this to verify your Firebase setup

const { firebaseConfig } = require('./utils/firebaseConfig.js');

console.log('🔥 Firebase Configuration Test');
console.log('==============================');
console.log('Project ID:', firebaseConfig.projectId);
console.log('API Key:', firebaseConfig.apiKey ? '✅ Present' : '❌ Missing');
console.log('App ID:', firebaseConfig.appId ? '✅ Present' : '❌ Missing');
console.log('Bundle ID:', firebaseConfig.bundleId);
console.log('Storage Bucket:', firebaseConfig.storageBucket);
console.log('Sender ID:', firebaseConfig.messagingSenderId);

// Check if all required fields are present
const requiredFields = ['projectId', 'apiKey', 'appId', 'bundleId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length === 0) {
  console.log('\n✅ All required Firebase configuration fields are present!');
  console.log('📱 Ready for iOS Firebase Analytics in production mode');
} else {
  console.log('\n❌ Missing required fields:', missingFields);
  console.log('Please check your Firebase configuration');
}

console.log('\n📋 Next Steps:');
console.log('1. Install Firebase packages: npm install @react-native-firebase/app @react-native-firebase/analytics');
console.log('2. Build for production to test analytics');
console.log('3. Check Firebase Console for data');

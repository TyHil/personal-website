/* Google Analytics */

const firebaseConfig = {
  apiKey: 'AIzaSyBqUCCFOsGpHaYAMk7Lgpp1PeWC34lCS4s',
  authDomain: 'tylergordonhill-c8339.firebaseapp.com',
  databaseURL: 'https://tylergordonhill-c8339-default-rtdb.firebaseio.com',
  projectId: 'tylergordonhill-c8339',
  storageBucket: 'tylergordonhill-c8339.appspot.com',
  messagingSenderId: '10243950475',
  appId: '1:10243950475:web:ff9abba5961c2fc49c918e',
  measurementId: 'G-XRHEPKCZGL'
};

const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics(app);

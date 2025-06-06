/*Page Time*/

const { google } = require('googleapis');
var admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_AUTH_CREDENTIALS),
  scopes: 'https://www.googleapis.com/auth/analytics.readonly'
});

async function pageTime() {
  const client = google.analyticsdata({
    version: 'v1beta',
    auth: await auth.getClient()
  });

  const response = await client.properties.runReport({
    property: `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`,
    requestBody: {
      metrics: [{ name: 'userEngagementDuration' }],
      dateRanges: [{ startDate: '2015-08-14', endDate: 'today' }],
      metricAggregations: ['TOTAL']
    }
  });

  return parseInt(response.data.totals[0].metricValues[0].value);
}

/*Spotify Playlist Length*/

const PLAYLIST_ID = '3vKSA2SfmKbzQpS91bdFQJ';

async function playlistLength() {
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const token = (await tokenResponse.json()).access_token;

  const response = await fetch(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}`, {
    headers: {
      Authorization: 'Bearer ' + token
    }
  });
  const data = await response.json();
  return data.tracks.total;
}

/*Pull Requests Opened*/

async function pullsOpened() {
  const response = await fetch('https://api.github.com/search/issues?q=type:pr+author:TyHil', {
    headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN }
  });
  return (await response.json()).total_count;
}

/*Longest GitHub Streak*/

async function githubStreak() {
  const response = await fetch('https://api.franznkemaka.com/github-streak/stats/TyHil');
  return (await response.json()).longestStreak.days;
}

/*Website Size*/

const ignore = ['.git', 'node_modules'];
async function getDirectorySize(directoryPath) {
  let totalSize = 0;
  const files = await fs.readdir(directoryPath);
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = await fs.stat(filePath);
    if (stat.isFile()) {
      totalSize += stat.size;
    } else if (stat.isDirectory() && !ignore.includes(file)) {
      totalSize += await getDirectorySize(filePath);
    }
  }
  return totalSize;
}
async function siteSize() {
  return getDirectorySize('./');
}

/*Results*/

Promise.all([pageTime(), playlistLength(), pullsOpened(), githubStreak(), siteSize()]).then(
  results => {
    const app = admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
      databaseURL: 'https://tylergordonhill-c8339-default-rtdb.firebaseio.com'
    });

    const db = admin.database();
    const ref = db.ref('stats');

    const toUpload = {
      pageTime: results[0],
      playlistLength: results[1],
      pullsOpened: results[2],
      githubStreak: results[3],
      siteSize: results[4]
    };

    Promise.allSettled(
      Object.entries(toUpload).map(([key, value]) => {
        return ref.child(key).set(value);
      })
    ).then(results => {
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.error(`Failed to set ${Object.keys(toUpload)[i]}: `, result.reason);
        }
      });
      app.delete();
    });
  }
);

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

const GITHUB_USERNAME = 'TyHil';

async function githubPulls() {
  const response = await fetch(
    'https://api.github.com/search/issues?q=type:pr+author:' + GITHUB_USERNAME,
    {
      headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN }
    }
  );
  return (await response.json()).total_count;
}

/*Longest GitHub Streak*/

async function fetchContributionYears() {
  return fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN },
    body: JSON.stringify({
      query: `{
        user(login: "${GITHUB_USERNAME}") {
          contributionsCollection {
            contributionYears
          }
        }
      }`
    })
  }).then(data => data.json());
}
async function fetchContributions(year) {
  return fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN },
    body: JSON.stringify({
      query: `{
        user(login: "${GITHUB_USERNAME}") {
          contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year}-12-31T23:59:59Z") {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }`
    })
  }).then(data => data.json());
}
async function githubInfo() {
  const contributionYears = (await fetchContributionYears()).data.user.contributionsCollection
    .contributionYears;
  const contributions = (await Promise.all(contributionYears.map(fetchContributions)))
    .flatMap(
      contribution => contribution.data.user.contributionsCollection.contributionCalendar.weeks
    )
    .flatMap(week => week.contributionDays);
  contributions.sort((a, b) => a.date.localeCompare(b.date));
  return contributions;
}
const githubInfoCalled = githubInfo();
async function githubStreak() {
  const contributions = await githubInfoCalled;
  let streak = 0;
  let maxStreak = 0;
  for (contribution of contributions) {
    if (contribution.contributionCount) {
      streak++;
    } else {
      streak = 0;
    }
    if (streak > maxStreak) {
      maxStreak = streak;
    }
  }
  return maxStreak;
}
async function githubCommits() {
  const contributions = await githubInfoCalled;
  return contributions.reduce((accumulator, current) => accumulator + current.contributionCount, 0);
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

/*Running 14 Day Average Rating*/

async function averageRating(directoryPath) {
  return 0;
}

/*Results*/

const fetches = {
  pageTime: pageTime(),
  playlistLength: playlistLength(),
  githubPulls: githubPulls(),
  githubStreak: githubStreak(),
  githubCommits: githubCommits(),
  siteSize: siteSize(),
  averageRating: averageRating()
};

Promise.all(Object.entries(fetches).map(async ([key, value]) => [key, await value])).then(data => {
  const app = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
    databaseURL: 'https://tylergordonhill-c8339-default-rtdb.firebaseio.com'
  });

  const db = admin.database();
  const ref = db.ref('stats');

  const uploads = data.map(([key, value]) => [key, ref.child(key).set(value)]);

  Promise.all(uploads.map(([, value]) => value)).then(() => {
    app.delete();
  });
});

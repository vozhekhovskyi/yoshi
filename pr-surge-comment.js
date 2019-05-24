#!/usr/bin/env node

const parseArgs = require('minimist');
const promisify = require('promisify');
const GitHub = require('github-api');
const { readFileSync } = require('fs');
const jwt = require('jsonwebtoken');

const privateKey = readFileSync('test-pr-surge-comment.2019-05-24.private-key.pem');
const now = Math.floor(Date.now() / 1000);
const payload = {
  iat: now, // Issued at time
  exp: now + 60, // JWT expiration time
  iss: '31408',
};
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

const argv = parseArgs(process.argv.slice(2), {
  string: ['pr'],
});

// const token = '49fcfde55772e23f5c7792bb81a0842d6fe7916c';

// if (!token.length) {
//   console.warn('No token for GitHub, ignoring');
//   process.exit(0);
// }

const gh = new GitHub({ token });
const PRNumber = argv.pr;
const REPO_PATH = ['wix', 'yoshi'];

const issues = promisify.object({
  createIssueComment: promisify.cb_func(),
})(gh.getIssues(...REPO_PATH));

(async () => {
  try {
    await issues.createIssueComment(PRNumber, `[Surge build](wix-yoshi-${PRNumber}.surge.sh/yoshi)`);
  } catch (e) {
    console.error(e.message);
  }
})();

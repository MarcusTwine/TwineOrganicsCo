module.exports = {
  apps: [{
    name: 'twine-organics',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/twine-organics',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      // Set COOKIE_SECURE=true only if the site is served over HTTPS
      COOKIE_SECURE: 'false',
    },
    restart_delay: 3000,
    max_restarts: 10,
  }],
}

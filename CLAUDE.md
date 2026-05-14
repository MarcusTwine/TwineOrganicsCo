@AGENTS.md

## Server Deployment

- **Host:** 192.168.0.101
- **SSH port:** 26
- **User:** root
- **Password:** P@ssword
- **App dir:** /var/www/twine-organics
- **PM2 name:** twine-organics

Deploy command:
```bash
sshpass -p 'P@ssword' ssh -p 26 -o StrictHostKeyChecking=no root@192.168.0.101 "cd /var/www/twine-organics && git pull && npm run build && pm2 reload twine-organics"
```

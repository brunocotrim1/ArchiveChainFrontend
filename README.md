# ArchiveMintFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
```markdown
# 🚀 Deploying Angular App with Nginx and HTTPS (Let's Encrypt)

This guide walks through deploying an Angular app with a production build, served by Nginx and secured with Let's Encrypt SSL.

---

## ✅ Prerequisites
- Ubuntu server with root/sudo access
- Domain name pointing to your server (`archivechain.pt`)
- Angular project ready for build

---

## 🛠️ Steps

### 1. Update & Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

---

### 2. Build Angular App for Production

```bash
ng build --configuration production
```

---

### 3. Copy Build Output to Web Root

```bash
sudo mkdir -p /var/www/archivechain.pt/html
sudo cp -r dist/archive-mint-frontend/* /var/www/archivechain.pt/html
```

---

### 4. Set Up Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/archivechain.pt
```

Paste the following into the file:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name archivechain.pt;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl;
    server_name archivechain.pt;

    root /var/www/archivechain.pt/html;
    index index.html index.htm;

    ssl_certificate /etc/letsencrypt/live/archivechain.pt/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/archivechain.pt/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### 5. Set Up SSL with Certbot (if not already done)

```bash
sudo mkdir -p /var/www/certbot
sudo certbot certonly --webroot -w /var/www/certbot -d archivechain.pt
```

---

### 6. Enable Nginx Site

```bash
sudo ln -s /etc/nginx/sites-available/archivechain.pt /etc/nginx/sites-enabled/
```

---

### 7. Test and Reload Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

### 8. Test Auto-Renewal of SSL Certificate

```bash
sudo certbot renew --dry-run
```


# Self-Hosting Strapi on Local Wi-Fi for Free

You can self-host Strapi completely free on one computer and allow everyone connected to the same Wi-Fi or LAN to access the CMS.

Strapi itself is open source, so you do not need Strapi Cloud if you only want to run the CMS internally.

---

## Architecture

The setup would look like this:

```text
                Same Wi-Fi / LAN
                       │
         ┌─────────────┼─────────────┐
         │             │             │
      Laptop A      Laptop B      Phone/Tablet
         │             │             │
         └─────────────┼─────────────┘
                       │
               192.168.1.50
             ┌────────────────┐
             │  Host Computer │
             │                │
             │ Strapi :1337   │
             │ Database       │
             └────────────────┘
```

The main computer acts as the local server.

Everyone connected to the same Wi-Fi would access Strapi using:

```text
http://192.168.1.50:1337/admin
```

Instead of:

```text
http://localhost:1337/admin
```

> `localhost` only refers to the computer that is currently being used. Other devices cannot use `localhost` to access your Strapi server.

---

# 1. Configure Strapi for LAN Access

Check your Strapi server configuration file.

For TypeScript projects:

```text
config/server.ts
```

For JavaScript projects:

```text
config/server.js
```

Example configuration:

```ts
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),

  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

The important setting is:

```ts
host: '0.0.0.0'
```

This tells Strapi to listen on all available network interfaces instead of only the local machine.

---

# 2. Run Strapi

For development:

```bash
npm run develop
```

For a more permanent local server:

```bash
npm run build
npm run start
```

For an office or production-like environment, `npm run start` is preferable to keeping Strapi in development mode.

---

# 3. Find the Server Computer's Local IP Address

You need to know the LAN IP address of the computer running Strapi.

## Windows

Run:

```cmd
ipconfig
```

Look for something similar to:

```text
IPv4 Address . . . . . . : 192.168.1.50
```

## macOS / Linux

Run:

```bash
ifconfig
```

or:

```bash
ip addr
```

For example, assume the server computer has:

```text
192.168.1.50
```

---

# 4. Access Strapi from Another Device

Any device connected to the same Wi-Fi or LAN can open:

```text
http://192.168.1.50:1337/admin
```

The Strapi API would be available at:

```text
http://192.168.1.50:1337/api
```

Example API endpoint:

```text
http://192.168.1.50:1337/api/articles
```

---

# 5. Configure the Firewall

The server computer's firewall may block other devices from connecting.

For Windows, allow TCP traffic on:

```text
Port 1337
```

Preferably allow it only on the:

```text
Private Network
```

Do not expose the port through the Public network profile unless necessary.

After configuring the firewall, test from another device:

```text
http://192.168.1.50:1337/admin
```

If Strapi works on the server computer but not another device, check:

- Windows Firewall
- Router client isolation
- Whether both devices are on the same Wi-Fi
- Whether Strapi is listening on `0.0.0.0`
- Whether port `1337` is open

---

# 6. Give the Server a Fixed Local IP Address

Normally, the router automatically assigns IP addresses using DHCP.

For example, today the computer might receive:

```text
192.168.1.50
```

After restarting the router, it might become:

```text
192.168.1.73
```

This would break everyone's bookmarked CMS URL.

A better solution is to configure a **DHCP reservation** inside the router.

For example:

```text
Server PC
IP: 192.168.1.50
```

Then your CMS address remains:

```text
http://192.168.1.50:1337/admin
```

---

# 7. Optional Local Domain

Instead of asking users to remember:

```text
http://192.168.1.50:1337/admin
```

You can eventually configure a local DNS name such as:

```text
http://cms.local
```

This is optional and requires additional local DNS or hostname configuration.

For a simple office setup, using the static LAN IP is sufficient.

---

# 8. Configure the Website Frontend Correctly

If your frontend communicates with Strapi, do not configure the API URL as:

```env
STRAPI_URL=http://localhost:1337
```

This will only work correctly on the Strapi server itself.

On another user's computer, `localhost` refers to their own computer.

Instead, use the Strapi server's LAN IP:

```env
STRAPI_URL=http://192.168.1.50:1337
```

For example:

```text
Website
http://192.168.1.50:3000

Strapi CMS
http://192.168.1.50:1337/admin

Strapi API
http://192.168.1.50:1337/api
```

---

# 9. CORS Configuration

If the frontend and Strapi run on different origins, you may need to configure CORS.

For example:

```text
Frontend:
http://192.168.1.50:3000

Strapi:
http://192.168.1.50:1337
```

Because the ports are different, browsers treat them as different origins.

Make sure the Strapi CORS middleware allows your frontend origin.

---

# 10. Database Options

There are two reasonable options for a free local deployment.

## Option A — SQLite

For a small internal CMS:

```text
Strapi
   │
   └── SQLite Database
```

Advantages:

- Very easy to configure
- No separate database server
- Free
- Good for smaller CMS deployments
- Easy to back up

This is suitable if only a few people will be managing content.

---

## Option B — PostgreSQL

For a more robust setup:

```text
Strapi
   │
   └── PostgreSQL
```

PostgreSQL is also free.

It is preferable when:

- More users are accessing the CMS
- The CMS contains more data
- You expect the system to grow
- You want a more production-oriented database
- You want better database management and backup options

---

# 11. Recommended Zero-Cost Architecture

A practical setup would be:

```text
Old Desktop / Mini PC
│
├── Node.js
├── Strapi
├── SQLite or PostgreSQL
├── Uploaded Media
└── Automatic Backup
       │
       └── External Drive / Another PC
```

Example configuration:

```text
Server IP:
192.168.1.50

CMS:
http://192.168.1.50:1337/admin

API:
http://192.168.1.50:1337/api
```

Hosting cost:

```text
RM0/month
```

Assuming you already have:

- A computer
- Electricity
- Wi-Fi / LAN
- Router

---

# 12. The Server Computer Must Stay Running

The main limitation of local self-hosting is that the host computer becomes the server.

It must remain:

```text
ON
+
Connected to Wi-Fi/LAN
+
Strapi Running
```

If the computer:

- Shuts down
- Sleeps
- Restarts
- Disconnects from Wi-Fi
- Stops the Strapi process

then the CMS and API become unavailable.

For this reason, it is better to use:

```text
Old Desktop
```

or:

```text
Mini PC
```

instead of someone's daily-use laptop.

---

# 13. Avoid Router Port Forwarding

Do **not** configure your router to expose:

```text
Port 1337
```

directly to the internet.

For your intended setup, Strapi should remain accessible only inside the local network.

Example:

```text
Internet
   │
   X
   │
Strapi
```

But inside your office network:

```text
Office Wi-Fi
     │
     ├── Staff Laptop
     ├── Admin Laptop
     ├── Phone
     └── Strapi Server
```

This reduces unnecessary security exposure.

---

# 14. Backups Are Important

Because everything is stored on one computer, you should configure backups.

At minimum, back up:

```text
Database
+
Strapi Uploads
```

For Strapi, uploaded images and files are commonly stored under:

```text
public/uploads
```

Your backup architecture could be:

```text
Strapi Server
│
├── Database
├── public/uploads
│
└── Daily Backup
       │
       ├── External HDD
       └── Another Computer
```

If the server hard drive fails, having these backups allows you to restore the CMS.

---

# Recommended Setup

For a simple internal company CMS with no monthly hosting cost:

```text
Dedicated PC / Old PC
        │
        ├── Node.js
        ├── Strapi
        ├── PostgreSQL or SQLite
        └── public/uploads
        │
        ▼
  192.168.1.50
        │
        ├── http://192.168.1.50:1337/admin
        └── http://192.168.1.50:1337/api
        │
        ▼
   Office Wi-Fi
        │
        ├── Admin
        ├── Staff
        └── Other authorized users
```

## Estimated Cost

| Component | Cost |
|---|---:|
| Strapi | RM0 |
| Node.js | RM0 |
| SQLite | RM0 |
| PostgreSQL | RM0 |
| Local LAN hosting | RM0 |
| Domain | Not required |
| SSL | Not required for LAN-only usage |
| Cloud server | Not required |
| Monthly hosting | **RM0** |

The only practical costs are the computer, electricity, networking equipment, and backup storage if those are not already available.

---

# Final Recommendation

For an internal CMS, use:

```text
Dedicated Local PC
+
Static LAN IP
+
Strapi Production Mode
+
SQLite/PostgreSQL
+
Local Network Access
+
Automatic Backups
```

Keep Strapi accessible only from the local Wi-Fi/LAN and avoid exposing port `1337` directly to the public internet.

This provides a simple self-hosted Strapi CMS with effectively **zero recurring hosting cost**.
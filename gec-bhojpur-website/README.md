# GEC Bhojpur Website

A modern, formal redesign of the Government Engineering College, Bhojpur website.
Plain HTML, CSS and JavaScript. No build step, no installs.

## Run it in VS Code

1. Open this folder in VS Code (`File > Open Folder`).
2. Install the **Live Server** extension (VS Code will suggest it).
3. Right-click `index.html` and choose **Open with Live Server**.

You can also just double-click `index.html`. An internet connection is needed for the Google Fonts.

## Folder structure

```
index.html  about.html  admissions.html  departments.html
notices.html  contact.html  portal.html
css/style.css        all colours and layout (edit the variables at the top)
js/data.js           ALL content: notices, news, stats, departments, gallery
js/main.js           header, footer, dark mode, search, gallery viewer
assets/images/       photos (see README.txt inside)
assets/video/        campus.mp4 for the hero video
assets/notices/      notice PDFs
```

## What to do next

| Task | Where |
|---|---|
| Add a notice | `js/data.js` > `notices` (put the PDF in `assets/notices/`) |
| Replace the logo | Replace `assets/logo.svg` and `assets/favicon.svg` with the official logo |
| Hero video | Save as `assets/video/campus.mp4` |
| Campus and gallery photos | `assets/images/` (names listed in `assets/images/README.txt`) |
| Statistics | `js/data.js` > `stats` (use `null` until the number is verified) |
| Change colours | `css/style.css`, variables under `:root` |

Anything marked **"to be confirmed"** or **"to be added"** on the site needs verified data
from the college office: PIN code, seat intake, HODs, faculty, vision and mission, student count,
Principal's photo and message, official email, and social media links.

## Honest limits

- The **Portal page is a login screen only**. There is no backend, and it stores nothing.
- The contact form opens the visitor's email app (`mailto:`). It does not send mail itself.
- Notices are read from `js/data.js`. For non-technical staff to publish notices, a CMS or admin panel is needed.

## Building the real portal (suggested path)

1. Backend: Django or Node.js (NestJS/Express) with PostgreSQL.
2. Login with roles: Student, Faculty, HOD, Admin.
3. Modules in order: notices admin, attendance, timetable, results, exam forms, fees.
4. Move `js/data.js` content into the database and serve it through an API.

## Deploy

Free options for a static site: GitHub Pages, Netlify, Cloudflare Pages. Upload the folder as it is.

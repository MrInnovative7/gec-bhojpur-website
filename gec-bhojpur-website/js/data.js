/* ==========================================================
   GEC Bhojpur - Site content
   Edit this file to update notices, news, stats and more.
   Items marked "to be confirmed" need verified data from the college.
   ========================================================== */
window.GEC = {
  info: {
    name: "Government Engineering College, Bhojpur",
    short: "GEC Bhojpur",
    city: "Arrah, Bihar",
    address: "South East Ramna Road, near Maharaja College, Arrah, Bihar",
    pin: "",                                  // TODO: confirm PIN code (site shows 802301)
    phone: "06182-222140",
    email: "gecbhojpur@gmail.com",            // TODO: move to an institutional email when available
    dept: "Department of Science, Technology and Technical Education, Government of Bihar"
  },

  // value: null  ->  shows a dash and "to be published"
  stats: [
    { value: "4",    label: "B.Tech departments" },
    { value: "2019", label: "Year established" },
    { value: "2023", label: "On the permanent campus since" },
    { value: null,   label: "Students enrolled" }
  ],

  /* ----------------------------------------------------------
     NOTICE BOARD DATA  (homepage: Notice | Events | Academic Notices)
     One entry per notice. Fields:
       title, date ("YYYY-MM-DD"), category (Exam | Event | Welfare | General ...)
       column : "notice" | "events" | "academic"   (which homepage column)
       home   : set to false to keep an entry on the "View all" page only
       docs   : [ { label: "Download Result", url: "assets/notices/file.pdf" } ]
                One action link per document, shown under the title and date.
                While url is "" the action is displayed greyed-out and is NOT
                clickable. Paste the real file URL into url to activate it.
                Pick the label that matches the document (Download Advertisement,
                Download Result, View Notice, Download Exam Schedule, ...).
       pdf    : legacy single-PDF field, still supported (shown as "Download Notice").
       Events only (all optional; shown only when filled in): eventDate, venue,
                website, brochure, registration, readMore
     Original file names noted in comments are those shown on gecbhojpur.org;
     the URLs themselves still need to be added.
     ---------------------------------------------------------- */
  notices: [
    /* ---- ACADEMIC NOTICES ---- */
    { title: "Regarding to Mid-Term Exam 2026 Programme of B. Tech. 1st Semester (2026 Batch) and B. Tech. 3rd Semester (2025 Batch).", category: "Exam", column: "academic", date: "2026-11-04", docs: [{ label: "Download Exam Schedule", url: "" }] },
    // Revised notice file on gecbhojpur.org: GEC_BHOJ_EXAM_Mid_Sem._1st and 3rd Sem_Revised_Notice_Letter_No._362_DT_04_11_2026
    { title: "Revised Notice for Mid-Term Exam. of B. Tech. 1st Semester (2026 Batch) and 3rd Semester (2025 Batch).", category: "Exam", column: "academic", date: "2026-11-04", docs: [{ label: "Download Revised Programme", url: "" }] },
    // File on gecbhojpur.org: GEC_BHOJ_EXAM_Admit_Card_Distribution_Notice_B.Tech. 4th Sem._Exam-2026_Old_Crs._ LETTER_356_DT_30_10_2026
    { title: "Notice for Admit Card Distribution of B.Tech. 4th Sem. Exam-2026 (Old Crs).", category: "Exam", column: "academic", date: "2026-10-30", docs: [{ label: "Download Admit Card Notice", url: "" }] },
    { title: "Notice for Admit Card Distribution of B.Tech. 4th Sem. Exam-2026.", category: "Exam", column: "academic", date: "2026-10-28", docs: [{ label: "Download Admit Card Notice", url: "" }] },
    { title: "Notice for Mid-Term Exam. of B. Tech. 1st Semester (2026 Batch) and 3rd Semester (2025 Batch).", category: "Exam", column: "academic", date: "2026-10-27", docs: [{ label: "View Notice", url: "" }] },
    { title: "Notice for Exam Form filling of 4th Semester (Old Crs.) Examination 2026.", category: "Exam", column: "academic", date: "2026-10-22", docs: [{ label: "View Notice", url: "" }] },
    { title: "Notice for Exam Form filling of 4th Semester (2024 Batch) Examination 2026", category: "Exam", column: "academic", date: "2026-10-09", pdf: "", docs: [{ label: "View Notice", url: "" }] },
    { title: "Notice for Admit Card Distribution of B.Tech. 6th Sem. Exam-2026", category: "Exam", column: "academic", date: "2026-10-01", pdf: "", docs: [{ label: "Download Admit Card Notice", url: "" }] },
    { title: "Revised Viva Program of B.Tech 1st to 8th Semester Supplementary Examination 2026", category: "Exam", column: "academic", date: "2026-09-12", pdf: "", docs: [{ label: "Download Revised Programme", url: "" }] },
    { title: "Viva Program of B.Tech 1st to 8th Semester Supplementary Examination 2026", category: "Exam", column: "academic", date: "2026-09-09", pdf: "", docs: [{ label: "Download Viva Schedule", url: "" }] },

    /* ---- EVENTS ---- */
    { title: "Umang 2026-2027", category: "Event", column: "events", date: "2026-11-03", docs: [{ label: "View Event Notice", url: "" }] },
    { title: "Notice regarding competitions and activities on the occasion of International Climate Day.", category: "Event", column: "events", date: "2026-10-24", docs: [{ label: "View Event Notice", url: "" }] },
    { title: "MMC Madhava-2027 Registration Notice", category: "Event", column: "events", date: "2026-09-11", pdf: "", docs: [{ label: "View Event Notice", url: "" }] },
    { title: "Notice for Mental Health, High Blood Pressure and Diabetes Awareness Program", category: "Welfare", column: "events", date: "2026-08-29", pdf: "", docs: [{ label: "View Event Notice", url: "" }] },
    { title: "विद्यार्थी सहयोग शिविर", category: "Welfare", column: "events", date: "2026-08-24", pdf: "", docs: [{ label: "View Event Notice", url: "" }] },

    /* ---- NOTICE (public / general institutional notices shown on the homepage) ---- */
    { title: "Disciplinary Action Against Hostel Students", category: "General", column: "notice", date: "2026-11-02", docs: [{ label: "View Notice", url: "" }] },
    { title: "Institute Training and Placement Cell, Lt no 910, Dated: 3/11/2026", category: "General", column: "notice", date: "2026-11-03", docs: [{ label: "View Notice", url: "" }] },

    /* ---- INTERNAL OFFICE ORDERS: kept for the View all page, hidden from the homepage (home: false) ---- */
    { title: "Assistant Office Incharge, Letter 909, Dated: 3/11/2026", category: "General", column: "notice", date: "2026-11-03", home: false, docs: [{ label: "View Notice", url: "" }] },
    { title: "Charge of Head of Department, Letter no 908, Dated: 3/11/2026", category: "General", column: "notice", date: "2026-11-03", home: false, docs: [{ label: "View Notice", url: "" }] },
    { title: "Chief Warden, Letter:907, Dated: 3/11/2026", category: "General", column: "notice", date: "2026-11-03", home: false, docs: [{ label: "View Notice", url: "" }] },
    { title: "Campus Incharge, Letter no 906, Dated: 3/11/2026", category: "General", column: "notice", date: "2026-11-03", home: false, docs: [{ label: "View Notice", url: "" }] },
    { title: "Letter No.-352 Date-28-10-2026", category: "General", column: "notice", date: "2026-10-28", home: false, docs: [{ label: "View Notice", url: "" }] }
  ],

  events: [
    { title: "MMC Madhava-2027", text: "Registration notice published on 11 Sep 2026. Event dates to be added." },
    { title: "Health awareness programme", text: "Mental health, high blood pressure and diabetes. Date and venue: see notice." },
    { title: "विद्यार्थी सहयोग शिविर", text: "Student support camp. Date and venue: see notice." }
  ],

news: {
  featured: {
    tag: "Sports",
    title: "GEC Bhojpur wins 3 Gold and 3 Silver medals",
    text: "GEC Bhojpur students achieved an excellent performance in sports, winning 3 Gold and 3 Silver medals.",
    image: "assets/images/sports.jpeg"
  },
  list: [
    {
      title: "Blood Donation Camp",
      meta: "Welfare",
      text: "GEC Bhojpur organised a blood donation camp to encourage voluntary blood donation and spread awareness about its importance.",
      image: "assets/images/health.jpeg",
      imageOnly: true,
      href: "notices.html"
    },
    {
      title: "विद्यार्थी सहयोग शिविर",
      meta: "Welfare · 24 Aug 2026",
      image: "assets/images/studentwelfare.jpeg"
    },
    {
      title: "MMC Madhava-2027 registration opens",
      meta: "Event · 11 Sep 2026",
      image: "assets/images/madhava.jpeg"
    },
    {
      title: "Health Awareness Programme",
      meta: "Health · Campus News",
      image: "assets/images/health.jpeg"
    },
    {
      title: "Training & Placement",
      meta: "Training · Placement",
      image: "assets/images/placement.jpeg"
    }
  ]
},

  depts: [
    { name: "Civil Engineering", slug: "civil" },
    { name: "Electrical Engineering", slug: "electrical" },
    { name: "Mechanical Engineering", slug: "mechanical" },
    { name: "Instrumentation Engineering", slug: "instrumentation" }
  ],

  activities: ["NSS", "Research & Innovation", "Skill Development Mission", "Training & Placement", "Student Activities", "Alumni", "Committees", "Grievance"],

  quick: [
    { label: "Exam form and admit card notices", href: "notices.html?c=Exam" },
    { label: "Admission process", href: "admissions.html" },
    { label: "Departments", href: "departments.html" },
    { label: "Pay fees (SBI Collect)", href: "portal.html" },
    { label: "Grievance and contact", href: "contact.html" },
    { label: "Student, faculty and admin login", href: "portal.html" }
  ],

  // Put real photos in assets/images/ and keep the file names below (or change them).
  // Optional "video": a file in assets/video/. The tile keeps showing its "src" photo;
  // clicking it plays the video in the lightbox instead of the photo.
  gallery: [
    { caption: "Pre-Diwali Glimpses", src: "assets/images/gallery-1.jpg", video: "assets/video/pre-diwali-celebration.mp4", fallback: "linear-gradient(135deg,#1f3a63,#3f6aa5)" },
    { caption: "Art & Craft Kalakriti", src: "assets/images/gallery-2.jpg", video: "assets/video/kalakriti-event.mp4", fallback: "linear-gradient(135deg,#243a5c,#0f1d33)" },
    { caption: "Independence Day Celebration", src: "assets/images/gallery-3.jpg", video: "assets/video/independence-day-celebration.mp4", fallback: "linear-gradient(135deg,#4d1010,#861C1C)" },
    { caption: "TechGlaz", src: "assets/images/gallery-4.jpg", video: "assets/video/technical-fest.mp4", fallback: "linear-gradient(135deg,#2c4467,#5b82b8)" },
    { caption: "Laboratories", src: "assets/images/gallery-5.jpg", fallback: "linear-gradient(135deg,#17294a,#365c93)" },
    { caption: "NSS and student activities", src: "assets/images/gallery-6.jpg", fallback: "linear-gradient(135deg,#5a1414,#861C1C)" }
  ]
};
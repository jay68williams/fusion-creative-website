const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'blog');
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const BLOG_INDEX = path.join(__dirname, '..', 'blog.html');

// Read all markdown files and parse frontmatter
function getPosts() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    const html = marked.parse(content);
    return { ...data, html };
  });
  // Sort by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Shared HTML fragments
const HEAD_OPEN = `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-TS8XCRSG4W"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-TS8XCRSG4W');
  </script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />`;

const FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />`;

const FB_PIXEL = `
  <!-- Facebook Pixel (deferred until consent) -->
  <script>
    window._fbPixelLoaded=false;
    function loadFBPixel(){
      if(window._fbPixelLoaded)return;window._fbPixelLoaded=true;
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init','1817052875251689');fbq('track','PageView');
    }
    if(localStorage.getItem('fc_cookie_consent')==='accepted')loadFBPixel();
  </script>`;

const COOKIE_CSS = `
  <style>
    .cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:10000;background:#111;border-top:1px solid rgba(255,255,255,0.12);padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;font-size:0.85rem;color:#888;transform:translateY(100%);transition:transform 0.4s ease}
    .cookie-banner.visible{transform:translateY(0)}
    .cookie-banner a{color:#E63B2E;text-decoration:underline}
    .cookie-btns{display:flex;gap:0.5rem;flex-shrink:0}
    .cookie-btns button{padding:0.5rem 1.2rem;border-radius:999px;font-size:0.8rem;font-weight:600;cursor:pointer;transition:background 0.2s}
    .cookie-accept{background:#E63B2E;color:white;border:none}
    .cookie-accept:hover{background:#c4302a}
    .cookie-decline{background:transparent;color:#888;border:1px solid rgba(255,255,255,0.12)}
    .cookie-decline:hover{color:#F5F3EE}
  </style>`;

function navbar(isSubdir) {
  return `
  <!-- NAVBAR -->
  <nav class="navbar scrolled" id="navbar">
    <div class="nav-inner">
      <a href="/" class="nav-logo">Fusion Creative</a>
      <ul class="nav-links">
        <li><a href="/#results">Results</a></li>
        <li><a href="/#about">About</a></li>
        <li><a href="/contact">Contact Us</a></li>
        <li><a href="/blog">Blog</a></li>
      </ul>
      <a href="/login" class="btn btn-signal"><span>Client Login</span></a>
      <button class="nav-toggle" id="navToggle" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>`;
}

const FOOTER = `
  <!-- FOOTER -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="f-col-large">
          <div class="footer-logo">Fusion Creative</div>
          <p>Short-form content that gets your business in front of millions.<br/>Based in Newcastle upon Tyne. Working with local businesses worldwide.</p>
        </div>
        <div class="f-col">
          <h4>Company</h4>
          <ul>
            <li><a href="/#results">Results</a></li>
            <li><a href="/#services">Services</a></li>
            <li><a href="/#guarantee">Guarantee</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>
        <div class="f-col">
          <h4>Platforms</h4>
          <ul>
            <li><a href="#">TikTok</a></li>
            <li><a href="#">Instagram Reels</a></li>
            <li><a href="#">YouTube Shorts</a></li>
            <li><a href="#">Facebook</a></li>
          </ul>
        </div>
        <div class="f-col">
          <h4>Contact</h4>
          <ul>
            <li><a href="https://fusioncreative.uk">fusioncreative.uk</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/#contact">Book a Call</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="sys-status">
          <div class="status-dot"></div>
          <span>System Operational</span>
        </div>
        <div class="copyright">&copy; 2026 Fusion Creative. All rights reserved.</div>
      </div>
    </div>
  </footer>`;

const SCRIPTS_AND_COOKIE = `
  <script>
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 100); });
    const toggle = document.getElementById('navToggle');
    const links = document.querySelector('.nav-links');
    if (toggle) toggle.addEventListener('click', () => links.classList.toggle('open'));
  </script>

  <!-- Cookie consent -->
  <div class="cookie-banner" id="cookieBanner">
    <p>We use cookies to measure ad performance and improve your experience. <a href="/privacy">Privacy Policy</a></p>
    <div class="cookie-btns">
      <button type="button" class="cookie-decline" onclick="declineCookies()">Decline</button>
      <button type="button" class="cookie-accept" onclick="acceptCookies()">Accept</button>
    </div>
  </div>
  <script>
  function acceptCookies(){localStorage.setItem('fc_cookie_consent','accepted');document.getElementById('cookieBanner').classList.remove('visible');loadFBPixel()}
  function declineCookies(){localStorage.setItem('fc_cookie_consent','declined');document.getElementById('cookieBanner').classList.remove('visible')}
  (function(){var c=localStorage.getItem('fc_cookie_consent');if(!c)setTimeout(function(){document.getElementById('cookieBanner').classList.add('visible')},2000)})();
  </script>`;

// Build individual blog post page
function buildPostPage(post) {
  const dateFormatted = formatDate(post.date);
  const cssPath = '../styles/main.css';

  return `${HEAD_OPEN}
  <title>${post.title} | Fusion Creative</title>
  <meta name="description" content="${post.description}" />
  <meta property="og:title" content="${post.title}" />
  <meta property="og:description" content="${post.description}" />
  <meta property="og:url" content="https://fusioncreative.uk/blog/${post.slug}" />
  <link rel="canonical" href="https://fusioncreative.uk/blog/${post.slug}" />
${FONTS}
  <link rel="stylesheet" href="${cssPath}" />
${FB_PIXEL}
${COOKIE_CSS}

  <!-- Article Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${post.title.replace(/"/g, '\\"')}",
    "description": "${post.description.replace(/"/g, '\\"')}",
    "author": {
      "@type": "Person",
      "name": "Jay Williams"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Fusion Creative",
      "url": "https://fusioncreative.uk"
    },
    "datePublished": "${post.date}",
    "dateModified": "${post.date}",
    "locationCreated": {
      "@type": "Place",
      "name": "Newcastle upon Tyne, United Kingdom"
    }
  }
  </script>
</head>
<body>
${navbar(true)}

  <article>
    <header class="blog-post-hero">
      <div class="container">
        <a href="/blog" class="back-link">&larr; Back to Blog</a>
        <h1>${post.title}</h1>
        <div class="blog-post-meta">
          <span>${dateFormatted}</span>
          <span>By Jay Williams</span>
          <span>${post.readTime}</span>
        </div>
      </div>
    </header>

    <div class="blog-post-content">
      ${post.html}
    </div>
  </article>
${FOOTER}
${SCRIPTS_AND_COOKIE}
</body>
</html>
`;
}

// Build blog listing page
function buildListingPage(posts) {
  let cards = '';
  for (const post of posts) {
    const dateFormatted = formatDate(post.date);
    cards += `
      <!-- Post: ${post.slug} -->
      <a href="/blog/${post.slug}" class="blog-card">
        <div class="blog-card-img">
          <span class="card-icon">${post.icon || ''}</span>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span>${dateFormatted}</span>
            <span>${post.readTime}</span>
          </div>
          <h3>${post.title}</h3>
          <p class="excerpt">${post.description}</p>
          <span class="read-more">Read More &rarr;</span>
        </div>
      </a>
`;
  }

  return `${HEAD_OPEN}
  <title>Blog - Fusion Creative | Social Media Marketing for Local Businesses Newcastle</title>
  <meta name="description" content="Expert insights on social media marketing for local businesses in Newcastle upon Tyne. Tips on TikTok, Instagram Reels, and short-form video for restaurants, trades, salons, gyms and more." />
  <meta property="og:title" content="Blog - Fusion Creative | Local Business Marketing Newcastle" />
  <meta property="og:description" content="Expert insights on social media marketing for local businesses in Newcastle upon Tyne." />
  <meta property="og:url" content="https://fusioncreative.uk/blog" />
  <link rel="canonical" href="https://fusioncreative.uk/blog" />
${FONTS}
  <link rel="stylesheet" href="styles/main.css" />
${FB_PIXEL}
${COOKIE_CSS}
</head>
<body>
${navbar(false)}

  <!-- BLOG HERO -->
  <section class="blog-hero">
    <div class="container">
      <div class="section-label">/ Blog</div>
      <h1>Insights for <em>local businesses</em></h1>
      <p>Tips, strategies, and case studies on how local businesses in Newcastle upon Tyne and beyond are winning with short-form content.</p>
    </div>
  </section>

  <!-- BLOG GRID -->
  <section class="container">
    <div class="blog-grid">
${cards}
    </div>
  </section>
${FOOTER}
${SCRIPTS_AND_COOKIE}
</body>
</html>
`;
}

// Main
function main() {
  const posts = getPosts();
  console.log(`Found ${posts.length} blog posts`);

  // Ensure blog directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }

  // Clear existing HTML files in blog/
  const existing = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html'));
  for (const file of existing) {
    fs.unlinkSync(path.join(BLOG_DIR, file));
    console.log(`  Removed old: blog/${file}`);
  }

  // Generate individual post pages
  for (const post of posts) {
    const html = buildPostPage(post);
    const outPath = path.join(BLOG_DIR, `${post.slug}.html`);
    fs.writeFileSync(outPath, html);
    console.log(`  Built: blog/${post.slug}.html`);
  }

  // Generate listing page
  const listingHtml = buildListingPage(posts);
  fs.writeFileSync(BLOG_INDEX, listingHtml);
  console.log(`  Built: blog.html`);

  console.log('Blog build complete.');
}

main();

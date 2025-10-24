/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://oregontruckingpermit.com', // 🔹 Replace with your actual domain
  generateRobotsTxt: true,           // (optional) creates robots.txt
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/admin/*', '/api/*'],   // exclude private routes if needed
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin'] },
    ],
  },
};
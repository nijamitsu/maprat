export async function GET() {
    const baseUrl = 'https://maprat.com';
    const routes = [
        { path: '/', priority: 1.0 },
        { path: '/passport', priority: 0.9 },
        { path: '/visa-faq', priority: 0.8 },
        { path: '/about', priority: 0.7 },
    ];
    const lastmod = new Date().toISOString().split('T')[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${routes.map(({ path, priority }) => `
        <url>
            <loc>${baseUrl}${path}</loc>
            <lastmod>${lastmod}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>${priority}</priority>
        </url>`).join('')}
    </urlset>`;

    return new Response(xml, {
        headers: { 'Content-Type': 'application/xml' }
    });
}

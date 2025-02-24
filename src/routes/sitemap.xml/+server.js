export async function GET() {
    const baseUrl = 'https://maprat.com';
    const routes = [
        '/',
        '/passport',
        '/about',
    ];
    const lastmod = new Date().toISOString().split('T')[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${routes
        .map(route => `
    <url>
        <loc>${baseUrl}${route}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`)
        .join('')}
</urlset>`;

    return new Response(xml, {
        headers: { 'Content-Type': 'application/xml' }
    });
}

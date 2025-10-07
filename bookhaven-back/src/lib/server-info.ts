// Script para mostrar información del servidor en la terminal
export function displayServerInfo() {
    const boxTop = '╔═══════════════════════════════════════════╗';
    const boxBottom = '╚═══════════════════════════════════════════╝';
    const boxSide = '║';

    console.clear();
    console.log('\n');
    console.log(boxTop);
    console.log(`${boxSide}           📚 BOOKHAVEN API SERVER         ${boxSide}`);
    console.log(`${boxSide}                                           ${boxSide}`);
    console.log(`${boxSide}  Status: 🟢 ACTIVE                       ${boxSide}`);
    console.log(`${boxSide}  Version: 1.0.0                          ${boxSide}`);
    console.log(`${boxSide}  Type: Headless API (No Web Interface)   ${boxSide}`);
    console.log(boxBottom);
    console.log('\n🚀 Server Information:');
    console.log('   • Mode: API-Only (No web pages)');
    console.log('   • Database: PostgreSQL with Prisma');
    console.log('   • Authentication: JWT');
    console.log('   • CORS: Enabled for all origins');
    console.log('\n📡 Available Endpoints:');
    console.log('   🔐 Auth:     /api/auth/*');
    console.log('   📚 Books:    /api/books/*');
    console.log('   📋 Lists:    /api/booklists/*');
    console.log('   💬 Comments: /api/comments');
    console.log('   ⭐ Ratings:  /api/ratings');
    console.log('   👤 Users:    /api/users/*');
    console.log('\n📖 Documentation: API_DOCUMENTATION.md');
    console.log('\n🔍 Request Monitoring: All API requests will be logged below');
    console.log('─'.repeat(60));
}

export function logServerStart(port: number) {
    setTimeout(() => {
        displayServerInfo();
        console.log(`\n✅ API Server ready and listening on port ${port}`);
        console.log(`📍 API Base URL: http://localhost:${port}/api`);
        console.log(`📋 Server Info: http://localhost:${port}/api`);
        console.log('\n⏳ Waiting for API requests...\n');
    }, 100);
}
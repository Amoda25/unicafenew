const mongoose = require('mongoose');
const dns = require('dns').promises;
require('dotenv').config();

async function diagnose() {
    console.log('--- MongoDB Connection Diagnosis ---');
    console.log('Node version:', process.version);
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('ERROR: MONGODB_URI not found in .env');
        return;
    }

    const clusterHost = uri.split('@')[1]?.split('/')[0]?.split('?')[0];
    console.log('Attempting to diagnose connection to:', clusterHost);

    // 1. DNS Resolution Test (Using Google DNS 8.8.8.8)
    console.log('\n--- 1. DNS Resolution Test (Google DNS) ---');
    try {
        const resolver = new dns.Resolver();
        resolver.setServers(['8.8.8.8']);
        const addresses = await resolver.resolveSrv(`_mongodb._tcp.${clusterHost}`);
        console.log('SUCCESS: Resolved SRV records via Google DNS:');
        addresses.forEach(addr => console.log(` - ${addr.name}:${addr.port}`));
        
        console.log('\nADVICE: Google DNS can find your cluster, but your computer\'s default DNS cannot.');
        console.log('Please change your network adapter settings to use 8.8.8.8 and 8.8.4.4 as DNS servers.');
    } catch (err) {
        console.error('FAILED: DNS SRV resolution failed.');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        console.log('\nADVICE: This is a network/DNS issue. Try the following:');
        console.log('1. Change your DNS to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)');
        console.log('2. Ensure you are not behind a corporate/university firewall that blocks SRV lookups');
    }

    // 2. IP Lookup Test
    try {
        const ip = await dns.lookup(clusterHost);
        console.log('\nSUCCESS: Master cluster host IP:', ip.address);
    } catch (err) {
        console.warn('\nWARNING: Could not resolve cluster hostname directly (this is normal for srv clusters)');
    }

    // 3. Mongoose Connection Test
    console.log('\n--- 2. Mongoose Connection Test ---');
    try {
        console.log('Attempting mongoose.connect()...');
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('SUCCESS: Connected to MongoDB successfully!');
        process.exit(0);
    } catch (err) {
        console.error('FAILED: Mongoose could not connect.');
        console.error('Error Code:', err.code);
        console.error('Error Name:', err.name);
        console.error('Message:', err.message);
        
        if (err.message.includes('IP not whitelisted')) {
            console.log('\nADVICE: Your IP address is not whitelisted in MongoDB Atlas.');
        } else if (err.name === 'MongooseServerSelectionError') {
            console.log('\nADVICE: Server selection timed out. This often happens due to network firewalls or wrong credentials.');
        }
        process.exit(1);
    }
}

diagnose();

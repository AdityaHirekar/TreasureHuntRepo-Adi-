const http = require('http');

function post(data) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5050,
            path: '/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function test() {
    const teamName = "TestTeam_" + Math.floor(Math.random() * 10000);
    const data1 = JSON.stringify({ teamName, members: ["A"] });
    const data2 = JSON.stringify({ teamName: teamName.toLowerCase(), members: ["B"] });

    console.log(`1. Registering ${teamName}...`);
    const res1 = await post(data1);
    console.log(`   Status: ${res1.status}`);

    if (res1.status !== 200) {
        console.log("   Failed initial registration. Aborting.");
        return;
    }

    console.log(`2. Registering ${teamName.toLowerCase()} (Duplicate)...`);
    const res2 = await post(data2);
    console.log(`   Status: ${res2.status}, Body: ${res2.body}`);

    if (res2.status === 400) {
        console.log("PASS: Duplicate block worked.");
    } else {
        console.log("FAIL: Duplicate was allowed.");
    }
}

test();

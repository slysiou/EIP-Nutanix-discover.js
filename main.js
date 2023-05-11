const axios = require('axios')
const https = require('https')
const { createHash } = require('node:crypto')
const fs = require('fs');

require('dotenv').config();

prism = axios.create({
    baseURL: process.env.NTNX_URL,
    auth: {
    username: process.env.NTNX_USER,
    password: process.env.NTNX_PASSWORD,
    },
    httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      })
});

const main = async () => {
    const start = Date.now()
    const res = []

    res.push({
        type: 'worker',
        ts: start,
        uuid: process.env.EIP_UUID
    })

    var {data} = await prism.post('/clusters/list',{})
    // console.log(data.entities)
    for (let ent of data.entities)
        res.push({
            type: 'folder',
            status: 'ok',
            id: ent.metadata.uuid,
            name: ent.spec.name,
        })

    var {data} = await prism.post('/subnets/list',{})
    // console.log(data.entities)
    for (let ent of data.entities)
        res.push({
            type: 'network',
            status: 'ok',
            folder_id: ent.status.cluster_reference.uuid,
            id: ent.metadata.uuid,
            name: ent.spec.name,
        })

    var {data} = await prism.post('/vms/list',{})
        // console.log(data.entities)
        for (let ent of data.entities) {
            res.push({
                type: 'instance',
                status: ent.status.resources.power_state,
                folder_id: ent.status.cluster_reference.uuid,
                id: ent.metadata.uuid,
                name: ent.spec.name,
                cpu: ent.status.resources.num_sockets,
                ram: ent.status.resources.memory_size_mib,
                parameters: {
                    project_reference: ent.metadata.project_reference?.name
                }
            })
            for (let nic of ent.status.resources.nic_list) {

                res.push({
                    type: 'linknetworkinstance',
                    network_id: nic.subnet_reference.uuid,
                    instance_id: nic.uuid
                })
                let ip = {
                    type: 'ip',
                    folder_id: ent.status.cluster_reference.uuid,
                    mac: nic.mac_address,
                    status: (nic.is_connected ? 'ok' : 'nok')
                }

                for (let ipv4 of nic.ip_endpoint_list) {
                    ip.addr4 = ipv4.ip
                    const hash = createHash('md5').update(ip.addr4).digest('hex').substring(0,9)
                    ip.id = nic.uuid + '-' + hash
                    res.push(ip)

                    res.push({
                        type: 'linkipinstance',
                        ip_id: ip.id,
                        instance_id: ent.metadata.uuid
                    })

                    res.push({
                        type: 'linkipnetwork',
                        ip_id: ip.id,
                        network_id: nic.uuid
                    })
                }
            }
        }
    res.push({"type": "result", "errcode": "1", "message": "OK"})
    const duration = (Date.now() - start)/ 1000
    res.push({"type": "worker", "duration": duration.toString()})

    // Generate file
    try {
        const fd = fs.openSync(`./${process.env.EIP_UUID}.${start}`, 'w')
        for (line of res)
            fs.writeSync(fd, JSON.stringify(line) + '\n')
    } catch (err) {
        console.error(err)
    }
    console.log("Script complete, total runtime:", duration )
}

main()
const fetch = require('node-fetch');
const BASE = 'https://api.github.com/repos';
module.exports = async (req, res) => {
  try{
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    if(!token || !repo) return res.status(500).json({ok:false, error:'Server not configured.'});
    const api = `${BASE}/${repo}/contents/entries`;
    const lst = await fetch(api, {headers:{Authorization:`token ${token}`, Accept:'application/vnd.github.v3+json'}});
    if(!lst.ok) return res.json({ok:false, files:[]});
    const items = await lst.json();
    const files = [];
    for(const it of items){
      if(it.type !== 'file') continue;
      // fetch raw content
      const raw = await fetch(it.url, {headers:{Authorization:`token ${token}`, Accept:'application/vnd.github.v3.raw'}});
      const txt = await raw.text();
      try{
        const j = JSON.parse(txt);
        files.push({path: it.path, name: j.name, phone: j.phone, time: j.timestamp || j.time || ''});
      }catch(e){
        files.push({path: it.path, name: it.name, phone:'', time:''});
      }
    }
    res.json({ok:true, files});
  }catch(err){console.error(err);res.status(500).json({ok:false,error:String(err)})}
}

const fetch = require('node-fetch');
const BASE = 'https://api.github.com/repos';
module.exports = async (req, res) => {
  try{
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const path = req.query.path;
    if(!token || !repo) return res.status(500).json({ok:false, error:'Server not configured.'});
    if(!path) return res.status(400).json({ok:false, error:'path required'});
    const api = `${BASE}/${repo}/contents/${path}`;
    const g = await fetch(api, {headers:{Authorization:`token ${token}`, Accept:'application/vnd.github.v3.raw'}});
    if(!g.ok) return res.status(404).json({ok:false});
    const txt = await g.text();
    try{ return res.json(JSON.parse(txt)); }catch(e){ return res.text(txt); }
  }catch(err){console.error(err);res.status(500).json({ok:false,error:String(err)})}
}

const fetch = require('node-fetch');
const BASE = 'https://api.github.com/repos';
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    const { json, vcf } = req.body;
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO; // format: owner/repo
    if(!token || !repo) return res.status(500).json({error:'Server not configured. Set GITHUB_TOKEN and GITHUB_REPO.'});
    // 1. JSON file name
    const fileName = `${json.name.replace(/\s+/g,'_')}_${json.phone}_${Date.now()}.json`;
    const jsonPath = `entries/${fileName}`;
    await upsertFile(repo, jsonPath, JSON.stringify(json, null, 2), token, `Add ${fileName}`);
    // 2. monthly VCF
    const now = new Date();
    const month = now.toLocaleString('en-US',{month:'long'});
    const year = now.getFullYear();
    const vcfPath = `vcf/${month}_${year}.vcf`;
    // get existing
    const getUrl = `${BASE}/${repo}/contents/${vcfPath}`;
    let base = '';
    const g = await fetch(getUrl, {headers:{Authorization:`token ${token}`, Accept:'application/vnd.github.v3.raw'}});
    if(g.ok) base = await g.text();
    const newContent = (base ? base + '\n' : '') + vcf;
    await upsertFile(repo, vcfPath, newContent, token, `Update VCF ${month}_${year}`);
    return res.json({ok:true});
  } catch(err){
    console.error(err);
    return res.status(500).json({error: String(err)});
  }
};
async function upsertFile(repo, path, content, token, message){
  const api = `https://api.github.com/repos/${repo}/contents/${path}`;
  const get = await fetch(api, {headers:{Authorization:`token ${token}`, Accept:'application/vnd.github.v3+json'}});
  let sha = null;
  if(get.ok){
    const data = await get.json(); sha = data.sha;
  }
  await fetch(api, {
    method:'PUT',headers:{Authorization:`token ${token}`, Accept:'application/vnd.github.v3+json'},
    body: JSON.stringify({message, content: Buffer.from(content).toString('base64'), sha})
  });
}

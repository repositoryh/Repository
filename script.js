// dynamic child fields + POST to serverless upload
const childCountEl = document.getElementById('childCount');
const childrenArea = document.getElementById('childrenArea');
const form = document.getElementById('regForm');
const status = document.getElementById('status');

['none','1','2','3','4','5','6','7','8','9','more'].forEach(v=>{
  const o = document.createElement('option'); o.value = v; o.textContent = v; childCountEl.appendChild(o);
});

childCountEl.addEventListener('change', renderChildren);
function renderChildren(){
  const val = childCountEl.value;
  childrenArea.innerHTML = '';
  if(val === 'none') return;
  const num = val === 'more' ? 10 : parseInt(val);
  for(let i=1;i<=num;i++){
    const d = document.createElement('div'); d.className='child-block';
    d.innerHTML = `<label>${i} Child Class<select name="class${i}"><option>10th</option><option>11th</option><option>12th</option></select></label>
      <label>Gender<select name="gender${i}"><option>male</option><option>female</option></select></label>`;
    childrenArea.appendChild(d);
  }
}

async function postJSON(payload){
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  return res.json();
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  status.textContent = 'Saving...';
  const fd = new FormData(form);
  const obj = {
    name: fd.get('name'),
    childCount: fd.get('childCount'),
    children: [],
    address: fd.get('address'),
    phone: fd.get('phone'),
    interest: fd.get('interest'),
    surveyor: fd.get('surveyor'),
    timestamp: new Date().toISOString()
  };
  if(obj.childCount !== 'none'){
    const n = obj.childCount === 'more' ? 10 : parseInt(obj.childCount);
    for(let i=1;i<=n;i++){
      obj.children.push({class: fd.get(`class${i}`), gender: fd.get(`gender${i}`)});
    }
  }
  // build vcard
  const vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:${obj.name}\nTEL:${obj.phone}\nEND:VCARD\n`;
  try{
    const reply = await postJSON({json:obj, vcf});
    if(reply && reply.ok) {
      status.textContent = 'Saved ✔';
      form.reset(); renderChildren();
    } else {
      status.textContent = 'Save failed: ' + (reply && reply.error ? reply.error : 'unknown');
    }
  } catch(err){
    console.error(err);
    status.textContent = 'Error saving — check server logs';
  }
});

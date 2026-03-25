(async () => {
  const base = 'http://localhost:5000';
  const r1 = await fetch(base + '/');
  console.log('/ ->', await r1.json());
  const r2 = await fetch(base + '/api/health');
  console.log('/api/health ->', await r2.json());
  const r3 = await fetch(base + '/api/questions?company=Amazon&role=Frontend%20Developer');
  console.log('/api/questions ->', (await r3.json()).questions?.length);
  const r4 = await fetch(base + '/api/evaluate', {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({answers:[{question:'Q', answer:'node js', ideal:'nodejs'}]})
  });
  console.log('/api/evaluate ->', await r4.json());
})();
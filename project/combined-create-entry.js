/* Existing setup URLs enter the unified Create workspace. No additional workflow. */
(() => {
 let m;try{m=JSON.parse(localStorage.getItem('cogniaAssessmentTestsV1'))}catch{}
 if(!m?.tests?.length)sessionStorage.setItem('capSetupUseClientSample','true');
 if(new URLSearchParams(location.search).has('additionalTest')&&m?.tests?.length){
  const id='test-'+Date.now(),t={id,title:'New test',grade:'5',subject:'Mathematics',standard:'5.NF.A.1',page:'CAP-T05-Questions.dc.html',state:{chosen:[],written:{},edits:{}},questions:[]};
  m.tests.push(t);m.active=id;localStorage.setItem('cogniaAssessmentTestsV1',JSON.stringify(m));
 }
 const t=m?.tests?.find(t=>t.id===m.active)||m?.tests?.[0];
 if(t){sessionStorage.removeItem('capCreateConfirmed:'+t.id);sessionStorage.removeItem('capCreateCollapsed:'+t.id);}
 location.replace(t?.page||'CAP-T05-Questions.dc.html');
})();

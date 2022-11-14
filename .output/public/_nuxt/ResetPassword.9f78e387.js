import{a as p,b as _,e as x,f as h,r as l,o as g,h as m,i as e,w as i,v as f,t as w,j as b,k as v,l as c,m as y,p as U,q as k}from"./entry.180298d6.js";const M={setup(){const r=_(),{auth:t}=x(),d=h(),s=l(""),a=l("");return{user:d,UpdatedUser:async()=>{const{user:n,error:o}=await t.updateUser({password:s.value});o?(a.value=o.message,setTimeout(()=>{a.value=""},5e3),console.log(o)):(console.log(n),r.push("/"))},confirmPassword:s,emailErrMsg:a}}},S={class:"relative overflow-hidden"},j={class:"flex flex-col justify-center antialiased bg-slate-900 text-gray-100 min-h-screen p-4"},P={class:"h-full"},B={class:"max-w-[360px] mx-auto"},C={class:"bg-slate-800 shadow-lg rounded-lg mt-9"},E={class:"text-center px-5 pb-5"},R=e("h3",{class:"text-xl font-bold text-gray-100 mb-1"},"Reset your password",-1),T={class:"bg-gray-700 text-center px-5 py-6"},V={class:"flex shadow-sm rounded justify-center items-center mx-auto gap-y-2 flex-col"},L=e("div",{class:""},null,-1),N=e("div",{class:""},[e("input",{name:"card-nr",class:"text-sm text-gray-800 bg-white rounded leading-5 py-2 px-3 placeholder-gray-400 w-full border border-transparent focus:border-indigo-300 focus:ring-0",type:"text",placeholder:" new password..","aria-label":" new password.."})],-1),z={class:""},D=e("button",{type:"submit",class:"font-semibold text-sm inline-flex items-center justify-center text-white px-3 py-2 border border-transparent rounded leading-5 shadow transition duration-150 ease-in-out w-full bg-indigo-500 hover:bg-indigo-600 text-white focus:outline-none focus-visible:ring-2"}," Send ",-1),q={"x-show":"open",class:"fixed bottom-0 right-0 w-full md:bottom-8 md:right-12 md:w-auto z-60","x-data":"{ open: true }"},A={class:"bg-gray-800 text-gray-50 text-sm p-3 md:rounded shadow-lg flex justify-between"},F=e("span",{class:"sr-only"},"Close",-1),G=e("svg",{class:"w-4 h-4 flex-shrink-0 fill-current",viewBox:"0 0 16 16"},[e("path",{d:"M12.72 3.293a1 1 0 00-1.415 0L8.012 6.586 4.72 3.293a1 1 0 00-1.414 1.414L6.598 8l-3.293 3.293a1 1 0 101.414 1.414l3.293-3.293 3.293 3.293a1 1 0 001.414-1.414L9.426 8l3.293-3.293a1 1 0 000-1.414z"})],-1),H=[F,G];function I(r,t,d,s,a,u){const n=k;return g(),m("main",S,[e("section",j,[e("div",P,[e("div",B,[e("div",C,[e("header",E,[R,i(e("div",{class:"bg-red-400 text-white py-2 px-1 border-l-8 border-red-700 rounded-lg"},w(s.emailErrMsg),513),[[f,s.emailErrMsg]])]),e("div",T,[e("form",{class:"space-y-3",onSubmit:t[1]||(t[1]=b((...o)=>s.UpdatedUser&&s.UpdatedUser(...o),["prevent"]))},[e("div",V,[L,N,e("div",z,[i(e("input",{name:"card-nr",class:"text-sm text-gray-800 bg-white rounded leading-5 py-2 px-3 placeholder-gray-400 w-full border border-transparent focus:border-indigo-300 focus:ring-0",type:"text",placeholder:"confirm password","aria-label":"confirm password","onUpdate:modelValue":t[0]||(t[0]=o=>s.confirmPassword=o)},null,512),[[v,s.confirmPassword]])])]),D],32)])])])])]),e("div",q,[e("div",A,[e("div",null,[c(" \u{1F449} "),y(n,{to:"/tasks",class:"hover:underline ml-1 text-white"},{default:U(()=>[c("Tasks")]),_:1})]),e("button",{class:"text-gray-500 hover:text-gray-400 ml-5",onClick:t[2]||(t[2]=o=>r.open=!1)},H)])])])}const K=p(M,[["render",I]]);export{K as default};
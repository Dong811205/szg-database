/** GitHub Pages serves the same snapshot without a server API. */
export async function fetchData(){
 const response=await fetch(import.meta.env.BASE_URL+'data/database.json',{cache:'no-store'});
 return {ok:response.ok,json:async()=>({data:await response.json(),source:'snapshot',checkedAt:new Date().toISOString()})};
}

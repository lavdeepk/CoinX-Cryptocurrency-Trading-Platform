// Utility helper module for existInWatchlist.
export const existInWatchlist=(items,coin)=>{
    if(!Array.isArray(items) || !coin?.id){
        return false;
    }

    for(let item of items){
        if(item?.id===coin?.id)return true;
    }
    return false;

}

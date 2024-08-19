export default function fetchRequest(url, init, timeout){

    let aboutController = new AbortController();
    let signal = aboutController.signal;
    let margeInit = Object.assign({signal}, init);


    let timeoutPromise = (timeout)=>{
        return new Promise((resolve, reject)=>{
            setTimeout(()=>{
                resolve(new Response("timeout", { status: 504, statusText: "timeout " }));
                aboutController.abort();
            }, timeout);
        });
    };

    let fetchPromise = (url, margeInit)=>{
        return fetch(url,margeInit);
    };

    return Promise.race([fetchPromise(url, margeInit), timeoutPromise(timeout)])
        .then(response=>{
            // console.log(response); //输出网络请求返回结果
            if(response.ok){
                return response.json();
            }
            //适配更多情况如500等
            else{
                return Promise.reject();
            }
        });
        // .then(data=>{
        //     respCallback(data);
        // })
        // .catch(err=>{
        //     rej(err);
        // });

};
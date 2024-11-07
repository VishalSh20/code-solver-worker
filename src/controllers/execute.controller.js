import Execute from "../utils/execute.utils.js";

export default async function executeCode(req,res){
    const reqBody = req.body;
    const {code,language,testcases,memoryLimit,timeLimit} = reqBody;
    console.log("code-",code);
    console.log("testcases-",testcases);
    console.log("language-",language);
    const result = await Execute(code,language,testcases,memoryLimit,timeLimit);
    if(result.executionResults){
        const executionResults = result.executionResults;
        let overallStatus = "Accepted";
        for(let i=0; i<executionResults.length; i++){
            const statusCode = executionResults[i].status.id;
            if(statusCode > 3){
                overallStatus = executionResults[i].status.description;
                break;
            }
            else if(statusCode===3 && (testcases[i].output && executionResults[i].stdout!==testcases[i].output)){
                overallStatus = "Wrong Answer";
                executionResults[i].status.id = 4;
                executionResults[i].status.description = "Wrong Answer";
            }
        }
        
        let time = -1 , memory = -1;
        if(overallStatus==="Accepted" || overallStatus==="Wrong Answer" || overallStatus==="Time Limit Exceeded"){
            executionResults.forEach(element => {
                time = Math.max(element.time,time);
                memory = Math.max(element.memory,memory);
            })
        }


        res.status(200).json({overallStatus,overallTime:time,overallMemory:memory,executionResults});
    }
    else{
        res.status(500).json({error:result.error});
    }
}
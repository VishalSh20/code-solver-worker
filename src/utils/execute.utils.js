import axios from "axios";
import {language_id} from "../constants.js"


export default async function execute(code,language,testcases=[{input:""}],memorylimit=512000,timelimit=2.0){
    try {
        const judgeOptions =  {
            headers: {
                'x-rapidapi-key': process.env.JUDGE_API_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                'Content-Type': 'application/json'
            },  
        };
        console.log(process.env.JUDGE_API_KEY);
        
        if(memorylimit>512000 || memorylimit<0)
            return {error:"Invalid memory limit"};
        if(timelimit>100 || timelimit<0)
            return {error:"Invalid time limit"};

        const submissions = testcases.map(testcase => ({
                language_id:`${language_id[language]}`,
                source_code:code,
                stdin:testcase.input,
                memory_limit:String(memorylimit),
                cpu_time_limit:String(timelimit)
             })) 
            ;
    
        const submissionQueuingURL = `${process.env.JUDGE_BASE_URL}/submissions/batch`;
        const submissionQueuingResponse = await axios.post(
            submissionQueuingURL,
            {submissions:submissions},
            judgeOptions
        );
    
        const submissionQueuingResponseData = submissionQueuingResponse.data;
        let tokens = [];
        submissionQueuingResponseData.forEach(element => {
            const elementToken = element.token;
            if(elementToken){
                tokens.push(elementToken);
            }
            else{
                throw new Error(`${Object.keys(element)[0]}- ${Object.values(element)[0]}`);
            }
        });
        
        let results = {};
        const pollStartTime = Date.now();
        const pollDuration = 2*60*1000;
        while(Date.now()-pollStartTime < pollDuration){
            const currTokens = tokens.filter(token => !results[token]);
            if(!currTokens.length){
                break;
            }
    
            const resultCheckURL = `${process.env.JUDGE_BASE_URL}/submissions/batch/?base64_encoded=true&tokens=${currTokens.join(',')}`;
            const resultCheckResponse = await axios.get(
                resultCheckURL,
                judgeOptions
            );
    
            const resultCheckData = resultCheckResponse.data?.submissions;
            console.log(resultCheckData);
            for(let outputData of resultCheckData){
              if(outputData.status.id >= 3){
                    results[outputData.token] = {...outputData,
                        stdout:outputData.stdout ? Buffer.from(outputData.stdout,'base64').toString() : "",
                        error:(outputData.compile_output || outputData.stderr || outputData.message) ? atob(outputData.compile_output || outputData.stderr || outputData.message) : null};
                }
            }
    
            await new Promise(r => setTimeout(r, 1000));
        }

        if(Object.values(results).some(val=>!val))
            throw new Error("Polling timed out");
    
        let executionResults = [];
        for(let i=0; i<testcases.length; i++){
                executionResults.push(results[tokens[i]]);
        }
      
        return {executionResults};
    
    } catch (error) {
        console.log(error);
        return {error:error.message};
    }
}
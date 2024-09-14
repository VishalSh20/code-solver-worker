import Execute from "../utils/execute.utils.js";

export default async function generateTestCases(req,res){
    try {
        const reqBody = req.body;
        const {generator,testCount,validator,solution} = req.body;
        const generationResult = await Execute(generator.code,generator.language,Array(testCount).fill(0).map(element =>( {input:""})));
        if(generationResult.error){
            throw new Error(`Test Generation Error- ${generationResult.error}`);
        }   

        let generatedTestCases = [];
        for(let res of generationResult.executionResults){
            if(res.error){
                throw new Error(res.error);
            }
            generatedTestCases.push({input:res.stdout});
        }

        const validationResult = await Execute(validator.code,validator.language,generatedTestCases);
        for(let i=0; i<validationResult.executionResults.length; i++){
            const res = validationResult.executionResults[i];
            if(res.error){
                throw new Error(`Validation Error - ${res.error}`);
            }
            else if(["valid","Valid"].indexOf(res.stdout) === -1){
                throw new Error(`Invalid test case - ${generatedTestCases[i].input}`);
            }
        }

        const outputGenerationResults = await Execute(solution.code,solution.language,generateTestCases);
        for(let i=0; i<outputGenerationResults.executionResults.length; i++){
            const res = outputGenerationResults.executionResults[i];
            if(res.error){
                throw new Error(`Output Generation Error - ${res.error}`);
            }
            generatedTestCases[i] = {...generatedTestCases[i],output:res.stdout.trim()}
        }

        res.status(200).json({testcases:generatedTestCases});

    } catch (error) {
        res.status(500).json({error:error.message});
    }

}
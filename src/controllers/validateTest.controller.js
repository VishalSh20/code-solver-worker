import Execute from "../utils/execute.utils.js";

export default async function validateTestCases(req,res){
    try {
        const reqBody = req.body;
        const {testcases,validator,solution} = reqBody;
       
        const validationResult = await Execute(validator.code,validator.language,testcases);
        for(let i=0; i<validationResult.executionResults.length; i++){
            const res = validationResult.executionResults[i];
            if(res.error){
                throw new Error(`Validation Error - ${res.error}`);
            }
            else if(["valid","Valid"].indexOf(res.stdout) === -1){
                throw new Error(`Invalid test case - ${generatedTestCases[i].input}`);
            }
        }

        const outputGenerationResults = await Execute(solution.code,solution.language,testcases);

        let validatedTestcases = testcases;
        for(let i=0; i<outputGenerationResults.executionResults.length; i++){
            const res = outputGenerationResults.executionResults[i];
            if(res.error){
                throw new Error(`Output Generation Error - ${res.error}`);
            }
            validatedTestcases[i] = {...validatedTestcases[i],output:res.stdout.trim()}
        }

        res.status(200).json({message:"Testcases validated successfully",testcases:validatedTestcases});

    } catch (error) {
        res.status(500).json({error:error.message});
    }

}
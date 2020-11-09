import { PluginType } from "./pluginType";

export class ExchangeRate extends PluginType {
    constructor() {
        super(
            "ExchangeRate",
            "RateProvider",
            "Nop.Services.Directory",
            "IExchangeRateProvider",
            "Exchange rate providers"
        );
    }

    methods(): string {
        return `/// <summary>
        /// Check discount requirement
        /// </summary>
        /// <param name="request">Object that contains all information required to check the requirement (Current customer, discount, etc)</param>
        /// <returns>Result</returns>
        public DiscountRequirementValidationResult CheckRequirement(DiscountRequirementValidationRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));
    
            //invalid by default
            var result = new DiscountRequirementValidationResult();

            // custom logic goes here
    
            return result;
        }        
`
    }
}
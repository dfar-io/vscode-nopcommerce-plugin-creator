import { PluginType } from "./pluginType";

export class PaymentMethod extends PluginType {
    constructor() {
        super(
            "Payments",
            "PaymentProcessor",
            "Nop.Services.Payments",
            "IPaymentMethod",
            "Payment methods"
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
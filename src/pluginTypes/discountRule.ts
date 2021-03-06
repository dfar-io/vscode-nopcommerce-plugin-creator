import { METHODS } from 'http';
import { PluginType } from './pluginType';

export class DiscountRule extends PluginType {
    constructor() {
        super(
            "DiscountRules",
            "DiscountRequirementRule",
            "Nop.Services.Discounts",
            "IDiscountRequirementRule",
            "Discount requirements"
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

            // TODO: custom logic goes here
    
            return result;
        }

        /// <summary>
        /// Get URL for rule configuration
        /// </summary>
        /// <param name="discountId">Discount identifier</param>
        /// <param name="discountRequirementId">Discount requirement identifier (if editing)</param>
        /// <returns>URL</returns>
        public string GetConfigurationUrl(int discountId, int? discountRequirementId)
        {
            // will throw an error when assigning requirement to a discount
            // until this is implemented, take a look at this for more info:
            // https://github.com/nopSolutions/nopCommerce/tree/develop/src/Plugins/Nop.Plugin.DiscountRules.CustomerRoles
            throw new NotImplementedException();
        }
`
    }
}
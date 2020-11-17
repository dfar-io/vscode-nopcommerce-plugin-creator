import { DiscountRule } from "./discountRule";
import { ExchangeRate } from "./exchangeRate";
import { ExternalAuth } from "./externalAuth";
import { Misc } from "./misc";
import { PaymentMethod } from "./paymentMethod";
import { Pickup } from "./pickup";
import { Shipping } from "./shipping";
import { Tax } from "./tax";
import { Widgets } from "./widgets";

export class PluginTypeFactory {
    static getPluginType(group: string) {
        switch(group) {
            case 'DiscountRules':
                return new DiscountRule();
            case 'ExchangeRate':
                return new ExchangeRate();
            case 'ExternalAuth':
                return new ExternalAuth();
            case 'Misc':
                return new Misc();
            case 'Payments':
                return new PaymentMethod();
            case 'Pickup':
                return new Pickup();
            case 'Shipping':
                return new Shipping();
            case 'Tax':
                return new Tax();
            case 'Widgets':
                return new Widgets();
            default:
                throw new Error(`Invalid Plugin Type provided: ${group}`);
        }
    }
}
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
        return `public IList<Core.Domain.Directory.ExchangeRate> GetCurrencyLiveRates(string exchangeRateCurrencyCode)
        {
            if (exchangeRateCurrencyCode == null)
                throw new ArgumentNullException(nameof(exchangeRateCurrencyCode));

            //add euro with rate 1
            var ratesToEuro = new List<Core.Domain.Directory.ExchangeRate>
            {
                new Core.Domain.Directory.ExchangeRate
                {
                    CurrencyCode = "EUR",
                    Rate = 1,
                    UpdatedOn = DateTime.UtcNow
                }
            };

            // TODO: generally would make external calls to check rates here
            // and add rates to ratesToEuro

            //return result for the euro
            if (exchangeRateCurrencyCode.Equals("eur", StringComparison.InvariantCultureIgnoreCase))
                return ratesToEuro;

            //use only currencies that are supported
            var exchangeRateCurrency = ratesToEuro.FirstOrDefault(rate => rate.CurrencyCode.Equals(exchangeRateCurrencyCode, StringComparison.InvariantCultureIgnoreCase));
            if (exchangeRateCurrency == null)
                throw new NopException("You can use your exchange rate provider only when the primary exchange rate currency is supported.");

            //return result for the selected (not euro) currency
            return ratesToEuro.Select(rate => new Core.Domain.Directory.ExchangeRate
            {
                CurrencyCode = rate.CurrencyCode,
                Rate = Math.Round(rate.Rate / exchangeRateCurrency.Rate, 4),
                UpdatedOn = rate.UpdatedOn
            }).ToList();
        }      
`
    }

    usingStatement() {
        return `using ${this.referencingNamespace};
using System.Linq;`
    }
}
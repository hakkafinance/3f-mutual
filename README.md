# 3F Mutual

Third Floor Mutual (3F Mutual) is a rainy day fund like mechanism which helps you to hedge against MakerDAO collapse risk. It is neither an option nor a short position of ETH/DAI/MKR. Rainy day fund like design means it's more like collective insurance.



## The insurance of MakerDAO/DAI Stablecoin System

In brief, you get compensation when MakerDAO crashes (ESM triggered).

* There's a large pool(rainy day fund) underwriting insurance.
* You buy some units of insurance. The price of a single unit is determined by a given formula. Learn more.
* You can choose to pay an extra fee to get a longer insured period. The more you pay, the longer the insurance lasts.
* If MakerDAO ESM is triggered during your insured period, you will get parts of the funds in the pool, depending on the percentage of insurance units you have.
* When you buy insurance, you will get attached shares as much as the number of units you buy. Unlike insurance, share never expires.
* When later players buy insurance, your portion of insurance is reduced, but you'll get dividends instead (from shares). It's fair, after all.
* With the concept of insurance, players can also turn out to be agents. Register as an agent and enjoy the referral system to step up for increasing referral bonuses.



## Pricing

The total price is the base price multiplying the insurance rate. Roughly speaking, the share price increases slightly as more and more shares are purchased. You can check the "Basis price" for the price of an individual share.

To buy insurance, the fee you need to pay multiplies by a rate. Accurately, the rate is set to 100% per insured day with a 1% depreciation, and the longest period you can buy is 100 days. By the way, you can buy 0-day insurance with the base price, which gives you merely share, with no insurance included.

In other words, you can get a discount if you buy longer insurance coverage. (bp stands for basis price, d is the insurance coverage length in a day)

![pricing formula](https://i.imgur.com/GQ4G1tF.png)

"A day of insurance" starts from the current time and ends sharply at 0:00 UTC (Coordinated Universal Time), regardless of your timezone. This means that the "time" is universal, the same for all applicants, to avoid tedious timezone conversions. For example, if you buy a 3-day insurance at 1:00 UTC, Sep. 3, it expires at 0:00 UTC, Sep. 6, effectively 71 hours in total. Notice that due to this nature, your insurance at the first day is subject to be incomplete.

For those who don't know what UTC is, we set up a tiny clock that reads the client's local time for reference.



## Ether distribution

Your insurance-buying payments are distributed as follows:

| Destination |	Percentage | Side note |
| --- | --- | --- |
| Dividend | 15% | Distributed equally to all share holders |
| External | 25% | Distributed to agents(0 ~ 16%) and community |
| Pool | 60% |  |



## Referrals

This is the featured part of the game.

### Referral links

Registering a name (i.e., becoming an agent) unlocks a set of links for advisory. If an applicant clicks your link, you are logged as his referrer. When he further purchases insurance, you receive a special amount of money called the referral income.

There are three types of referral links: per-wallet, per-name, and by serial number (anonymous link), whose function is the same. You can choose the best suit for your needs. Notice that referrer information is stored in the browser, not hooked to that account, and is overwritten when entering the other referrer's link.

A secret: you can use your own referral link. You will get the referral bonus as well.

### Agent system

The referral bonus is calculated as follows:

1. If there is no referrer (agent), no bonus is spared from the fund.
2. Otherwise, the referrer receives a fixed part of the fund, according to the referrer's level (ranging from 1 to 10).

| Level | Required referral income | Referral bonus |
| --- | --- | --- |
| 0 |	N/A |	0% |
| 1	| 0	| 7% |
| 2	| 0.073891 | 8% |
| 3 |	0.200855 | 9% |
| 4	| 0.545981 | 10% |
| 5	| 1.484132 | 11% |
| 6	| 4.034288 | 12% |
| 7	| 10.966332	| 13% |
| 8 |	29.807980 | 14% |
| 9 |	81.030839 | 15% |
| 10 | 220.264658 | 16% |

Upon registration, you start at level 1. Your referral income is accumulated within each round, unaffected by withdrawals. If your referral income meets the requirement of higher levels, you can send a "upgrade" request and hop onto the next level.



## The vault

Your dividends and referral incomes do not directly go to your wallet. Instead, they are kept in the vault. It is a safe place for your money so that you can withdraw it whenever you want. When the round ends, you can also claim your compensation there.

### When MarkDAO ESM has been triggered

![compensation formula](https://i.imgur.com/QV058W7.png)

where IU = insurance units. The contract will stay there for you to take your money. Then look forward to the next round!



## Glossary
* **Applicant**: You. The player of the game. Precisely, An Ethereum address was interacting with our contracts.
* **Agent**: A applicant who registers one or more names. When one becomes an agent, they can use the referral links to invite other applicants.
* **Share**: The tickets of the game. An applicant with share receives dividends from other applicants when they also buy a share. Unlike insurance, they don't expire upon purchase.
* **Pool**: Asset stored in the contract for compensation. Will only be used to pay the applicant.
* **Emergency Shutdown**: DAI Stablecoin System totally shutdowns. A one-time event that only takes place when Maker governance crashes.



## In-depth tutorials
Here are the [tutorials](https://3fmutual.hostedwiki.co/) for you to understand the details of Third Floor Mutual.



## Contact us
Join our Hakka Finance Community on [Discord](https://discordapp.com/invite/cU4D2a8) or [Telegram](https://t.me/hakkafinance)


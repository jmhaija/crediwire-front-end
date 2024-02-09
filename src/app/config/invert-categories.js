define({
    inverted: [
        // *** REVENUE ***

        // level 0
        'Revenue',
        // - level 1
        'CoreRevenue',
        // - - level 2
        'SalesVat',
        'SalesNoVat',
        'SalesEu',
        'SalesEuNoVat',
        'SalesThirdCountry',
        'WorkInProgress',
        'UnspecifiedCoreRevenue',
        // - level 1
        'RevenueReductions',
        'NonCoreRevenue',
        // - - level 2
        'SubsidiesGrantsSponsorships',
        'OtherRemunerationAndRevenue',
        'RentalIncome',
        'UnspecifiedNonCoreRevenue',
        // - level 1
        'UnspecifiedRevenue',

        // level 0
        'VariableCosts',
        // - level 1
        'CostGoodsMaterialsAndSubContract',
        // - - level 2
        'ChangeInInventoriesProductsAndWip',
        'PriceReductions',
        'CostOfGoodsSold',
        'SubContractors',
        'UnspecifiedCostGoodsMaterialsAndSubContract',
        // - level 1
        'Software',
        'UnspecifiedVariableCosts',

        //level 0
        'GrossProfit',
        //level 0
        'FixedCosts',
        // - level 1
        'SalesCosts',
        // - - level 2
        'Advertisement',
        'Representation',
        'TravelCosts',
        'ReimbursedPersonalCarUsage',
        'UnspecifiedSalesCosts',
        // - level 1
        'RentalCosts',
        // - - level 2
        'Rent',
        'CommonCosts',
        'Maintenance',
        'Utilities',
        'Security',
        'CleaningAndRenovation',
        'PropertyTaxCommonCosts',
        'PropertyTaxMaintenance',
        'PropertyTax',
        'PropertyTaxUtilities',
        'RentalFurnitureLeasing',
        'RoomMinorPurchases',
        'UnspecifiedRentalCosts',
        // - level 1
        'OtherExternal',
        // - - level 2
        'TelephoneAndInternet',
        'ItSoftwareDomainCosts',
        'OfficeSupplies',
        'MinorPurchases',
        'FurnitureMaintenance',
        'Accountant',
        'AccountingAssistance',
        'Lawyer',
        'OtherAdvisers',
        'Literature',
        'PostageAndFees',
        'TemporaryEmployees',
        'NonDeductibleCosts',
        'Insurance',
        'Subscriptions',
        'ExternalFurnitureLeasing',
        'DebtorLoss',
        'ProvisionDebtorLoss',
        'UnspecifiedOtherExternal',
        //level 1
        'PersonalVehicle',
        //level 2
        'PersonalVehicleFuel',
        'PersonalVehicleRepairAndMaintenance',
        'PersonalVehicleInsuranceAndCirculationTax',
        'PersonalVehicleRentalAndLeasing',
        'UnspecifiedPersonalVehicle',
        //level 1
        'CompanyVehicle',
        //level 2
        'CompanyVehicleFuel',
        'CompanyVehicleRepairAndMaintenance',
        'CompanyVehicleInsuranceAndCirculationTax',
        'CompanyVehicleRentalAndLeasing',
        'UnspecifiedCompanyVehicle',
        //level 1
        'FixedWages',
        //level 2
        'WagesAndBenefits',
        'LaborCostTax',
        'OtherPersonnelCost',
        'Pension',
        'CashRemunerationAndBenefits',
        'SocialCosts',
        'UnspecifiedFixedWages',
        //level 1
        'OtherOperatingExpenses',
        'UnspecifiedFixedCosts',

        //level 0
        'ResearchDevelopment',
        //level 1
        'ResearchExpenses',
        'DevelopmentExpenses',
        'UnspecifiedResearchDevelopment',

        //level 0
        'OperatingExpensesOPEX',

        //level 0
        'OperatingIncomeBeforeInterestsTaxDepreciationAndAmortization',
        'NonOperationalIncomeExpense',
        //level 1
        'NonOperationalIncome',
        //level 2
        'NonOperationalIncomeFromLeasingRenting',
        'UnspecifiedNonOperationalIncome',
        //level 1
        'NonOperationalExpense',
        //level 2
        'NonOperationalExpenseFromLeasingRenting',
        'UnspecifiedNonOperationalExpense',
        //level 1
        'OtherNonOperationalIncomeExpense',
        'UnspecifiedNonOperationalIncomeExpense',

        //level 0
        'EarningsBeforeInterestsTaxDepreciationAndAmortizationEBITDA',

        //level 0
        'Depreciation',
        //--level 1
        'MaterialDepreciation',
        //---level 2
        'DecorRentalDepreciation',
        'BuildingDepreciation',
        'ProductionPlantAndMachineDepreciation',
        'OperatingEquipmentAndFurnishingDepreciation',
        'UnspecifiedMaterialDepreciation',
        //--level 1
        'WriteDownsTangibleAssets',
        //---level 2
        'WriteDownsLandAndBuildings',
        'WriteDownsMachineryAndEquipment',
        'ReversedWriteDownsLandAndBuildings',
        'ReversedWriteDownsMachineryAndEquipment',
        'UnspecifiedWriteDownsTangibleAssets',
        //--level 1
        'WriteDownsCurrentAssets',
        //---level 2
        'WriteDownsCertainCurrentAssets',
        'ReversedWriteDownsCertainCurrentAssets',
        'UnspecifiedWriteDownsCurrentAssets',
        //--level 1
        'UnspecifiedDepreciation',

        //level 0
        'OperatingIncomeBeforeInterestsTaxAndAmortization',
        'EarningsBeforeInterestsTaxAndAmortizationEBITA',

        //level 0
        'Amortization',
        //--level 1
        'WriteDownsIntangibleAssets',
        //---level 2
        'WriteDownsIntangibleFixedAssets',
        'ReversedWriteDownsIntangibleFixedAssets',
        'UnspecifiedWriteDownsIntangibleAssets',
        //--level 1
        'ImmaterialDepreciation',
        //---level 2
        'GoodwillDepreciation',
        'DevelopmentDepreciation',
        'RightsAndPatentsDepreciation',
        'UnspecifiedImmaterialDepreciation',
        //--level 1
        'UnspecifiedAmortization',

        //level 0
        'OperatingIncome',

        //level 0
        'EarningsBeforeInterestsAndTaxEBIT',

        // level 0
        'FinancialIncomeExpense',
        //--level 1
        'FinancialIncome',
        // - - level 2
        'BankInterestIncome',
        'ReceivableInterest',
        'ExchangeRateGains',
        'Dividend',
        'BondInterest',
        'CapitalGains',
        'CapitalLoss',
        'UnspecifiedFinancialIncome',
        //--level 1
        'FinancialExpenses',
        // - - level 2
        'BankInterestExpense',
        'PayableInterest',
        'PayableInterestRelatedParties',
        'ExchangeRateLoss',
        'InterestSubsidy',
        'FinancingFees',
        'LeasingInterest',
        'PriorityDebtInterest',
        'InterestExpense',
        'UnrealisedValueChangesInLiabilities',
        'UnspecifiedFinancialExpenses',
        // - level 1
        'UnspecifiedFinancialIncomeExpense',

        // level 0
        'ExIncomeExpense',
        // level 1
        'ExtraordinaryIncome',
        'ExtraordinaryExpenses',
        'UnspecifiedExIncomeExpense',

        //level 0
        'EarningsBeforeTaxEBT',
        // - level 1
        'CorporateTax',
        'PayableTax',
        'DeferredTax',
        'TaxCreditScheme',
        'UnspecifiedCorporateTax',

        //level 0
        'ProfitLoss',
        'ReserveMovements',

        // - level 1
        'SubsidiesGrantsSponsorships',

        // *** CASFLOW ANALYSIS ***
        'CF_EarningsBeforeInterestsTaxAmortizations',
        'CF_TaxOnEbita',
        'CF_NetOperatingProfitLessAdjustedTax',
        'CF_ChangeInNonOperatingLiabilities',
        'CF_NetLongTermNonOperatingLiabilities',
        'CF_NetShortTermNonOperatingLiabilities',
        'CF_FinancialItems',
        'CF_DividendsFromAssociatedCompaniesAfterTax',
        'CF_TaxOnFinancialItems',
        'CF_NetShortTermInterestDebt',
        'CF_NetShortTermNonInterestDebt',
        'CF_NetLongTermInterestBearingDebt',
        'CF_NetUnspecifiedLongTermIntBearingDebt',
        'CF_NetLongTermNonInterestBearingDebt',
        'CF_NetOtherLongTermNonInterestLiabilities',
        'CF_NetLongTermNonInterestLiabilitiesGroupCo',
        'CF_NetLongTermNonInterestLiabilitiesAssocCo',
        'CF_NetUnspecifiedLongTermNonInterestBearingDebt',
        'CF_ChangeInShortTermInterestDebt',
        'CF_NetLinkedCompaniesDebt',
        'CF_NetShortTermDebtJoinVenture',
        'CF_NetAssociatedCompaniesDebt',
        'CF_NetDebtToOwnerAndManagement',
        'CF_NetCurrentPartOfLongTerm',
        'CF_NetCurrentBanks',
        'CF_NetShortTermBondDebt',
        'CF_NetShortTermLeasingDebt',
        'CF_NetOtherShortTermInterestDebt',
        'CF_NetOtherTaxPayable',
        'CF_NetUnspecifiedShortTermInterestDebt',
        'CF_ChangeInShortTermNonInterestDebt',
        'CF_NetShortTermNonInterestDebtAssocCo',
        'CF_NetShortTermNonInterestDebtGroupCo',
        'CF_NetOtherShortTermNonInterestDebt',
        'CF_NetUnspecifiedShortTermNonInterestDebt',
        'CF_NetTotalDebt',
        'CF_PaidDividend',
        'CF_ShareBuyBacks',
        'CF_ShareIssues',
        'CF_OtherInvestmentAdjustment',
        'CF_FinancingActivities',

        //level 0
        'SumRetainedEarnings',

        // *** EQUITY ***

        // level 0
        'Equity',

        // level 0
        'Capital',

        // - level 1
        'PersonalCompany',
        'SumPersonalCompany',

        // - - level 2
        'CompanyDepositsPrimo',
        'CashWithdrawals',
        'PayedTaxes',
        'PersonalShares',
        'PartOfResult',
        'UnspecifiedSumPersonalCompany',

        // - level 1
        'SumCorporation',
        'Corporation',

        // - - level 2
        'ShareCapital',
        'ProfitsFund',
        'RetainedEarnings',
        'EquityAppreciation',
        'EquityDepreciation',
        'ReserveIVS',
        'DevelopmentCostReserve',
        'Dividends',
        'UnspecifiedSumCorporation',
        // - level 1
        'UnspecifiedCapital',
        // level 0
        'SumRetainedEarnings',
        'SumEquity',
        // *** LIABILITY ***

        // level 0
        'LongTermLiabilities',
        // - level 1
        'LongTermInterestDebtOtherParties',
        'LongTermInterestBearingDebt',
        // - - level 2
        'LongTermDebtSubsidiaries',
        'LongTermDebtJoinVenture',
        'LongTermDebtAssociatedCompanies',
        'SubordinatedLoan',
        'DebtToOwnersAndManagement',
        'MortgageLoans',
        'LongTermBanks',
        'LongTermBondDebt',
        'LongTermLeasingDebt',
        'OtherLongTermDebt',
        'UnspecifiedLongTermInterestBearingDebt',
        // - level 1
        'LongTermNonInterestBearingDebt',
        // - - level 2
        'LongTermNonInterestLiabilitiesGroupCo',
        'LongTermNonInterestLiabilitiesAssocCo',
        'OtherLongTermNonInterestLiabilities',
        'UnspecifiedLongTermNonInterestBearingDebt',
        // - level 1
        'LongTermOperationalLiabilities',
        // - - level 2
        'LongTermPayables',
        'LongTermLiabilityCorporateTax',
        'UnspecifiedLongTermOperationalLiabilities',
        // - level 1
        'LongTermOperationalLiabilities',
        'LongTermNonOperationalLiabilities',
        // - - level 2
        'Provisions',
        'LiabilityDeferredTax',
        'LongTermDerivativesAndFinancialInstruments',
        'DefinedBenefitPlansDeficit',
        'UnspecifiedLongTermNonOperationalLiabilities',
        // - level 1
        'UnspecifiedLongTermLiabilities',

        // level 0
        'SumCurrentLiabilities',
        // - level 1
        'ShortTermInterestDebtRelatedParties',

        // - - level 2
        'LinkedCompaniesDebt',
        'ShortTermDebtJoinVenture',
        'AssociatedCompaniesDebt',
        'DebtToOwnerAndManagement',
        'CurrentPartOfLongTerm',
        'CurrentBanks',
        'ShortTermBondDebt',
        'ShortTermLeasingDebt',
        'OtherShortTermInterestDebt',
        'UnspecifiedShortTermInterestDebt',
        // - level 1
        'ShortTermNonInterestDebt',
        // - - level 2
        'ShortTermNonInterestDebtAssocCo',
        'ShortTermNonInterestDebtGroupCo',
        'OtherShortTermNonInterestDebt',
        'UnspecifiedShortTermNonInterestDebt',
        // - level 1
        'ShortTermOperationalLiabilities',
        // - - level 2
        'Payables',
        'AdvancePayments',
        'AdvanceBilling',
        'CurrentLiabilityCorporateTax',
        'OwedTaxAndContribution',
        'OwedVacationPay',
        'DeferredVacationLiabilities',
        'OwedAccountant',
        'OwedEmployeeExpenditures',
        'OtherCurrentDebt',
        'UnspecifiedShortTermOperationalLiabilities',
        // - level 1
        'VatAndDutiesPayable',
        // -- level 2
        'VatPayable',
        'UnspecifiedVatAndDutiesPayable',
        // - level 1
        'ShortTermNonOperationalLiabilities',
        // - - level 2
        'ShortTermDerivativesAndFinancialInstruments',
        'UnspecifiedShortTermNonOperationalLiabilities',
        // - level 1
        'UnspecifiedSumCurrentLiabilities',

        'ShortTermInterestDebt',

        // level 0
        'TotalLiabilities',
        'TotalEquityAndLiabilities',
        'ZeroControl',
    ]
});

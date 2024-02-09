define([], function(){
  const getValues = ({index, reference, referenceMap}) => referenceMap[reference][index].values;

  const getValue = ({index, palBalIdx, referenceMap, reference}) => getValues({index, reference, referenceMap})[palBalIdx].value;

  const getValueByReference = ({index, palBalIdx, referenceMap}) => {
    return (reference) => {
      return getValue({index, palBalIdx, referenceMap, reference})
    };
  };

  const getAggValues = ({reference, referenceMap}) => {
    return referenceMap[reference].values;
  }

  const getAggValue = ({palBalIdx, referenceMap, reference}) => getAggValues({reference, referenceMap})[palBalIdx].value;

  const getAggValueByReference = ({palBalIdx, referenceMap}) => {
    return reference => getAggValue({palBalIdx, referenceMap, reference})
  }

  const getDefinitionValue = ({index, palBalIdx, referenceMap, aggregated}) => {
    return aggregated ? getAggValueByReference({palBalIdx, referenceMap}) : getValueByReference({index, palBalIdx, referenceMap});
  }

  const getPalDefinitionValue = ({index, palIdx, referenceMap, aggregated}) => {
     return aggregated ? getAggValueByReference({palBalIdx: palIdx, referenceMap}) : getValueByReference({index, palBalIdx: palIdx, referenceMap});
  };

  const getBalDefinitionValue = ({index, balIdx, referenceMap, aggregated}) => {
    return aggregated ? getAggValueByReference({palBalIdx: balIdx, referenceMap}) : getValueByReference({index, palBalIdx: balIdx, referenceMap});
  };

  const getOpeningBalValue = ({index, referenceMap, aggregated, cashbook, isBudget}) => {
    let openingBalValueIdx = cashbook ? 7 : 6;

    if (isBudget) {
      openingBalValueIdx = 3;
    }

    return getDefinitionValue({index, palBalIdx: openingBalValueIdx, referenceMap, aggregated});
  }

  const getClosingBalValue = ({index, referenceMap, aggregated, cashbook, isBudget}) => {
    let closingBalValueIdx = cashbook ? 5 : 4;

    if (isBudget) {
      closingBalValueIdx = 2;
    }

    return getDefinitionValue({index, palBalIdx: closingBalValueIdx, referenceMap, aggregated});
  }

  const getNetValue = ({index, referenceMap, aggregated, cashbook, isBudget}) => {
      let closingBalValueIdx = cashbook ? 5 : 4;
      let openingBalValueIdx = cashbook ? 7 : 6;

      if (isBudget) {
        closingBalValueIdx = 2;
        openingBalValueIdx = 3;
      }

      const getClosingBalValue = getDefinitionValue({index, palBalIdx: closingBalValueIdx, referenceMap, aggregated});
      const getOpeningBalValue = getDefinitionValue({index, palBalIdx: openingBalValueIdx, referenceMap, aggregated});

      return reference => {
        return getClosingBalValue(reference) - getOpeningBalValue(reference)
      };
  };


  const VatAndDutiesReceivable = ({getDefinitionValue}) => {
    const VatAndDuties = getDefinitionValue('VatAndDuties');

    return VatAndDuties > 0 ? VatAndDuties : 0;
  };

  const GrossProfit = ({getDefinitionValue}) => {
    const Revenue = getDefinitionValue('Revenue');
    const VariableCosts = getDefinitionValue('VariableCosts');

    return Revenue + VariableCosts
  };

  const OperatingExpensesOPEX = ({getDefinitionValue}) => {
    const FixedCosts = getDefinitionValue('FixedCosts');
    const ResearchDevelopment = getDefinitionValue('ResearchDevelopment');

    return FixedCosts + ResearchDevelopment;
  };

  const OperatingIncomeBeforeInterestsTaxDepreciationAndAmortization = ({getDefinitionValue}) => {
    //sum:GrossProfit + sum:OperatingExpensesOPEX
    return GrossProfit({getDefinitionValue}) + OperatingExpensesOPEX({getDefinitionValue});
  };

  const EarningsBeforeInterestsTaxDepreciationAndAmortizationEBITDA = ({getDefinitionValue}) => {
    //sum:GrossProfit + sum:OperatingExpensesOPEX + NonOperationalIncomeExpense
    const NonOperationalIncomeExpense = getDefinitionValue('NonOperationalIncomeExpense')

    return GrossProfit({getDefinitionValue}) + OperatingExpensesOPEX({getDefinitionValue}) + NonOperationalIncomeExpense;
  }

  const OperatingIncomeBeforeInterestsTaxAndAmortization = ({getDefinitionValue}) => {
    //sum:OperatingIncomeBeforeInterestsTaxDepreciationAndAmortization + Depreciation
    const Depreciation = getDefinitionValue('Depreciation');

    return OperatingIncomeBeforeInterestsTaxDepreciationAndAmortization({getDefinitionValue}) + Depreciation;
  };

  const EarningsBeforeInterestsTaxAndAmortizationEBITA = ({getDefinitionValue}) => {
    //sum:EarningsBeforeInterestsTaxDepreciationAndAmortizationEBITDA + Depreciation
    const Depreciation = getDefinitionValue('Depreciation');

    return EarningsBeforeInterestsTaxDepreciationAndAmortizationEBITDA({getDefinitionValue}) + Depreciation;
  };

  const EarningsBeforeInterestsAndTaxEBIT = ({getDefinitionValue}) => {
    //sum:EarningsBeforeInterestsTaxAndAmortizationEBITA + Amortization
    const Amortization = getDefinitionValue('Amortization');

    return EarningsBeforeInterestsTaxAndAmortizationEBITA({getDefinitionValue}) + Amortization;
  };

  const EarningsBeforeTaxEBT = ({getDefinitionValue}) => {
    //sum:EarningsBeforeInterestsAndTaxEBIT + FinancialIncomeExpense + ExIncomeExpense
    const FinancialIncomeExpense = getDefinitionValue('FinancialIncomeExpense');
    const ExIncomeExpense = getDefinitionValue('ExIncomeExpense');

    return EarningsBeforeInterestsAndTaxEBIT({getDefinitionValue}) + FinancialIncomeExpense + ExIncomeExpense;
  };

  const SumCorporation = ({getDefinitionValue}) => {
    const Corporation = getDefinitionValue('Corporation');
    const RetainedEarnings = getDefinitionValue('RetainedEarnings');

    return Corporation + (-RetainedEarnings);
  };

  const ProfitLoss = ({getDefinitionValue}) => {
    //sum:EarningsBeforeTaxEBT + CorporateTax
    const CorporateTax = getDefinitionValue('CorporateTax');

    return EarningsBeforeTaxEBT({getDefinitionValue}) + CorporateTax;
  };

  const ReserveMovements = ({getDefinitionValue}) => getDefinitionValue('ReserveMovements');

  const Capital = ({getDefinitionValue}) => {
    const Equity = getDefinitionValue('Equity');
    const RetainedEarnings = getDefinitionValue('RetainedEarnings');
    const PartOfResult = getDefinitionValue('PartOfResult');

    return Equity + (-RetainedEarnings) + (-PartOfResult);
  };

  const SumRetainedEarnings = ({getDefinitionValue, getPalDefinitionValue}) => {
    //sum:ProfitLoss + ReserveMovements + RetainedEarnings + PartOfResult

    const RetainedEarnings = getDefinitionValue('RetainedEarnings');
    const PartOfResult = getDefinitionValue('PartOfResult');
    const ReserveMovements = getPalDefinitionValue('ReserveMovements');

    return ProfitLoss({getDefinitionValue}) + ReserveMovements + RetainedEarnings + PartOfResult;
  };

  const VatReceivable = ({getDefinitionValue}) => {
    //Vat IF VatAndDuties DEBIT ELSE 0
    const Vat = getDefinitionValue('Vat');
    const VatAndDuties = getDefinitionValue('VatAndDuties');

    return VatAndDuties > 0 ? Vat : 0
  };

  const VatAndDutiesPayable = ({getDefinitionValue}) => {
    const VatAndDuties = getDefinitionValue('VatAndDuties');

    return VatAndDuties < 0 ? VatAndDuties : 0;
  };

  const SumCurrentLiabilities = ({getDefinitionValue}) => {
    const CurrentLiabilities = getDefinitionValue('CurrentLiabilities');

    return CurrentLiabilities + VatAndDutiesPayable({getDefinitionValue});
  };

  const VatPayable = ({getDefinitionValue}, getBalDefinitionValue) => {
    //Vat IF VatAndDuties CREDIT ELSE 0
    const Vat = getDefinitionValue('Vat');
    const VatAndDuties = getDefinitionValue('VatAndDuties');

    return VatAndDuties <= 0 ? Vat : 0;
  };

  const SumEquity = ({getDefinitionValue, getPalDefinitionValue}) => {
    //categorySum:Capital + categorySum:SumRetainedEarnings

    return Capital({getDefinitionValue}) + SumRetainedEarnings({getDefinitionValue, getPalDefinitionValue});
  };

  const TotalLiabilities = ({getDefinitionValue}) => {
    //LongTermLiabilities + CurrentLiabilities
    const LongTermLiabilities = getDefinitionValue('LongTermLiabilities');

    return LongTermLiabilities + SumCurrentLiabilities({getDefinitionValue});
  };

  const TotalEquityAndLiabilities = ({getDefinitionValue, getPalDefinitionValue}) => {
    //sum:SumEquity + sum:TotalLiabilities
    return SumEquity({getDefinitionValue, getPalDefinitionValue}) + TotalLiabilities({getDefinitionValue});
  };

  const TotalAssets = ({getDefinitionValue}) => {
    //LongTermAssets + CurrentAssets;
    const LongTermAssets = getDefinitionValue('LongTermAssets');
    const CurrentAssets = getDefinitionValue('CurrentAssets');

    return LongTermAssets + SumCurrentAssets({getDefinitionValue});
  };

  const UnspecifiedLongTermAssets = ({getDefinitionValue}) => {
    const LongTermAssets = getDefinitionValue('LongTermAssets');
    const ImmaterialAssets = getDefinitionValue('ImmaterialAssets');
    const MaterialAssets = getDefinitionValue('MaterialAssets');

    return LongTermAssets - (ImmaterialAssets + MaterialAssets)
  };

  const UnspecifiedLongTermInterestBearingDebt = ({getDefinitionValue}) => {
    const LongTermInterestBearingDebt = getDefinitionValue('LongTermInterestBearingDebt');
    const LongTermDebtSubsidiaries = getDefinitionValue('LongTermDebtSubsidiaries');
    const LongTermDebtJoinVenture = getDefinitionValue('LongTermDebtJoinVenture');
    const LongTermDebtAssociatedCompanies = getDefinitionValue('LongTermDebtAssociatedCompanies');
    const SubordinatedLoan = getDefinitionValue('SubordinatedLoan');
    const DebtToOwnersAndManagement = getDefinitionValue('DebtToOwnersAndManagement');
    const MortgageLoans = getDefinitionValue('MortgageLoans');
    const LongTermBanks = getDefinitionValue('LongTermBanks');
    const LongTermBondDebt = getDefinitionValue('LongTermBondDebt');
    const LongTermLeasingDebt = getDefinitionValue('LongTermLeasingDebt');
    const OtherLongTermDebt = getDefinitionValue('OtherLongTermDebt');

    return LongTermInterestBearingDebt - (LongTermDebtSubsidiaries + LongTermDebtJoinVenture + LongTermDebtAssociatedCompanies + SubordinatedLoan + DebtToOwnersAndManagement + MortgageLoans + LongTermBanks + LongTermBondDebt + LongTermLeasingDebt + OtherLongTermDebt)
  }

  const UnspecifiedShortTermInterestDebt = ({getDefinitionValue}) => {
    const ShortTermInterestDebt = getDefinitionValue('ShortTermInterestDebt');
    const LinkedCompaniesDebt = getDefinitionValue('LinkedCompaniesDebt');
    const ShortTermDebtJoinVenture = getDefinitionValue('ShortTermDebtJoinVenture');
    const AssociatedCompaniesDebt = getDefinitionValue('AssociatedCompaniesDebt');
    const DebtToOwnerAndManagement = getDefinitionValue('DebtToOwnerAndManagement');
    const CurrentPartOfLongTerm = getDefinitionValue('CurrentPartOfLongTerm');
    const CurrentBanks = getDefinitionValue('CurrentBanks');
    const ShortTermBondDebt = getDefinitionValue('ShortTermBondDebt');
    const ShortTermLeasingDebt = getDefinitionValue('ShortTermLeasingDebt');
    const OtherTaxPayable = getDefinitionValue('OtherTaxPayable');
    const OtherShortTermInterestDebt = getDefinitionValue('OtherShortTermInterestDebt');

    return ShortTermInterestDebt - (LinkedCompaniesDebt + ShortTermDebtJoinVenture + AssociatedCompaniesDebt + DebtToOwnerAndManagement + CurrentPartOfLongTerm + CurrentBanks + ShortTermBondDebt + ShortTermLeasingDebt + OtherTaxPayable + OtherShortTermInterestDebt)
  }

  const UnspecifiedShortTermNonInterestDebt = ({getDefinitionValue}) => {
    //ShortTermNonInterestDebt - (ShortTermNonInterestDebtAssocCo + ShortTermNonInterestDebtGroupCo + OtherShortTermNonInterestDebt)
    const ShortTermNonInterestDebt = getDefinitionValue('ShortTermNonInterestDebt');
    const ShortTermNonInterestDebtAssocCo = getDefinitionValue('ShortTermNonInterestDebtAssocCo');
    const ShortTermNonInterestDebtGroupCo = getDefinitionValue('ShortTermNonInterestDebtGroupCo');
    const OtherShortTermNonInterestDebt = getDefinitionValue('OtherShortTermNonInterestDebt');

    return ShortTermNonInterestDebt - (ShortTermNonInterestDebtAssocCo + ShortTermNonInterestDebtGroupCo + OtherShortTermNonInterestDebt);
  };

  const SumCurrentAssets = ({getDefinitionValue}) => {
    //CurrentAssets + VatAndDutiesReceivable
    const CurrentAssets = getDefinitionValue('CurrentAssets');
    return CurrentAssets + VatAndDutiesReceivable({getDefinitionValue});
  };

  const SumPersonalCompany = ({getDefinitionValue}) => {
    const PersonalCompany = getDefinitionValue('PersonalCompany');
    const PartOfResult = getDefinitionValue('PartOfResult');

    return PersonalCompany + (-PartOfResult);
  };

  const UnspecifiedLongTermNonInterestBearingDebt = ({getDefinitionValue}) => {
    const LongTermNonInterestBearingDebt = getDefinitionValue('LongTermNonInterestBearingDebt');
    const LongTermNonInterestLiabilitiesGroupCo = getDefinitionValue('LongTermNonInterestLiabilitiesGroupCo');
    const LongTermNonInterestLiabilitiesAssocCo = getDefinitionValue('LongTermNonInterestLiabilitiesAssocCo');
    const OtherLongTermNonInterestLiabilities = getDefinitionValue('OtherLongTermNonInterestLiabilities');

    return LongTermNonInterestBearingDebt - (LongTermNonInterestLiabilitiesGroupCo + LongTermNonInterestLiabilitiesAssocCo + OtherLongTermNonInterestLiabilities)
  };

  const CF_EarningsBeforeInterestsTaxAmortizations = ({getPalDefinitionValue}) => {
    const Revenue = getPalDefinitionValue('Revenue');
    const VariableCosts = getPalDefinitionValue('VariableCosts');
    const FixedCosts = getPalDefinitionValue('FixedCosts');
    const ResearchDevelopment = getPalDefinitionValue('ResearchDevelopment');
    const Depreciation = getPalDefinitionValue('Depreciation');
    const NonOperationalIncomeExpense = getPalDefinitionValue('NonOperationalIncomeExpense');

    return Revenue + VariableCosts + FixedCosts + ResearchDevelopment + Depreciation + NonOperationalIncomeExpense;
  };

  const CF_TaxOnEbita = ({getPalDefinitionValue}) => {
    return CF_EarningsBeforeInterestsTaxAmortizations({getPalDefinitionValue}) * 0.22
  };

  const CF_NetOperatingProfitLessAdjustedTax = ({getPalDefinitionValue}) => {
    return CF_EarningsBeforeInterestsTaxAmortizations({getPalDefinitionValue}) + (-CF_TaxOnEbita({getPalDefinitionValue}))
  };

  const CF_NetLongTermNonOperatingLiabilities = ({getNetValue}) =>  getNetValue('LongTermNonOperationalLiabilities');

  const CF_NetShortTermNonOperatingLiabilities = ({getNetValue}) => getNetValue('ShortTermNonOperationalLiabilities');

  const CF_ChangeInNonOperatingLiabilities = (args) => CF_NetLongTermNonOperatingLiabilities(args) + CF_NetShortTermNonOperatingLiabilities(args)

  const CF_NetInventory = ({getNetValue}) => (getNetValue('Inventory'));

  const CF_NetReceivables = ({getNetValue}) => getNetValue('Receivables');

  const CF_NetOtherShortTermAssets = ({getDefinitionValue, getNetValue}) => {
    return getNetValue('OtherShortTermAssets') + VatAndDutiesReceivable({getDefinitionValue})
  };

  const CF_NetOtherOperatingShortTermAssets = ({getNetValue, getDefinitionValue, getOpeningBalValue, getClosingBalValue}) => {
    //NET|SumCurrentAssets + -NET|Inventory + -NET|Receivables + -NET|OtherShortTermAssets + -NET|Securities + -NET|Cash
    const Inventory = getNetValue('Inventory');
    const Receivables = getNetValue('Receivables');
    const OtherShortTermAssets = getNetValue('OtherShortTermAssets');
    const Securities = getNetValue('Securities');
    const Cash = getNetValue('Cash');

    const CurrentAssets = getNetValue('CurrentAssets');
    const VatAndDutiesReceivableNet = VatAndDutiesReceivable({getDefinitionValue: getClosingBalValue}) - VatAndDutiesReceivable({getDefinitionValue: getOpeningBalValue})
    const NetSumCurrentAssets = CurrentAssets + VatAndDutiesReceivableNet;

    return NetSumCurrentAssets + -(Inventory) + -(Receivables) + -(OtherShortTermAssets) + -(Securities) + -(Cash);
  };

  const CF_NetShortTermInterestDebt = ({getNetValue}) => getNetValue('ShortTermInterestDebt');

  const CF_NetShortTermNonInterestDebt = ({getNetValue}) => getNetValue('ShortTermNonInterestDebt');

  const CF_NetShortTermOperatingLiabilities = ({getNetValue, getOpeningBalValue, getClosingBalValue}) => {
    const NetVatAndDutiesPayable = VatAndDutiesPayable({getDefinitionValue: getClosingBalValue}) - VatAndDutiesPayable({getDefinitionValue: getOpeningBalValue})

    return (getNetValue('ShortTermOperationalLiabilities') + NetVatAndDutiesPayable) * -1;
  };

  const CF_NetOtherOperatingShortTermLiabilities = ({getNetValue, getOpeningBalValue, getClosingBalValue}) => {
    //NET|SumCurrentLiabilities + -NET|ShortTermInterestDebt + -NET|ShortTermNonInterestDebt + -NET|ShortTermOperationalLiabilities + -NET|ShortTermNonOperationalLiabilities
    const ShortTermInterestDebt = getNetValue('ShortTermInterestDebt');
    const ShortTermNonInterestDebt = getNetValue('ShortTermNonInterestDebt');
    const ShortTermOperationalLiabilities = getNetValue('ShortTermOperationalLiabilities');
    const ShortTermNonOperationalLiabilities = getNetValue('ShortTermNonOperationalLiabilities');

    const CurrentLiabilities = getNetValue('CurrentLiabilities');

    const NetVatAndDutiesPayable = VatAndDutiesPayable({getDefinitionValue: getClosingBalValue}) - VatAndDutiesPayable({getDefinitionValue: getOpeningBalValue});
    const NetSumCurrentLiabilities = CurrentLiabilities + NetVatAndDutiesPayable;

    return (NetSumCurrentLiabilities + (-ShortTermInterestDebt) + (-ShortTermNonInterestDebt) + (-ShortTermOperationalLiabilities) + (-ShortTermNonOperationalLiabilities)) * -1
  }

  const CF_NetWorkingCapital = (args) => {
    return (CF_NetInventory(args)) + CF_NetReceivables(args) + CF_NetOtherShortTermAssets(args) + CF_NetOtherOperatingShortTermAssets(args) - CF_NetShortTermInterestDebt(args) - CF_NetShortTermNonInterestDebt(args) + CF_NetShortTermOperatingLiabilities(args) + CF_NetOtherOperatingShortTermLiabilities(args)
  }

  const CF_FreeCashFlowFromOperations = (args) => {
    //CF_NetOperatingProfitLessAdjustedTax + Depreciation + CF_ChangeInNonOperatingLiabilities + CF_NetWorkingCapital
    const Depreciation = getPalDefinitionValue(args)('Depreciation');

    return (-CF_NetOperatingProfitLessAdjustedTax(args)) - Depreciation - CF_ChangeInNonOperatingLiabilities(args) + CF_NetWorkingCapital(args)
  };

  const CF_CapitalExpenditures = ({getBalDefinitionValue, getPalDefinitionValue, getNetValue}) => {
    return (-getNetValue('MaterialAssets')) + (-getPalDefinitionValue('Depreciation'))
  }

  const CF_FreeCashFlowToFirm = (args) => {
    //CF_FreeCashFlowFromOperations + CF_CapitalExpenditures

    return CF_FreeCashFlowFromOperations(args) - CF_CapitalExpenditures(args);
  };

  const CF_FinancialItems = ({getPalDefinitionValue}) => {
    return getPalDefinitionValue('FinancialIncomeExpense');
  };

  //TODO: Ask where is the definition for this one since we do not have category like this on th backend side
  const CF_DividendsFromAssociatedCompaniesAfterTax = () => 0;

  const CF_TaxOnFinancialItems = ({getPalDefinitionValue}) => {
    //CorporateTax + -CF_TaxOnEbita
    const CorporateTax = getPalDefinitionValue('CorporateTax');

    return CorporateTax + (-CF_TaxOnEbita({getPalDefinitionValue}));
  }

  const CF_FreeCashFlowToEquity = (args) => {
    //CF_FreeCashFlowToFirm + CF_FinancialItems + CF_DividendsFromAssociatedCompaniesAfterTax + CF_TaxOnFinancialItems

    return CF_FreeCashFlowToFirm(args) + (CF_FinancialItems(args) * -1) + (CF_DividendsFromAssociatedCompaniesAfterTax(args) * -1) + (CF_TaxOnFinancialItems(args) * - 1)
  };


  const CF_AcquisitionsDivestmentIntangibleAssets = ({getPalDefinitionValue, getBalDefinitionValue, getNetValue}) => {
    //NET|ImmaterialAssets + Depreciation
    return getNetValue('ImmaterialAssets') - getPalDefinitionValue('Depreciation');
  };

  const CF_AcquisitionsDivestmentTangibleAssets = ({getPalDefinitionValue, getBalDefinitionValue, getNetValue}) => {
    //NET|MaterialAssets + Depreciation
    return getNetValue('MaterialAssets') - getPalDefinitionValue('Depreciation');
  };

  const CF_AcquisitionsDivestmentLongTermAssetsUnspecified = ({getNetValue}) => {
    //NET|UnspecifiedLongTermAssets
    return UnspecifiedLongTermAssets({getDefinitionValue: getNetValue});
  }

  const CF_InvestmentActivities = (argsObj) => {
    //CF_AcquisitionsDivestmentIntangibleAssets + CF_AcquisitionsDivestmentTangibleAssets + CF_AcquisitionsDivestmentLongTermAssetsUnspecified
    return CF_AcquisitionsDivestmentIntangibleAssets(argsObj) + CF_AcquisitionsDivestmentTangibleAssets(argsObj) + CF_AcquisitionsDivestmentLongTermAssetsUnspecified(argsObj);
  };


  const CF_FreeCashFlowAfterInvestmentActivities = (argsObj) => {
    //CF_FreeCashFlowToEquity + CF_AcquisitionsDivestmentIntangibleAssets + CF_AcquisitionsDivestmentLongTermAssetsUnspecified
    return CF_FreeCashFlowToEquity(argsObj) + CF_AcquisitionsDivestmentIntangibleAssets(argsObj) + CF_AcquisitionsDivestmentLongTermAssetsUnspecified(argsObj)
  };


  const CF_PaidDividend = ({getBalDefinitionValue, getNetValue}) => {
    return Capital({getDefinitionValue: getNetValue})
  };
  //TODO: Find definiton for this one
  const CF_ShareBuyBacks = () => 0;
  //TODO: Find definiton for this one
  const CF_ShareIssues = () => 0;
  //TODO: Find definiton for this one
  const CF_OtherInvestmentAdjustment = () => 0;

  const CF_FinancingActivities = (argsObj) => {
    //CF_PaidDividend + CF_ShareBuyBacks + CF_ShareIssues + CF_OtherInvestmentAdjustment
    return CF_PaidDividend(argsObj) + CF_ShareBuyBacks() + CF_ShareIssues() + CF_OtherInvestmentAdjustment()
  };


  const CF_NetLongTermDebtSubsidiaries = ({getNetValue}) => getNetValue('LongTermDebtSubsidiaries');

  const CF_NetLongTermDebtJoinVenture = ({getNetValue}) => getNetValue('LongTermDebtJoinVenture');

  const CF_NetLongTermDebtAssCompanies = ({getNetValue}) => getNetValue('LongTermDebtAssociatedCompanies');

  const CF_NetSubordinatedLoan = ({getNetValue}) => getNetValue('SubordinatedLoan');

  const CF_NetDebtToOwnersAndManagement = ({getNetValue}) => getNetValue('DebtToOwnersAndManagement');

  const CF_NetMortgageLoans = ({getNetValue}) => getNetValue('MortgageLoans');

  const CF_NetLongTermBanks = ({getNetValue}) => getNetValue('LongTermBanks');

  const CF_NetLongTermLeasingDebt = ({getNetValue}) => getNetValue('LongTermLeasingDebt');

  const CF_NetOtherLongTermDebt = ({getNetValue}) => getNetValue('OtherLongTermDebt');

  const CF_NetUnspecifiedLongTermIntBearingDebt = ({getNetValue}) => UnspecifiedLongTermInterestBearingDebt({getDefinitionValue: getNetValue});

  const CF_NetLongTermInterestBearingDebt = (argsObj) => {
    return CF_NetLongTermDebtSubsidiaries(argsObj) + CF_NetLongTermDebtJoinVenture(argsObj) + CF_NetLongTermDebtAssCompanies(argsObj) + CF_NetSubordinatedLoan(argsObj) + CF_NetDebtToOwnersAndManagement(argsObj) + CF_NetMortgageLoans(argsObj) + CF_NetLongTermBanks(argsObj) + CF_NetLongTermLeasingDebt(argsObj) + CF_NetOtherLongTermDebt(argsObj) + CF_NetUnspecifiedLongTermIntBearingDebt(argsObj)
  }


  const CF_NetLongTermNonInterestLiabilitiesGroupCo = ({getNetValue}) => getNetValue('LongTermNonInterestLiabilitiesGroupCo');

  const CF_NetLongTermNonInterestLiabilitiesAssocCo = ({getNetValue}) => getNetValue('LongTermNonInterestLiabilitiesAssocCo');

  const CF_NetOtherLongTermNonInterestLiabilities = ({getNetValue}) => getNetValue('OtherLongTermNonInterestLiabilities');

  const CF_NetUnspecifiedLongTermNonInterestLiabilitiesGroupCo = () => 0;

  const CF_NetLongTermNonInterestBearingDebt = (argsObj) => {
    return CF_NetLongTermNonInterestLiabilitiesGroupCo(argsObj) + CF_NetLongTermNonInterestLiabilitiesAssocCo(argsObj) + CF_NetOtherLongTermNonInterestLiabilities(argsObj) + CF_NetUnspecifiedLongTermNonInterestBearingDebt(argsObj)
  }


  const CF_NetLinkedCompaniesDebt = ({getNetValue}) => getNetValue('LinkedCompaniesDebt');

  const CF_NetShortTermDebtJoinVenture = ({getNetValue}) => getNetValue('ShortTermDebtJoinVenture');

  const CF_NetAssociatedCompaniesDebt = ({getNetValue}) => getNetValue('AssociatedCompaniesDebt');

  const CF_NetDebtToOwnerAndManagement = ({getNetValue}) => getNetValue('DebtToOwnerAndManagement');

  const CF_NetCurrentPartOfLongTerm = ({getNetValue}) => getNetValue('CurrentPartOfLongTerm');

  const CF_NetCurrentBanks = ({getNetValue}) => getNetValue('CurrentBanks');

  const CF_NetShortTermBondDebt = ({getNetValue}) => getNetValue('ShortTermBondDebt');

  const CF_NetShortTermLeasingDebt = ({getNetValue}) => getNetValue('ShortTermLeasingDebt');

  const CF_NetOtherTaxPayable = ({getNetValue}) => getNetValue('OtherTaxPayable');

  const CF_NetOtherShortTermInterestDebt = ({getNetValue}) => getNetValue('OtherShortTermInterestDebt');

  const CF_NetUnspecifiedShortTermInterestDebt = ({getNetValue}) => UnspecifiedShortTermInterestDebt({getDefinitionValue: getNetValue});

  const CF_ChangeInShortTermInterestDebt = (argsObj) => {
    return CF_NetLinkedCompaniesDebt(argsObj) + CF_NetShortTermDebtJoinVenture(argsObj) + CF_NetAssociatedCompaniesDebt(argsObj) + CF_NetDebtToOwnerAndManagement(argsObj) + CF_NetCurrentPartOfLongTerm(argsObj) + CF_NetCurrentBanks(argsObj) + CF_NetShortTermBondDebt(argsObj) + CF_NetShortTermLeasingDebt(argsObj) + CF_NetOtherTaxPayable(argsObj) + CF_NetOtherShortTermInterestDebt(argsObj) + CF_NetUnspecifiedShortTermInterestDebt(argsObj);
  }


  const CF_NetShortTermNonInterestDebtAssocCo = ({getNetValue}) => getNetValue('ShortTermNonInterestDebtAssocCo');

  const CF_NetShortTermNonInterestDebtGroupCo = ({getNetValue}) => getNetValue('ShortTermNonInterestDebtGroupCo');

  const CF_NetOtherShortTermNonInterestDebt = ({getNetValue}) => getNetValue('OtherLongTermNonInterestLiabilities');

  const CF_NetUnspecifiedShortTermNonInterestDebt = ({getNetValue}) => UnspecifiedShortTermNonInterestDebt({getDefinitionValue: getNetValue})

  const CF_ChangeInShortTermNonInterestDebt = (argsObj) => {
    return CF_NetShortTermNonInterestDebtAssocCo(argsObj) + CF_NetShortTermNonInterestDebtGroupCo(argsObj) + CF_NetOtherShortTermNonInterestDebt(argsObj) + CF_NetUnspecifiedShortTermNonInterestDebt(argsObj)
  }

  const CF_NetTotalDebt = (argsObj) => {
    return CF_NetLongTermInterestBearingDebt(argsObj) + CF_NetLongTermNonInterestBearingDebt(argsObj) + CF_ChangeInShortTermInterestDebt(argsObj) + CF_ChangeInShortTermNonInterestDebt(argsObj)
  }

  const CF_FreeCashFlowAfterFinancingActivities = (argsObj) => {

    return CF_FreeCashFlowAfterInvestmentActivities(argsObj)
          - CF_PaidDividend(argsObj)
          - CF_ShareBuyBacks(argsObj)
          - CF_ShareIssues(argsObj)
          - CF_OtherInvestmentAdjustment(argsObj)
          - CF_NetTotalDebt(argsObj)
  }

  const CF_LiquidityClosing = ({getBalDefinitionValue}) => getBalDefinitionValue('Cash')

  const CF_LiquidityOpening = ({getOpeningBalValue}) => CF_LiquidityClosing({getBalDefinitionValue: getOpeningBalValue})

  const CF_NetLiquidity = (argsObj) => -CF_LiquidityOpening(argsObj) + CF_LiquidityClosing(argsObj)

  const CF_TotalCashNetDebt = (argsObj) => {
    return CF_FreeCashFlowToEquity(argsObj) + CF_InvestmentActivities(argsObj) - CF_PaidDividend(argsObj) + CF_ShareBuyBacks(argsObj) + CF_ShareIssues(argsObj) + CF_OtherInvestmentAdjustment(argsObj)
  }

  const CF_NetUnspecifiedLongTermNonInterestBearingDebt = ({getNetValue}) => UnspecifiedLongTermNonInterestBearingDebt({getDefinitionValue: getNetValue})

  const calculationsMap = {
    UnspecifiedCoreRevenue: ({getDefinitionValue}) => {
      const CoreRevenue = getDefinitionValue('CoreRevenue');
      const SalesVat = getDefinitionValue('SalesVat');
      const SalesNoVat = getDefinitionValue('SalesNoVat');
      const SalesEu = getDefinitionValue('SalesEu');
      const SalesEuNoVat = getDefinitionValue('SalesEuNoVat');
      const SalesThirdCountry = getDefinitionValue('SalesThirdCountry');
      const WorkInProgress = getDefinitionValue('WorkInProgress');

      return CoreRevenue - (SalesVat + SalesNoVat + SalesEu + SalesEuNoVat + SalesThirdCountry + WorkInProgress);
    },
    UnspecifiedNonCoreRevenue: ({getDefinitionValue}) => {
      const NonCoreRevenue = getDefinitionValue('NonCoreRevenue');
      const SubsidiesGrantsSponsorships = getDefinitionValue('SubsidiesGrantsSponsorships');
      const OtherRemunerationAndRevenue = getDefinitionValue('OtherRemunerationAndRevenue');
      const RentalIncome = getDefinitionValue('RentalIncome');

      return NonCoreRevenue - (SubsidiesGrantsSponsorships + OtherRemunerationAndRevenue + RentalIncome);
    },

    UnspecifiedRevenue: ({getDefinitionValue}) => {
      const Revenue = getDefinitionValue('Revenue');
      const CoreRevenue = getDefinitionValue('CoreRevenue');
      const RevenueReductions = getDefinitionValue('RevenueReductions');
      const NonCoreRevenue = getDefinitionValue('NonCoreRevenue');

      return Revenue - (CoreRevenue + RevenueReductions + NonCoreRevenue);
    },

    UnspecifiedCostGoodsMaterialsAndSubContract: ({getDefinitionValue}) => {
      const CostGoodsMaterialsAndSubContract = getDefinitionValue('CostGoodsMaterialsAndSubContract');
      const ChangeInInventoriesProductsAndWip = getDefinitionValue('ChangeInInventoriesProductsAndWip');
      const PriceReductions = getDefinitionValue('PriceReductions');
      const CostOfGoodsSold = getDefinitionValue('CostOfGoodsSold');
      const SubContractors = getDefinitionValue('SubContractors');

     return CostGoodsMaterialsAndSubContract - (ChangeInInventoriesProductsAndWip + PriceReductions + CostOfGoodsSold + SubContractors)
    },

    UnspecifiedVariableCosts: ({getDefinitionValue}) => {
      const VariableCosts = getDefinitionValue('VariableCosts');
      const CostGoodsMaterialsAndSubContract = getDefinitionValue('CostGoodsMaterialsAndSubContract');

      return VariableCosts - CostGoodsMaterialsAndSubContract;
    },

    UnspecifiedSalesCosts: ({getDefinitionValue}) => {
      const SalesCosts = getDefinitionValue('SalesCosts');
      const Advertisement = getDefinitionValue('Advertisement');
      const Representation = getDefinitionValue('Representation');
      const TravelCosts = getDefinitionValue('TravelCosts');
      const ReimbursedPersonalCarUsage = getDefinitionValue('ReimbursedPersonalCarUsage');

      return SalesCosts - (Advertisement + Representation + TravelCosts + ReimbursedPersonalCarUsage)
    },

    UnspecifiedRentalCosts: ({getDefinitionValue}) => {
      const RentalCosts = getDefinitionValue('RentalCosts');
      const Rent = getDefinitionValue('Rent');
      const CommonCosts = getDefinitionValue('CommonCosts');
      const Maintenance = getDefinitionValue('Maintenance');
      const Utilities = getDefinitionValue('Utilities');
      const Security = getDefinitionValue('Security');
      const CleaningAndRenovation = getDefinitionValue('CleaningAndRenovation');
      const PropertyTaxCommonCosts = getDefinitionValue('PropertyTaxCommonCosts');
      const PropertyTaxMaintenance = getDefinitionValue('PropertyTaxMaintenance');
      const PropertyTax = getDefinitionValue('PropertyTax');
      const PropertyTaxUtilities = getDefinitionValue('PropertyTaxUtilities');
      const RentalFurnitureLeasing = getDefinitionValue('RentalFurnitureLeasing');
      const RoomMinorPurchases = getDefinitionValue('RoomMinorPurchases');

      return RentalCosts - (Rent + CommonCosts + Maintenance + Utilities + Security + CleaningAndRenovation + PropertyTaxCommonCosts + PropertyTaxMaintenance + PropertyTax + PropertyTaxUtilities + RentalFurnitureLeasing + RoomMinorPurchases)
    },

    UnspecifiedOtherExternal: ({getDefinitionValue}) => {
      const OtherExternal = getDefinitionValue('OtherExternal');
      const TelephoneAndInternet = getDefinitionValue('TelephoneAndInternet');
      const ItSoftwareDomainCosts = getDefinitionValue('ItSoftwareDomainCosts');
      const OfficeSupplies = getDefinitionValue('OfficeSupplies');
      const MinorPurchases = getDefinitionValue('MinorPurchases');
      const FurnitureMaintenance = getDefinitionValue('FurnitureMaintenance');
      const Accountant = getDefinitionValue('Accountant');
      const AccountingAssistance = getDefinitionValue('AccountingAssistance');
      const Lawyer = getDefinitionValue('Lawyer');
      const OtherAdvisers = getDefinitionValue('OtherAdvisers');
      const Literature = getDefinitionValue('Literature');
      const PostageAndFees = getDefinitionValue('PostageAndFees');
      const TemporaryEmployees = getDefinitionValue('TemporaryEmployees');
      const NonDeductibleCosts = getDefinitionValue('NonDeductibleCosts');
      const Insurance = getDefinitionValue('Insurance');
      const Subscriptions = getDefinitionValue('Subscriptions');
      const ExternalFurnitureLeasing = getDefinitionValue('ExternalFurnitureLeasing');
      const DebtorLoss = getDefinitionValue('DebtorLoss');
      const ProvisionDebtorLoss = getDefinitionValue('ProvisionDebtorLoss');

      return OtherExternal - (TelephoneAndInternet + ItSoftwareDomainCosts + OfficeSupplies + MinorPurchases + FurnitureMaintenance + Accountant + AccountingAssistance + Lawyer + OtherAdvisers + Literature + PostageAndFees + TemporaryEmployees + NonDeductibleCosts + Insurance + Subscriptions + ExternalFurnitureLeasing + DebtorLoss + ProvisionDebtorLoss)
    },

    UnspecifiedPersonalVehicle: ({getDefinitionValue}) => {
      const PersonalVehicle = getDefinitionValue('PersonalVehicle');
      const PersonalVehicleFuel = getDefinitionValue('PersonalVehicleFuel');
      const PersonalVehicleRepairAndMaintenance = getDefinitionValue('PersonalVehicleRepairAndMaintenance');
      const PersonalVehicleInsuranceAndCirculationTax = getDefinitionValue('PersonalVehicleInsuranceAndCirculationTax');
      const PersonalVehicleRentalAndLeasing = getDefinitionValue('PersonalVehicleRentalAndLeasing');

      return PersonalVehicle - (PersonalVehicleFuel + PersonalVehicleRepairAndMaintenance + PersonalVehicleInsuranceAndCirculationTax + PersonalVehicleRentalAndLeasing)
    },

    UnspecifiedCompanyVehicle: ({getDefinitionValue}) => {
      const CompanyVehicle = getDefinitionValue('CompanyVehicle');
      const CompanyVehicleFuel = getDefinitionValue('CompanyVehicleFuel');
      const CompanyVehicleRepairAndMaintenance = getDefinitionValue('CompanyVehicleRepairAndMaintenance');
      const CompanyVehicleInsuranceAndCirculationTax = getDefinitionValue('CompanyVehicleInsuranceAndCirculationTax');
      const CompanyVehicleRentalAndLeasing = getDefinitionValue('CompanyVehicleRentalAndLeasing');

      return CompanyVehicle - (CompanyVehicleFuel + CompanyVehicleRepairAndMaintenance + CompanyVehicleInsuranceAndCirculationTax + CompanyVehicleRentalAndLeasing)
    },

    UnspecifiedFixedWages: ({getDefinitionValue}) => {
      const FixedWages = getDefinitionValue('FixedWages');
      const WagesAndBenefits = getDefinitionValue('WagesAndBenefits');
      const LaborCostTax = getDefinitionValue('LaborCostTax');
      const OtherPersonnelCost = getDefinitionValue('OtherPersonnelCost');
      const Pension = getDefinitionValue('Pension');
      const CashRemunerationAndBenefits = getDefinitionValue('CashRemunerationAndBenefits');
      const SocialCosts = getDefinitionValue('SocialCosts');

       return FixedWages - (WagesAndBenefits + LaborCostTax + OtherPersonnelCost + Pension + CashRemunerationAndBenefits + SocialCosts)
    },

    UnspecifiedFixedCosts: ({getDefinitionValue}) => {
      const FixedCosts = getDefinitionValue('FixedCosts');
      const SalesCosts = getDefinitionValue('SalesCosts');
      const RentalCosts = getDefinitionValue('RentalCosts');
      const OtherExternal = getDefinitionValue('OtherExternal');
      const PersonalVehicle = getDefinitionValue('PersonalVehicle');
      const CompanyVehicle = getDefinitionValue('CompanyVehicle');
      const FixedWages = getDefinitionValue('FixedWages');
      const OtherOperatingExpenses = getDefinitionValue('OtherOperatingExpenses');

      return FixedCosts - (SalesCosts + RentalCosts + OtherExternal + PersonalVehicle + CompanyVehicle + FixedWages + OtherOperatingExpenses)
    },

    UnspecifiedResearchDevelopment: ({getDefinitionValue}) => {
      const ResearchDevelopment = getDefinitionValue('ResearchDevelopment');
      const ResearchExpenses = getDefinitionValue('ResearchExpenses');
      const DevelopmentExpenses = getDefinitionValue('DevelopmentExpenses');

      return ResearchDevelopment - (ResearchExpenses + DevelopmentExpenses)
    },

    UnspecifiedNonOperationalIncome: ({getDefinitionValue}) => {
      const NonOperationalIncome = getDefinitionValue('NonOperationalIncome');
      const NonOperationalIncomeFromLeasingRenting = getDefinitionValue('NonOperationalIncomeFromLeasingRenting');

      return NonOperationalIncome - (NonOperationalIncomeFromLeasingRenting)
    },

    UnspecifiedNonOperationalExpense: ({getDefinitionValue}) => {
      const NonOperationalExpense = getDefinitionValue('NonOperationalExpense');
      const NonOperationalExpenseFromLeasingRenting = getDefinitionValue('NonOperationalExpenseFromLeasingRenting');

      return NonOperationalExpense - (NonOperationalExpenseFromLeasingRenting)
    },

    UnspecifiedNonOperationalIncomeExpense: ({getDefinitionValue}) => {
      const NonOperationalIncomeExpense = getDefinitionValue('NonOperationalIncomeExpense');
      const NonOperationalIncome = getDefinitionValue('NonOperationalIncome');
      const NonOperationalExpense = getDefinitionValue('NonOperationalExpense');

      return NonOperationalIncomeExpense - (NonOperationalIncome + NonOperationalExpense);
    },

    UnspecifiedMaterialDepreciation: ({getDefinitionValue}) => {
      const MaterialDepreciation = getDefinitionValue('MaterialDepreciation');
      const DecorRentalDepreciation = getDefinitionValue('DecorRentalDepreciation');
      const BuildingDepreciation = getDefinitionValue('BuildingDepreciation');
      const ProductionPlantAndMachineDepreciation = getDefinitionValue('ProductionPlantAndMachineDepreciation');
      const OperatingEquipmentAndFurnishingDepreciation = getDefinitionValue('OperatingEquipmentAndFurnishingDepreciation');

      return MaterialDepreciation - (DecorRentalDepreciation + BuildingDepreciation + ProductionPlantAndMachineDepreciation + OperatingEquipmentAndFurnishingDepreciation)
    },

    UnspecifiedWriteDownsTangibleAssets: ({getDefinitionValue}) => {
      const WriteDownsTangibleAssets = getDefinitionValue('WriteDownsTangibleAssets');
      const WriteDownsLandAndBuildings = getDefinitionValue('WriteDownsLandAndBuildings');
      const WriteDownsMachineryAndEquipment = getDefinitionValue('WriteDownsMachineryAndEquipment');
      const ReversedWriteDownsLandAndBuildings = getDefinitionValue('ReversedWriteDownsLandAndBuildings');
      const ReversedWriteDownsMachineryAndEquipment = getDefinitionValue('ReversedWriteDownsMachineryAndEquipment');

      return WriteDownsTangibleAssets - (WriteDownsLandAndBuildings + WriteDownsMachineryAndEquipment + ReversedWriteDownsLandAndBuildings + ReversedWriteDownsMachineryAndEquipment)
    },

    UnspecifiedWriteDownsCurrentAssets: ({getDefinitionValue}) => {
      const WriteDownsCurrentAssets = getDefinitionValue('WriteDownsCurrentAssets');
      const WriteDownsCertainCurrentAssets = getDefinitionValue('WriteDownsCertainCurrentAssets');
      const ReversedWriteDownsCertainCurrentAssets = getDefinitionValue('ReversedWriteDownsCertainCurrentAssets');

      return WriteDownsCurrentAssets - (WriteDownsCertainCurrentAssets + ReversedWriteDownsCertainCurrentAssets)
    },

    UnspecifiedDepreciation: ({getDefinitionValue}) => {
      const Depreciation = getDefinitionValue('Depreciation');
      const MaterialDepreciation = getDefinitionValue('MaterialDepreciation');
      const WriteDownsTangibleAssets = getDefinitionValue('WriteDownsTangibleAssets');
      const WriteDownsCurrentAssets = getDefinitionValue('WriteDownsCurrentAssets');

      return Depreciation - (MaterialDepreciation + WriteDownsTangibleAssets + WriteDownsCurrentAssets)
    },

    UnspecifiedWriteDownsIntangibleAssets: ({getDefinitionValue}) => {
      const WriteDownsIntangibleAssets = getDefinitionValue('WriteDownsIntangibleAssets');
      const WriteDownsIntangibleFixedAssets = getDefinitionValue('WriteDownsIntangibleFixedAssets');
      const ReversedWriteDownsIntangibleFixedAssets = getDefinitionValue('ReversedWriteDownsIntangibleFixedAssets');

      return WriteDownsIntangibleAssets - (WriteDownsIntangibleFixedAssets + ReversedWriteDownsIntangibleFixedAssets)
    },

    UnspecifiedImmaterialDepreciation: ({getDefinitionValue}) => {
      const ImmaterialDepreciation = getDefinitionValue('ImmaterialDepreciation');
      const GoodwillDepreciation = getDefinitionValue('GoodwillDepreciation');
      const DevelopmentDepreciation = getDefinitionValue('DevelopmentDepreciation');
      const RightsAndPatentsDepreciation = getDefinitionValue('RightsAndPatentsDepreciation');

      return ImmaterialDepreciation - (GoodwillDepreciation + DevelopmentDepreciation + RightsAndPatentsDepreciation)
    },

    UnspecifiedAmortization: ({getDefinitionValue}) => {
      const Amortization = getDefinitionValue('Amortization');
      const WriteDownsIntangibleAssets = getDefinitionValue('WriteDownsIntangibleAssets');
      const ImmaterialDepreciation = getDefinitionValue('ImmaterialDepreciation');

      return Amortization - (WriteDownsIntangibleAssets + ImmaterialDepreciation);
    },

    UnspecifiedFinancialIncome: ({getDefinitionValue}) => {
      const FinancialIncome = getDefinitionValue('FinancialIncome');
      const BankInterestIncome = getDefinitionValue('BankInterestIncome');
      const ReceivableInterest = getDefinitionValue('ReceivableInterest');
      const ReceivableInterestRelatedParties = getDefinitionValue('ReceivableInterestRelatedParties');
      const ExchangeRateGains = getDefinitionValue('ExchangeRateGains');
      const Dividend = getDefinitionValue('Dividend');
      const BondInterest = getDefinitionValue('BondInterest');
      const CapitalGains = getDefinitionValue('CapitalGains');
      const CapitalLoss = getDefinitionValue('CapitalLoss');

      return FinancialIncome - (BankInterestIncome + ReceivableInterest + ReceivableInterestRelatedParties + ExchangeRateGains + Dividend + BondInterest + CapitalGains + CapitalLoss)
    },

    UnspecifiedFinancialExpenses: ({getDefinitionValue}) => {
      const FinancialExpenses = getDefinitionValue('FinancialExpenses');
      const BankInterestExpense = getDefinitionValue('BankInterestExpense');
      const PayableInterest = getDefinitionValue('PayableInterest');
      const PayableInterestRelatedParties = getDefinitionValue('PayableInterestRelatedParties');
      const ExchangeRateLoss = getDefinitionValue('ExchangeRateLoss');
      const InterestSubsidy = getDefinitionValue('InterestSubsidy');
      const FinancingFees = getDefinitionValue('FinancingFees');
      const LeasingInterest = getDefinitionValue('LeasingInterest');
      const PriorityDebtInterest = getDefinitionValue('PriorityDebtInterest');
      const InterestExpense = getDefinitionValue('InterestExpense');
      const UnrealisedValueChangesInLiabilities = getDefinitionValue('UnrealisedValueChangesInLiabilities');

      return FinancialExpenses - (BankInterestExpense + PayableInterest + PayableInterestRelatedParties + ExchangeRateLoss + InterestSubsidy + FinancingFees + LeasingInterest + PriorityDebtInterest + InterestExpense + UnrealisedValueChangesInLiabilities)
    },

    UnspecifiedFinancialIncomeExpense: ({getDefinitionValue}) => {
      const FinancialIncomeExpense = getDefinitionValue('FinancialIncomeExpense');
      const FinancialIncome = getDefinitionValue('FinancialIncome');
      const FinancialExpenses = getDefinitionValue('FinancialExpenses');

      return FinancialIncomeExpense - (FinancialIncome + FinancialExpenses)
    },

    UnspecifiedExIncomeExpense: ({getDefinitionValue}) => {
      const ExIncomeExpense = getDefinitionValue('ExIncomeExpense');
      const ExtraordinaryIncome = getDefinitionValue('ExtraordinaryIncome');
      const ExtraordinaryExpenses = getDefinitionValue('ExtraordinaryExpenses');

      return ExIncomeExpense - (ExtraordinaryIncome + ExtraordinaryExpenses)
    },

    UnspecifiedCorporateTax: ({getDefinitionValue}) => {
      const CorporateTax = getDefinitionValue('CorporateTax');
      const PayableTax = getDefinitionValue('PayableTax');
      const DeferredTax = getDefinitionValue('DeferredTax');
      const TaxCreditScheme = getDefinitionValue('TaxCreditScheme');

      return CorporateTax - (PayableTax + DeferredTax + TaxCreditScheme)
    },

    //---------------------------------------Profit and Loss Summations-----------------------------------

    GrossProfit,

    OperatingExpensesOPEX,

    OperatingIncomeBeforeInterestsTaxDepreciationAndAmortization,

    EarningsBeforeInterestsTaxDepreciationAndAmortizationEBITDA,

    OperatingIncomeBeforeInterestsTaxAndAmortization,

    EarningsBeforeInterestsTaxAndAmortizationEBITA,

    OperatingIncome: ({getDefinitionValue}) => {
      //sum:OperatingIncomeBeforeInterestsTaxAndAmortization + Amortization
      const Amortization = getDefinitionValue('Amortization');

      return OperatingIncomeBeforeInterestsTaxAndAmortization({getDefinitionValue}) + Amortization;
    },

    EarningsBeforeInterestsAndTaxEBIT,

    EarningsBeforeTaxEBT,

    ProfitLoss,

    ReserveMovements,

    //----------------------Balance sheet Unspecified calculations----------------------------
    UnspecifiedImmaterialAssets: ({getDefinitionValue}) => {
      const ImmaterialAssets = getDefinitionValue('ImmaterialAssets');
      const GoodwillAssets = getDefinitionValue('GoodwillAssets');
      const DevelopmentAssets = getDefinitionValue('DevelopmentAssets');
      const RightsAndPatentsAssets = getDefinitionValue('RightsAndPatentsAssets');
      const OtherIntangibleAssets = getDefinitionValue('OtherIntangibleAssets');

      return ImmaterialAssets - (GoodwillAssets + DevelopmentAssets + RightsAndPatentsAssets + OtherIntangibleAssets)
    },

    UnspecifiedMaterialAssets: ({getDefinitionValue}) => {
      const MaterialAssets = getDefinitionValue('MaterialAssets');
      const DecorRentalAssets = getDefinitionValue('DecorRentalAssets');
      const BuildingAssets = getDefinitionValue('BuildingAssets');
      const ProductionPlantAndMachineAssets = getDefinitionValue('ProductionPlantAndMachineAssets');
      const OperatingEquipmentAndFurnishingAssets = getDefinitionValue('OperatingEquipmentAndFurnishingAssets');
      const OtherTangibleFixedAssets = getDefinitionValue('OtherTangibleFixedAssets');
      const LongTermBiologicalAssets = getDefinitionValue('LongTermBiologicalAssets');
      const FinancialAssets = getDefinitionValue('FinancialAssets');
      const PartOfLinkedCompanies = getDefinitionValue('PartOfLinkedCompanies');
      const InvestmentsInJoinVentures = getDefinitionValue('InvestmentsInJoinVentures');
      const PartOfAssociatedCompanies = getDefinitionValue('PartOfAssociatedCompanies');
      const Deposits = getDefinitionValue('Deposits');
      const DerivativesAndOtherFinancialInstruments = getDefinitionValue('DerivativesAndOtherFinancialInstruments');
      const DefinedBenefitPlansSurplus = getDefinitionValue('DefinedBenefitPlansSurplus');

      return MaterialAssets - (DecorRentalAssets + BuildingAssets + ProductionPlantAndMachineAssets + OperatingEquipmentAndFurnishingAssets + OtherTangibleFixedAssets + LongTermBiologicalAssets + FinancialAssets + PartOfLinkedCompanies + InvestmentsInJoinVentures + PartOfAssociatedCompanies + Deposits + DerivativesAndOtherFinancialInstruments + DefinedBenefitPlansSurplus)
    },

    UnspecifiedLongTermAssets,

    SumCurrentAssets,

    UnspecifiedInventory: ({getDefinitionValue}) => {
      const Inventory = getDefinitionValue('Inventory');
      const Stock = getDefinitionValue('Stock');
      const RawMaterials = getDefinitionValue('RawMaterials');
      const ShortTermBiologicalAssets = getDefinitionValue('ShortTermBiologicalAssets');
      const CurrentProjects = getDefinitionValue('CurrentProjects');
      const CurrentProjectsExternal = getDefinitionValue('CurrentProjectsExternal');

      return Inventory - (Stock + RawMaterials + ShortTermBiologicalAssets + CurrentProjects + CurrentProjectsExternal);
    },

    UnspecifiedReceivables: ({getDefinitionValue}) => {
      const Receivables = getDefinitionValue('Receivables');
      const TradeReceivables = getDefinitionValue('TradeReceivables');
      const ProvisionsBadDept = getDefinitionValue('ProvisionsBadDept');
      const PrepaidCosts = getDefinitionValue('PrepaidCosts');
      const DeferredTaxAssets = getDefinitionValue('DeferredTaxAssets');
      const RelatedPartyReceivables = getDefinitionValue('RelatedPartyReceivables');
      const OtherReceivables = getDefinitionValue('OtherReceivables');

      return Receivables - (TradeReceivables + ProvisionsBadDept + PrepaidCosts + DeferredTaxAssets + RelatedPartyReceivables + OtherReceivables)
    },

    UnspecifiedOtherShortTermAssets: ({getDefinitionValue}) => {
      const OtherShortTermAssets = getDefinitionValue('OtherShortTermAssets');
      const DerivativeAndOtherFinancialInstruments = getDefinitionValue('DerivativeAndOtherFinancialInstruments');
      const ReceivablesLinkedCompanies = getDefinitionValue('ReceivablesLinkedCompanies');
      const LoansToJointVentures = getDefinitionValue('LoansToJointVentures');
      const ReceivablesAssociatedCompanies = getDefinitionValue('ReceivablesAssociatedCompanies');
      const ReceivablesManagement = getDefinitionValue('ReceivablesManagement');

      return OtherShortTermAssets - (DerivativeAndOtherFinancialInstruments + ReceivablesLinkedCompanies + LoansToJointVentures + ReceivablesAssociatedCompanies + ReceivablesManagement)
    },

    UnspecifiedVatAndDutiesReceivable: ({getDefinitionValue}) => {
      return VatAndDutiesReceivable({getDefinitionValue}) - (VatReceivable({getDefinitionValue}))
    },

    UnspecifiedSumCurrentAssets: ({getDefinitionValue}) => {
      const Inventory = getDefinitionValue('Inventory');
      const Receivables = getDefinitionValue('Receivables');
      const OtherShortTermAssets = getDefinitionValue('OtherShortTermAssets');
      const Securities = getDefinitionValue('Securities');
      const Cash = getDefinitionValue('Cash');

      return SumCurrentAssets({getDefinitionValue}) - (Inventory + Receivables + OtherShortTermAssets + VatAndDutiesReceivable({getDefinitionValue}) + Securities + Cash)
    },

    UnspecifiedSumPersonalCompany: ({getDefinitionValue}) => {
      const CompanyDepositsPrimo = getDefinitionValue('CompanyDepositsPrimo');
      const CashWithdrawals = getDefinitionValue('CashWithdrawals');
      const PayedTaxes = getDefinitionValue('PayedTaxes');
      const PersonalShares = getDefinitionValue('PersonalShares');

      return SumPersonalCompany({getDefinitionValue}) - (CompanyDepositsPrimo + CashWithdrawals + PayedTaxes + PersonalShares)
    },

    UnspecifiedSumCorporation: ({getDefinitionValue}) => {
      const ShareCapital = getDefinitionValue('ShareCapital');
      const ProfitsFund = getDefinitionValue('ProfitsFund');
      const EquityAppreciation = getDefinitionValue('EquityAppreciation');
      const EquityDepreciation = getDefinitionValue('EquityDepreciation');
      const ReserveIVS = getDefinitionValue('ReserveIVS');
      const DevelopmentCostReserve = getDefinitionValue('DevelopmentCostReserve');
      const Dividends = getDefinitionValue('Dividends');

      return SumCorporation({getDefinitionValue}) - (ShareCapital + ProfitsFund + EquityAppreciation + EquityDepreciation + ReserveIVS + DevelopmentCostReserve + Dividends)
    },

    UnspecifiedCapital: ({getDefinitionValue}) => {
      const PersonalCompany = getDefinitionValue('PersonalCompany');

      return Capital({getDefinitionValue}) - (PersonalCompany + SumCorporation({getDefinitionValue}));
    },

    UnspecifiedLongTermInterestBearingDebt,

    UnspecifiedLongTermNonInterestBearingDebt,

    UnspecifiedLongTermOperationalLiabilities: ({getDefinitionValue}) => {
      const LongTermOperationalLiabilities = getDefinitionValue('LongTermOperationalLiabilities');
      const LongTermPayables = getDefinitionValue('LongTermPayables');
      const LongTermLiabilityCorporateTax = getDefinitionValue('LongTermLiabilityCorporateTax');

      return LongTermOperationalLiabilities - (LongTermPayables + LongTermLiabilityCorporateTax)
    },

    UnspecifiedLongTermNonOperationalLiabilities: ({getDefinitionValue}) => {
      const LongTermNonOperationalLiabilities = getDefinitionValue('LongTermNonOperationalLiabilities');
      const Provisions = getDefinitionValue('Provisions');
      const LiabilityDeferredTax = getDefinitionValue('LiabilityDeferredTax');
      const LongTermDerivativesAndFinancialInstruments = getDefinitionValue('LongTermDerivativesAndFinancialInstruments');
      const DefinedBenefitPlansDeficit = getDefinitionValue('DefinedBenefitPlansDeficit');

      return LongTermNonOperationalLiabilities - (Provisions + LiabilityDeferredTax + LongTermDerivativesAndFinancialInstruments + DefinedBenefitPlansDeficit)
    },

    UnspecifiedLongTermLiabilities: ({getDefinitionValue}) => {
      const LongTermLiabilities = getDefinitionValue('LongTermLiabilities');
      const LongTermInterestBearingDebt = getDefinitionValue('LongTermInterestBearingDebt');
      const LongTermNonInterestBearingDebt = getDefinitionValue('LongTermNonInterestBearingDebt');
      const LongTermOperationalLiabilities = getDefinitionValue('LongTermOperationalLiabilities');
      const LongTermNonOperationalLiabilities = getDefinitionValue('LongTermNonOperationalLiabilities');

      return LongTermLiabilities - (LongTermInterestBearingDebt + LongTermNonInterestBearingDebt + LongTermOperationalLiabilities + LongTermNonOperationalLiabilities)
    },

    UnspecifiedShortTermInterestDebt,

    UnspecifiedShortTermNonInterestDebt,

    UnspecifiedShortTermOperationalLiabilities: ({getDefinitionValue}) => {
      const ShortTermOperationalLiabilities = getDefinitionValue('ShortTermOperationalLiabilities');
      const Payables = getDefinitionValue('Payables');
      const AdvancePayments = getDefinitionValue('AdvancePayments');
      const AdvanceBilling = getDefinitionValue('AdvanceBilling');
      const CurrentLiabilityCorporateTax = getDefinitionValue('CurrentLiabilityCorporateTax');
      const OwedTaxAndContribution = getDefinitionValue('OwedTaxAndContribution');
      const OwedVacationPay = getDefinitionValue('OwedVacationPay');
      const DeferredVacationLiabilities = getDefinitionValue('DeferredVacationLiabilities');
      const OwedAccountant = getDefinitionValue('OwedAccountant');
      const OwedEmployeeExpenditures = getDefinitionValue('OwedEmployeeExpenditures');
      const OtherCurrentDebt = getDefinitionValue('OtherCurrentDebt');

      return ShortTermOperationalLiabilities - (Payables + AdvancePayments + AdvanceBilling + CurrentLiabilityCorporateTax + OwedTaxAndContribution + OwedVacationPay + DeferredVacationLiabilities + OwedAccountant + OwedEmployeeExpenditures + OtherCurrentDebt);
    },

    UnspecifiedVatAndDutiesPayable: ({getDefinitionValue}) => {

      return VatAndDutiesPayable({getDefinitionValue}) - (VatPayable({getDefinitionValue}));
    },

    UnspecifiedShortTermNonOperationalLiabilities: ({getDefinitionValue}) => {
      const ShortTermNonOperationalLiabilities = getDefinitionValue('ShortTermNonOperationalLiabilities');
      const ShortTermDerivativesAndFinancialInstruments = getDefinitionValue('ShortTermDerivativesAndFinancialInstruments');

      return ShortTermNonOperationalLiabilities - (ShortTermDerivativesAndFinancialInstruments)
    },

    UnspecifiedSumCurrentLiabilities: ({getDefinitionValue}) => {
      const ShortTermInterestDebt = getDefinitionValue('ShortTermInterestDebt');
      const ShortTermNonInterestDebt = getDefinitionValue('ShortTermNonInterestDebt');
      const ShortTermOperationalLiabilities = getDefinitionValue('ShortTermOperationalLiabilities');
      const ShortTermNonOperationalLiabilities = getDefinitionValue('ShortTermNonOperationalLiabilities');

      return SumCurrentLiabilities({getDefinitionValue}) - (ShortTermInterestDebt + ShortTermNonInterestDebt + ShortTermOperationalLiabilities + VatAndDutiesPayable({getDefinitionValue}) + ShortTermNonOperationalLiabilities)
    },
    //--------------------------------------Balance Sheet Summations---------------------------------
    TotalAssets,
    SumEquity,
    TotalLiabilities,
    TotalEquityAndLiabilities,
    ZeroControl: ({getDefinitionValue, getPalDefinitionValue}) => {
      //sum:TotalAssets + -sum:TotalEquityAndLiabilities
      return TotalAssets({getDefinitionValue}) + ((-TotalEquityAndLiabilities({getDefinitionValue, getPalDefinitionValue})) * -1);
    },
    //-------------------------------------Balance Sheet Category Sums----------------------------------
    Capital,
    SumPersonalCompany,
    SumCorporation,
    SumRetainedEarnings,
    SumCurrentLiabilities,
    //--------------------------------Balance Sheet special Categories----------------------------
    VatAndDutiesReceivable,
    VatReceivable,
    VatAndDutiesPayable,
    VatPayable,
    //--------------------------------Cashflow Analysis Sums---------------------------------------
    CF_EarningsBeforeInterestsTaxAmortizations,
    CF_NetOperatingProfitLessAdjustedTax,
    CF_ChangeInNonOperatingLiabilities,
    CF_NetWorkingCapital,
    CF_FreeCashFlowFromOperations,
    CF_CapitalExpenditures,
    CF_FreeCashFlowToFirm,
    CF_FreeCashFlowToEquity,
    CF_InvestmentActivities,
    CF_FreeCashFlowAfterInvestmentActivities,
    CF_FinancingActivities,
    CF_NetLongTermInterestBearingDebt,
    CF_NetLongTermNonInterestBearingDebt,
    CF_ChangeInShortTermInterestDebt,
    CF_ChangeInShortTermNonInterestDebt,
    CF_NetTotalDebt,
    CF_FreeCashFlowAfterFinancingActivities,
    CF_NetLiquidity,
    CF_TotalCashNetDebt,
    //--------------------------------Cashflow Analysis Cashflow rows------------------------------
    CF_TaxOnEbita,
    CF_NetLongTermNonOperatingLiabilities,
    CF_NetShortTermNonOperatingLiabilities,
    CF_FinancialItems,
    CF_DividendsFromAssociatedCompaniesAfterTax,
    CF_TaxOnFinancialItems,
    CF_AcquisitionsDivestmentIntangibleAssets,
    CF_AcquisitionsDivestmentTangibleAssets,
    CF_AcquisitionsDivestmentLongTermAssetsUnspecified,
    CF_PaidDividend,
    CF_ShareBuyBacks,
    CF_ShareIssues,
    CF_OtherInvestmentAdjustment,
    CF_NetLongTermDebtSubsidiaries,
    CF_NetLongTermDebtJoinVenture,
    CF_NetLongTermDebtAssCompanies,
    CF_NetSubordinatedLoan,
    CF_NetDebtToOwnersAndManagement,
    CF_NetMortgageLoans,
    CF_NetLongTermBanks,
    CF_NetLongTermLeasingDebt,
    CF_NetOtherLongTermDebt,
    CF_NetUnspecifiedLongTermIntBearingDebt,
    CF_NetLongTermNonInterestLiabilitiesGroupCo,
    CF_NetLongTermNonInterestLiabilitiesAssocCo,
    CF_NetOtherLongTermNonInterestLiabilities,
    CF_NetLinkedCompaniesDebt,
    CF_NetShortTermDebtJoinVenture,
    CF_NetAssociatedCompaniesDebt,
    CF_NetDebtToOwnerAndManagement,
    CF_NetCurrentPartOfLongTerm,
    CF_NetCurrentBanks,
    CF_NetShortTermBondDebt,
    CF_NetShortTermLeasingDebt,
    CF_NetOtherTaxPayable,
    CF_NetOtherShortTermInterestDebt,
    CF_NetUnspecifiedShortTermInterestDebt,
    CF_NetShortTermNonInterestDebtAssocCo,
    CF_NetShortTermNonInterestDebtGroupCo,
    CF_NetOtherShortTermNonInterestDebt,
    CF_NetUnspecifiedShortTermNonInterestDebt,
    CF_LiquidityClosing,
    CF_LiquidityOpening,
    CF_NetInventory,
    CF_NetReceivables,
    CF_NetOtherShortTermAssets,
    CF_NetOtherOperatingShortTermAssets,
    CF_NetShortTermInterestDebt,
    CF_NetShortTermNonInterestDebt,
    CF_NetShortTermOperatingLiabilities,
    CF_NetOtherOperatingShortTermLiabilities,
    CF_NetUnspecifiedLongTermNonInterestBearingDebt
  };


  const  calculate = ({index, referenceMap, palBalIdx, reference, palIdx, balIdx, cashbook, isBudget}) => {
    const getDefinitionValue = getValueByReference({index, palBalIdx, referenceMap});

    if(calculationsMap[reference]) {
      return  calculationsMap[reference](
        {
          getDefinitionValue,
          getPalDefinitionValue: getPalDefinitionValue({index, palIdx, referenceMap, aggregated: false}),
          getBalDefinitionValue: getBalDefinitionValue({index, balIdx, referenceMap, aggregated: false}),
          getNetValue: getNetValue({index, referenceMap, aggregated: false, cashbook, isBudget}),
          getOpeningBalValue: getOpeningBalValue({index, referenceMap, aggregated: false, cashbook, isBudget}),
          getClosingBalValue: getClosingBalValue({index, referenceMap, aggregated: false, cashbook, isBudget}),
          index,
          palBalIdx,
          referenceMap,
          palIdx,
          balIdx,
          aggregated: false,
          isBudget
        });
    } else {
      console.log('missing calculation for', reference);
      return 0;
    }


  };

  const calculateAggregated = ({referenceMap, palBalIdx, reference, palIdx, balIdx, cashbook, isBudget}) => {
    const getDefinitionValue = getAggValueByReference({palBalIdx, referenceMap, cashbook});

    if (calculationsMap[reference]) {
      return calculationsMap[reference](
        {
          getDefinitionValue,
          getPalDefinitionValue: getPalDefinitionValue({palIdx, referenceMap, aggregated: true}),
          getBalDefinitionValue: getBalDefinitionValue({balIdx, referenceMap, aggregated: true}),
          getNetValue: getNetValue({referenceMap, aggregated: true, cashbook, isBudget}),
          getOpeningBalValue: getOpeningBalValue({referenceMap, aggregated: true, cashbook, isBudget}),
          getClosingBalValue: getClosingBalValue({referenceMap, aggregated: true, cashbook, isBudget}),
          palBalIdx,
          referenceMap,
          palIdx,
          balIdx,
          aggregated: true,
          isBudget
        });
    } else {
      console.log('missing calculation for', reference);
    }
  }


  return {calculate, calculateAggregated};
});

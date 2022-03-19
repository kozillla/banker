import { expect } from 'chai';
import Banker from '../src/banker';

const sinon = require('sinon');

const readline = require('readline');
const fs = require('fs');

// stubs
sinon.stub(readline, 'createInterface').callsFake(() => {
  return {
    on: () => {},
  };
});
sinon.stub(fs, 'createReadStream');

describe('Banker functionality ', function () {
  it('test parsing LOAN command', () => {
    const data = {
      IDIDI: {
        Dale: {
          principalAmount: 5000,
          numberOfYearsOfLoanPeriod: 1,
          rateOfInterest: 0.06,
        },
      },
    };

    const banker = new Banker('');

    expect(banker.loanData).to.eql({});
    banker.parseLine('LOAN IDIDI Dale 5000 1 6');
    expect(banker.loanData).to.eql(data);
  });

  it('test parsing PAYMENT command', () => {
    const data = { UON: { Shelly: { lumpSumAmount: 7000, emiNumber: 12 } } };
    const banker = new Banker('');

    expect(banker.paymentData).to.eql({});
    banker.parseLine('PAYMENT UON Shelly 7000 12');
    expect(banker.paymentData).to.eql(data);
  });

  it('test BALANCE query command', () => {
    const banker = new Banker('');
    expect(banker.paymentData).to.eql({});

    banker.parseLine('LOAN IDIDI Dale 5000 1 6');
    banker.parseLine('PAYMENT IDIDI Dale 1000 5');

    const balanceQuery = {
      bankName: 'IDIDI',
      borrowerName: 'Dale',
      emiNumber: 3,
    };

    const balanceString = banker.getBalance(balanceQuery);
    expect(balanceString).to.equal('IDIDI Dale 1326 9');
  });
});

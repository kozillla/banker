const readline = require('readline');
const fs = require('fs');

enum Command {
  LOAN = 'LOAN',
  PAYMENT = 'PAYMENT',
  BALANCE = 'BALANCE',
}

interface LoanInput {
  bankName: string;
  borrowerName: string;
  principalAmount: number;
  numberOfYearsOfLoanPeriod: number;
  rateOfIntrest: number;
}

interface PaymentInput {
  bankName: string;
  borrowerName: string;
  lumpSum: number;
  emiNumber: number;
}

interface BalanceQuery {
  bankName: string;
  borrowerName: string;
  emiNumber: number;
}

interface LoanData {
  [bankName: string]: {
    [customerName: string]: {
      principalAmount: number;
      numberOfYearsOfLoanPeriod: number;
      rateOfInterest: number;
    };
  };
}

interface PaymentData {
  [bankName: string]: {
    [customerName: string]: {
      lumpSumAmount: number;
      emiNumber: number;
    };
  };
}

export default class Banker {
  filename: string;
  readInterface: any;
  loanData: LoanData;
  paymentData: PaymentData;

  constructor(filename: string) {
    this.filename = filename;
    this.setupReadingInterface();

    this.loanData = {};
    this.paymentData = {};
  }

  setupReadingInterface = () => {
    this.readInterface = readline.createInterface({
      input: fs.createReadStream(this.filename),
    });
    this.readInterface.on('line', (line: string) => {
      this.parseLine(line);
    });
    this.readInterface.on('error', () => {
      // TO DO
      // HANDLE ERRORS ON FILE READ
      console.error('ERROR CANT PROCESS : ', this.filename);
    });
  };

  parseLoanInput = (lineData: string[]) => {
    let loan: LoanInput = {
      bankName: lineData[1],
      borrowerName: lineData[2],
      principalAmount: Number(lineData[3]),
      numberOfYearsOfLoanPeriod: Number(lineData[4]),
      rateOfIntrest: Number(lineData[5]) * 0.01,
    };

    this.loanData = {
      ...this.loanData,
      [loan.bankName]: {
        ...this.loanData[loan.bankName],
        [loan.borrowerName]: {
          principalAmount: loan.principalAmount,
          numberOfYearsOfLoanPeriod: loan.numberOfYearsOfLoanPeriod,
          rateOfInterest: loan.rateOfIntrest,
        },
      },
    };
  };

  getBalance = (balanceQuery: BalanceQuery): string => {
    // find borower data entry
    const customerLoanData =
      this.loanData[balanceQuery.bankName]?.[balanceQuery.borrowerName];

    if (!customerLoanData) {
      console.error('ERROR IN PROCESSIN BALANCE');
      return '';
    }

    // calculate customer interest
    const intrest =
      customerLoanData.principalAmount *
      customerLoanData.numberOfYearsOfLoanPeriod *
      customerLoanData.rateOfInterest;

    // calculate customer total amount
    const totalAmount = customerLoanData.principalAmount + intrest;

    // calculate total amount of EMIS
    const totalEmi = customerLoanData.numberOfYearsOfLoanPeriod * 12;

    // claculate number of emis left
    let remainingEmis = totalEmi - balanceQuery.emiNumber;

    // calculate payment per emi
    const montlyEmi = Math.ceil(totalAmount / totalEmi);

    // calculate amount paid
    let paid = Math.ceil(balanceQuery.emiNumber * montlyEmi);

    // extra emis
    let extraEmis = 0;

    // process relevant payments per customer
    if (
      this.paymentData[balanceQuery.bankName] &&
      this.paymentData[balanceQuery.bankName][balanceQuery.borrowerName] &&
      this.paymentData[balanceQuery.bankName][balanceQuery.borrowerName]
        .emiNumber <= balanceQuery.emiNumber
    ) {
      paid = Math.ceil(
        paid +
          this.paymentData[balanceQuery.bankName][balanceQuery.borrowerName]
            .lumpSumAmount
      );

      // calculate extra emis repayments
      extraEmis = Math.floor(
        this.paymentData[balanceQuery.bankName][balanceQuery.borrowerName]
          .lumpSumAmount / montlyEmi
      );
    }

    return `${balanceQuery.bankName} ${balanceQuery.borrowerName} ${Math.ceil(
      paid
    )} ${Math.floor(remainingEmis - extraEmis)}`;
  };

  printOutput = (output: string) => {
    console.log(output);
  };

  parseBalanceInput = (lineData: string[]): BalanceQuery => {
    const balanceQuery: BalanceQuery = {
      bankName: lineData[1],
      borrowerName: lineData[2],
      emiNumber: Number(lineData[3]),
    };

    return balanceQuery;
  };

  parsePayment = (lineData: string[]) => {
    const paymentInput: PaymentInput = {
      bankName: lineData[1],
      borrowerName: lineData[2],
      lumpSum: Number(lineData[3]),
      emiNumber: Number(lineData[4]),
    };

    this.paymentData = {
      ...this.paymentData,
      [paymentInput.bankName]: {
        ...this.paymentData[paymentInput.bankName],
        [paymentInput.borrowerName]: {
          lumpSumAmount: paymentInput.lumpSum,
          emiNumber: paymentInput.emiNumber,
        },
      },
    };
  };

  parseLine = (line: string) => {
    const lineData = line.split(' ');
    switch (lineData[0]) {
      case Command.LOAN:
        this.parseLoanInput(lineData);
        break;
      case Command.PAYMENT:
        this.parsePayment(lineData);
        break;
      case Command.BALANCE:
        const parsedData = this.parseBalanceInput(lineData);
        const balance = this.getBalance(parsedData);
        this.printOutput(balance);
        break;
      default:
        // TO DO
        // HANDLE UNDEFINED COMMENT
        break;
    }
  };
}

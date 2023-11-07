import { inject, injectable } from "tsyringe";

import { Statement } from "modules/statements/entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";

import { AppError } from "../../../../shared/errors/AppError";
import { GetStatementOperationError } from "../getStatementOperation/GetStatementOperationError";
import { CreateStatementError } from "../createStatement/CreateStatementError";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

interface IRequest {
  user_sends: string;
  user_receives: string;
  amount: number;
  description: string;
}

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("StatementsRepository")
    private statementRepository: IStatementsRepository,
    @inject("UsersRepository")
    private userRepository: IUsersRepository
  ) {}
  async execute({
    user_sends,
    amount,
    description,
    user_receives,
  }: IRequest): Promise<Statement> {
    const userSends = this.userRepository.findById(user_sends);
    const userReceives = this.userRepository.findById(user_receives);

    if (!userSends) {
      throw new GetStatementOperationError.UserNotFound();
    }

    if (!userReceives) {
      throw new GetStatementOperationError.UserNotFound();
    }

    const account = await this.statementRepository.getUserBalance({
      user_id: user_sends,
      with_statement: true,
    });

    if (account.balance < amount) {
      throw new CreateStatementError.InsufficientFunds();
    }

    const typeReceives = "transfer" as OperationType;
    const typeSends = "withdraw" as OperationType;

    await this.statementRepository.create({
      user_id: user_sends,
      amount,
      description,
      type: typeSends,
    });

    const transferReceives = await this.statementRepository.create({
      user_id: user_receives,
      amount,
      description,
      type: typeReceives,
    });

    return transferReceives;
  }
}

export { CreateTransferUseCase };

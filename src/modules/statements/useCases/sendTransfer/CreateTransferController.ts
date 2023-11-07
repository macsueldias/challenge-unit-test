import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_sends } = request.user;
    const { user_receives } = request.params;
    const { amount, description } = request.body;

    const sendTransferUseCase = container.resolve(CreateTransferUseCase);

    const operation = sendTransferUseCase.execute({
      user_sends,
      user_receives,
      amount,
      description,
    });

    return response.json(operation);
  }
}

export { CreateTransferController };
